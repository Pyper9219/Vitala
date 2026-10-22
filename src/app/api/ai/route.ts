import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!openai.apiKey) {
      return NextResponse.json(
        {
          reply:
            "AI features require an OpenAI API key. Please set OPENAI_API_KEY in your environment variables to enable the wellness assistant.",
        },
        { status: 200 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are Vitala, a friendly and knowledgeable wellness assistant. You help users with personalized meal plans, workout routines, shopping lists, and general wellness advice. Be encouraging, practical, and concise. When suggesting meal plans or workouts, consider common dietary preferences and budget-conscious options. Always include a brief disclaimer that you're not a medical professional and users should consult a healthcare provider for medical advice.`,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const reply = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("AI API error:", err);
    return NextResponse.json(
      { reply: "Sorry, I'm having trouble generating a response right now. Please try again later." },
      { status: 500 }
    );
  }
}