const fs = require('fs');

async function getQrCode() {
  try {
    console.log('⏳ Tentando extrair o QR Code da instância já criada...');
    const response = await fetch('https://evolution-api-financas.onrender.com/instance/connect/financas_bot_direto', {
      method: 'GET',
      headers: {
        'apikey': 'financasproo-secret-key-2026'
      }
    });

    const data = await response.json();

    if (data && data.base64) {
      console.log('✅ QR Code capturado com sucesso no segundo pulo!');
      
      const htmlContent = `
        <html>
        <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #1a202c; color: white; font-family: sans-serif;">
          <h1>Escaneie seu QR Code! 🚀</h1>
          <p>O servidor demorou, mas conseguimos capturar a imagem.</p>
          <img src="${data.base64}" style="border: 10px solid white; border-radius: 10px; width: 300px; height: 300px;" />
        </body>
        </html>
      `;

      fs.writeFileSync('meu_qr_code.html', htmlContent);
      console.log('🎉 Abra o arquivo "meu_qr_code.html" na raiz do seu projeto no navegador!');
    } else {
      console.log('❌ Ainda sem QR Code. Resposta da API:', data);
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

getQrCode();
