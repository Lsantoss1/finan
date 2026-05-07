
const fs = require("fs");

// Load env
let apiKey = "";
try {
  const env = fs.readFileSync(".env.local", "utf8");
  env.split("\n").forEach(line => {
    const [key, val] = line.split("=");
    if (key?.trim() === "GEMINI_API_KEY") apiKey = val.trim();
  });
} catch (e) {}

async function listAllModels() {
  if (!apiKey) return console.log("API Key não encontrada.");
  console.log("Listando todos os modelos permitidos para esta chave...");
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log("Modelos encontrados:", data.models?.map(m => m.name).join(", ") || "Nenhum");
    } else {
      console.log("❌ Erro ao listar modelos:", JSON.stringify(data));
    }
  } catch (e) {
    console.error("Erro na requisição:", e.message);
  }
}

listAllModels();
