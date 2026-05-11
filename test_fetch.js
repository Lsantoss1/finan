
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

async function testDirectFetch() {
  if (!apiKey) return console.log("API Key não encontrada.");
  console.log("Testando fetch direto (v1/models/gemini-1.5-flash)...");
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Oi" }] }]
      })
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log("✅ Sucesso no Fetch Direto!", JSON.stringify(data).substring(0, 100));
    } else {
      console.log("❌ Erro no Fetch Direto:", JSON.stringify(data));
    }
  } catch (e) {
    console.error("Erro na requisição:", e.message);
  }
}

testDirectFetch();
