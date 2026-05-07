'use client';

/**
 * FinançasPro Hybrid Intelligence Service
 * Combina heurísticas locais avançadas com fallback para Gemini.
 */
export const AIService = {
  /**
   * Sugere uma categoria com base em um dicionário expandido de padrões
   */
  async predictCategory(description: string, categories: any[]) {
    const desc = description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const patterns: Record<string, string[]> = {
      'alimentacao': ['ifood', 'restaurante', 'mercado', 'pao de acucar', 'carrefour', 'mcdonalds', 'pizza', 'burger', 'comida', 'jantar', 'almoco', 'padaria', 'confeitaria', 'supermercado'],
      'transporte': ['uber', '99', 'posto', 'gasolina', 'estacionamento', 'metro', 'onibus', 'combustivel', 'shell', 'ipiranga', 'br', 'pedagio'],
      'lazer': ['netflix', 'spotify', 'cinema', 'show', 'viagem', 'hospedagem', 'airbnb', 'ingresso', 'steam', 'playstation', 'xbox', 'clube'],
      'saude': ['farmacia', 'hospital', 'medico', 'exame', 'drogaria', 'pague menos', 'unimed', 'odontoprev', 'laboratorio', 'clinica'],
      'moradia': ['aluguel', 'condominio', 'luz', 'agua', 'internet', 'enel', 'sabesp', 'reforma', 'mobiliario', 'tokstok', 'leroy'],
      'educacao': ['curso', 'faculdade', 'escola', 'livro', 'udemy', 'hotmart', 'mensalidade', 'material escolar'],
      'pessoal': ['corte', 'barba', 'salao', 'estetica', 'roupa', 'zara', 'renner', 'cea', 'presente'],
      'investimento': ['tesouro', 'acao', 'fundo', 'cdb', 'binance', 'nuinvest', 'corretora', 'dividendos']
    };

    for (const [catName, keywords] of Object.entries(patterns)) {
      if (keywords.some(k => desc.includes(k))) {
        const found = categories.find(c => 
          c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(catName)
        );
        if (found) return found.id;
      }
    }

    return null;
  },

  /**
   * Gera insights financeiros profundos usando lógica algorítmica (IA Local)
   */
  generateInsight(stats: { balance: number; income: number; expense: number }) {
    const { balance, income, expense } = stats;
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
    const expenseRatio = income > 0 ? (expense / income) * 100 : 0;

    const insights = [];

    // Lógica de Saldo
    if (balance < 0) {
      insights.push("Seu saldo está no vermelho. Evite novas compras no crédito e priorize pagar o essencial.");
    } else if (balance < income * 0.1) {
      insights.push("Atenção: sua reserva de segurança está muito baixa para o seu nível de renda.");
    }

    // Lógica de Gastos vs Receitas
    if (expense > income) {
      insights.push("Alerta Crítico: Você está gastando mais do que ganha. É necessário cortar gastos não essenciais imediatamente.");
    } else if (expenseRatio > 80) {
      insights.push("Seus custos fixos e variáveis estão consumindo quase toda sua renda (mais de 80%). Tente reduzir 10% em cada categoria.");
    }

    // Lógica de Poupança
    if (savingsRate >= 30) {
      insights.push("Parabéns! Sua taxa de poupança está acima de 30%. Você está no caminho rápido para a independência financeira.");
    } else if (savingsRate >= 10) {
      insights.push("Bom trabalho. Você está conseguindo poupar. Que tal tentar chegar aos 20% no próximo mês?");
    } else if (income > 0) {
      insights.push("Tente guardar pelo menos 10% do que ganha logo no início do mês (metodologia 'Pague-se Primeiro').");
    }

    // Insight Aleatório Dinâmico (Simula pensamento da IA)
    const randomTips = [
      "Dica: Pequenos gastos diários (cafézinhos, lanches) podem somar mais de R$ 300 no fim do mês.",
      "Lembrete: Revise suas assinaturas de streaming. Tem algo que você não usa há mais de 30 dias?",
      "Estratégia: Use a regra 50-30-20 (Essencial, Lazer, Investimento) para equilibrar sua vida.",
      "Dica: Compras por impulso costumam perder o brilho em 24h. Espere um dia antes de fechar o carrinho."
    ];

    const finalInsight = insights.length > 0 
      ? insights[Math.floor(Math.random() * insights.length)] 
      : randomTips[Math.floor(Math.random() * randomTips.length)];

    return finalInsight;
  }
};
