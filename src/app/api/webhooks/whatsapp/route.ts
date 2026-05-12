import { NextResponse } from "next/server";
import { processWhatsAppMessage } from "@/app/actions/whatsapp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    console.log("📩 WhatsApp Webhook Received:", JSON.stringify(body, null, 2));

    // A Evolution API envia eventos. O que nos interessa é o 'messages.upsert'
    if (body.event !== "messages.upsert") {
      console.log(`ℹ️ Ignoring event type: ${body.event}`);
      return NextResponse.json({ ignored: true });
    }

    const messageData = body.data;
    const from = messageData.key.remoteJid.split("@")[0]; // Pega apenas o número
    const text = messageData.message?.conversation || 
                 messageData.message?.extendedTextMessage?.text;

    console.log(`📝 Message from ${from}: "${text}"`);

    if (!text) {
      console.log("⚠️ No text content found in message data");
      return NextResponse.json({ error: "No text content" }, { status: 400 });
    }

    // Processa a mensagem
    const result = await processWhatsAppMessage(from, text);

    // Retorna a resposta para que o integrador possa (opcionalmente) enviar de volta ao usuário
    // Nota: A Evolution API não envia a resposta automaticamente por aqui, 
    // teríamos que chamar a API deles para responder.
    return NextResponse.json(result);

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
