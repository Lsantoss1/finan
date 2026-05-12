'use server';

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { parseWhatsAppMessage } from "./ai";

export async function processWhatsAppMessage(from: string, text: string) {
  const supabaseAdmin = getSupabaseAdmin();
  // 1. Identificar o usuário pelo número de WhatsApp
  // Remove caracteres não numéricos para garantir comparação limpa
  const cleanNumber = from.replace(/\D/g, "");
  console.log(`🔍 Identifying user for number: ${cleanNumber} (from: ${from})`);
  
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, name')
    .filter('whatsapp_number', 'ilike', `%${cleanNumber}%`)
    .single();

  if (profileError || !profile) {
    console.error("❌ User not found in database for number:", cleanNumber);
    if (profileError) console.error("Database Error:", profileError);
    return { error: "Usuário não vinculado. Configure seu número no perfil do FinançasPro." };
  }

  const userId = profile.id;
  console.log(`👤 User identified: ${userId}`);

  // 2. Processar a mensagem com a IA Gemini
  console.log("🧠 Sending to Gemini for parsing...");
  const aiResult = await parseWhatsAppMessage(text);
  if (aiResult.error) {
    console.error("❌ Gemini parsing error:", aiResult.error);
    return aiResult;
  }
  console.log("✅ Gemini Result:", JSON.stringify(aiResult));

  // 3. Buscar ou Sugerir Categoria
  console.log(`📂 Searching for category: ${aiResult.category}`);
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('id, name')
    .eq('user_id', userId)
    .ilike('name', `%${aiResult.category}%`);

  const categoryId = categories && categories.length > 0 ? categories[0].id : null;
  console.log(categoryId ? `✅ Category found: ${categories![0].name} (${categoryId})` : "ℹ️ Category not found, using null");

  // 4. Buscar Conta Padrão (Primeira conta ativa)
  console.log("💳 Fetching default account...");
  const { data: accounts } = await supabaseAdmin
    .from('accounts')
    .select('id, name')
    .eq('user_id', userId)
    .eq('is_active', true)
    .limit(1);

  if (!accounts || accounts.length === 0) {
    console.error("❌ No active accounts found for user");
    return { error: "Nenhuma conta ativa encontrada para salvar a transação." };
  }

  const accountId = accounts[0].id;
  console.log(`✅ Using account: ${accounts[0].name} (${accountId})`);

  // 5. Salvar a Transação
  console.log("💾 Saving transaction to Supabase...");
  const transactionData = {
    user_id: userId,
    account_id: accountId,
    category_id: categoryId,
    amount: aiResult.amount,
    description: aiResult.description,
    type: aiResult.type,
    date: new Date().toISOString().split('T')[0],
    tags: ['whatsapp']
  };

  const { error: saveError } = await supabaseAdmin
    .from('transactions')
    .insert(transactionData);

  if (saveError) {
    console.error("❌ Error saving transaction:", saveError);
    return { error: "Erro ao registrar a transação no banco de dados." };
  }

  console.log("🚀 Transaction saved successfully!");
  return { 
    success: true, 
    data: aiResult,
    message: `✅ *Registrado:* ${aiResult.description}\n💰 *Valor:* R$ ${aiResult.amount.toLocaleString('pt-BR')}\n📂 *Categoria:* ${aiResult.category}`
  };
}
