import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

type Message = { role: 'user' | 'ai'; content: string; };

export async function POST(req: Request) {
  try {
    // AHORA RECIBIMOS 'githubUrl' TAMBIÉN
    const { history, message, context, mode, details, githubUrl } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey!);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    let systemInstruction = "";

    if (mode === 'job') {
      systemInstruction = `Actúa como entrevistador para: "${context}". Evalúa al candidato.`;
    } else {
      // --- PERSONALIDAD PROFESOR MEJORADA ---
      systemInstruction = `
        Actúa como un Profesor estricto evaluando el Proyecto Final: "${context}".
        
        INFORMACIÓN DEL PROYECTO:
        - Repositorio: ${githubUrl || "No proporcionado"}
        - Detalles Técnicos / Código: "${details}"

        Tus objetivos:
        1. Si el alumno proporcionó código en los detalles, ¡ANALÍZALO! Busca malas prácticas.
        2. Si hay URL de GitHub, pregunta sobre la estructura del repositorio (asume que lo has visto).
        3. Cuestiona la arquitectura.
        4. Sé riguroso.
      `;
    }

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemInstruction }] },
        { role: "model", parts: [{ text: `Entendido. Modo ${mode} activado.` }] },
        ...history.map((msg: Message) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        })),
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error server" }, { status: 500 });
  }
}