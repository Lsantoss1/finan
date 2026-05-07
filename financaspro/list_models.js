
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

// Load env
try {
  const env = fs.readFileSync(".env.local", "utf8");
  env.split("\n").forEach(line => {
    const [key, val] = line.split("=");
    if (key && val) process.env[key.trim()] = val.trim();
  });
} catch (e) {}

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return console.log("API Key não encontrada.");
  
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    // Note: The JS SDK doesn't have a direct listModels, we have to use the fetch API or just try common names
    console.log("Tentando descobrir modelos disponíveis...");
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.5-flash-latest"];
    
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        await model.generateContent("test");
        console.log(`✅ Modelo disponível: ${m}`);
      } catch (e) {
        console.log(`❌ Modelo indisponível: ${m} (${e.message.split('\n')[0]})`);
      }
    }
  } catch (error) {
    console.error("Erro ao listar:", error);
  }
}

listModels();
