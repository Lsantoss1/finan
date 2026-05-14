const fs = require('fs');

async function getQrCode() {
  try {
    console.log('⏳ Conectando diretamente à Evolution API...');
    const response = await fetch('https://evolution-api-financas.onrender.com/instance/create', {
      method: 'POST',
      headers: {
        'apikey': 'financasproo-secret-key-2026',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instanceName: 'financas_bot_direto',
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS'
      })
    });

    const data = await response.json();

    if (data && data.qrcode && data.qrcode.base64) {
      console.log('✅ QR Code capturado com sucesso!');
      
      const htmlContent = `
        <html>
        <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #1a202c; color: white; font-family: sans-serif;">
          <h1>Escaneie seu QR Code! 🚀</h1>
          <p>Gerado com sucesso ignorando o Gerenciador.</p>
          <img src="${data.qrcode.base64}" style="border: 10px solid white; border-radius: 10px; width: 300px; height: 300px;" />
        </body>
        </html>
      `;

      fs.writeFileSync('meu_qr_code.html', htmlContent);
      console.log('🎉 Abra o arquivo "meu_qr_code.html" na raiz do seu projeto no navegador!');
    } else {
      console.log('❌ O servidor retornou, mas não enviou a imagem base64:', data);
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com a API:', error);
  }
}

getQrCode();
