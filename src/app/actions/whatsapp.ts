'use server';

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { parseWhatsAppMessage } from "./ai";

export async function processWhatsAppMessage(from: string, text: string) {
  const supabaseAdmin = getSupabaseAdmin();
  // 1. Identificar o usuário pelo número de WhatsApp
  // Remove caracteres não numéricos para garantir comparação limpa
  const cleanNumber = from.replace(/\D/g, "");
  
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .filter('whatsapp_number', 'ilike', `%${cleanNumber}%`)
    .single();

  if (profileError || !profile) {
    console.error("Usuário não encontrado para o número:", cleanNumber);
    return { error: "Usuário não vinculado. Configure seu número no perfil do FinançasPro." };
  }

  const userId = profile.id;

  // 2. Processar a mensagem com a IA Gemini
  const aiResult = await parseWhatsAppMessage(text);
  if (aiResult.error) return aiResult;

  // 3. Buscar ou Sugerir Categoria
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('id, name')
    .eq('user_id', userId)
    .ilike('name', `%${aiResult.category}%`);

  const categoryId = categories && categories.length > 0 ? categories[0].id : null;

  // 4. Buscar Conta Padrão (Primeira conta ativa)
  const { data: accounts } = await supabaseAdmin
    .from('accounts')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .limit(1);

  if (!accounts || accounts.length === 0) {
    return { error: "Nenhuma conta ativa encontrada para salvar a transação." };
  }

  const accountId = accounts[0].id;

  // 5. Salvar a Transação
  const { error: saveError } = await supabaseAdmin
    .from('transactions')
    .insert({
      user_id: userId,
      account_id: accountId,
      category_id: categoryId,
      amount: aiResult.amount,
      description: aiResult.description,
      type: aiResult.type,
      date: new Date().toISOString().split('T')[0],
      tags: ['whatsapp']
    });

  if (saveError) {
    console.error("Erro ao salvar transação via WhatsApp:", saveError);
    return { error: "Erro ao registrar a transação no banco de dados." };
  }

  return { 
    success: true, 
    data: aiResult,
    message: `✅ *Registrado:* ${aiResult.description}\n💰 *Valor:* R$ ${aiResult.amount.toLocaleString('pt-BR')}\n📂 *Categoria:* ${aiResult.category}`
  };
}
