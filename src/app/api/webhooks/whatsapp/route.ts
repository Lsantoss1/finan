import { NextResponse } from "next/server";
import { processWhatsAppMessage } from "@/app/actions/whatsapp";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    let from = '';
    let text = '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const textBody = await req.text();
      const params = new URLSearchParams(textBody);
      from = params.get('From') || '';
      text = params.get('Body') || '';
    } else {
      const body = await req.json();
      from = body.From || '';
      text = body.Body || '';
    }

    console.log(`📩 Twilio Webhook Received - From: ${from}, Body: "${text}"`);

    if (!text || !from) {
      console.log("⚠️ No text or sender found in message data");
      return new NextResponse("No text content", { status: 400 });
    }

    // Processa a mensagem
    const result = await processWhatsAppMessage(from, text);

    // O Twilio lê respostas em XML (TwiML) para saber o que responder no WhatsApp
    let twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>\n<Response></Response>`;
    
    if (result && result.message) {
      // Se processou com sucesso ou erro, envia a mensagem de volta pro WhatsApp da pessoa
      twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>${result.message}</Message>
</Response>`;
    } else if (result && result.error) {
      twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>❌ ${result.error}</Message>
</Response>`;
    }

    return new NextResponse(twimlResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });

  } catch (error) {
    console.error("Webhook Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
