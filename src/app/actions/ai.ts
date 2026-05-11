'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function askGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: "Gemini API Key não configurada no .env.local" };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return { text: response.text() };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    // Retornando o erro real para sabermos o que corrigir
    return { error: `Erro na IA: ${error.message || "Falha desconhecida"}` };
  }
}

export async function analyzeFinancialState(data: any) {
  const prompt = `
    Você é um Coach Financeiro de elite. Analise os seguintes dados financeiros e forneça 3 insights acionáveis, curtos e motivadores.
    Dados: ${JSON.stringify(data)}
    
    Formato de resposta:
    1. Insight 1
    2. Insight 2
    3. Insight 3
    
    Seja direto e use um tom profissional porém amigável.
  `;
  
  return askGemini(prompt);
}

export async function parseBankStatement(text: string) {
  const prompt = `
    Analise o seguinte texto de extrato bancário e extraia as transações.
    Para cada transação identifique: Data (AAAA-MM-DD), Descrição, Valor (número), Tipo (expense ou income).
    
    Retorne APENAS um array JSON válido.
    Exemplo: [{"date": "2024-05-10", "description": "Uber", "amount": 25.50, "type": "expense"}]
    
    Texto: ${text}
  `;
  
  return askGemini(prompt);
}

export async function parseWhatsAppMessage(text: string) {
  const prompt = `
    Você é um assistente financeiro inteligente. Analise a seguinte mensagem de WhatsApp e extraia os dados de uma transação financeira.
    Identifique:
    - Descrição (curta e limpa)
    - Valor (apenas o número)
    - Tipo (expense para gastos/saídas ou income para ganhos/entradas)
    - Categoria Sugerida (um dos seguintes: Alimentação, Transporte, Lazer, Saúde, Moradia, Educação, Pessoal, Investimento, Outros)

    Mensagem: "${text}"

    Retorne APENAS um objeto JSON válido no formato:
    {"description": "string", "amount": number, "type": "expense" | "income", "category": "string"}
    Se não conseguir identificar os dados, retorne {"error": "Não entendi os dados da transação"}.
  `;

  const result = await askGemini(prompt);
  if (result.error) return result;

  try {
    // Limpa a resposta do Gemini (remove markdown se houver)
    const cleanJson = result.text!.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    return { error: "Erro ao processar a resposta da IA" };
  }
}
