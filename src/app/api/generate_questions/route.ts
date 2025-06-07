/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /src/app/api/generate_questions/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  const { field } = await req.json();

  const prompt = `Generate 8 knowledge-based questions for assessing skills in the NITA field of "${field}". 
Each question should target a specific subfield such as "SAFETY", "TOOLS", "TECHNIQUE", etc. 
Format the response as a JSON array like:
[
  { 
    "question": "...", 
    "competencyId": "FIELD-SUBFIELD-001" 
  },
  ...
]`;


  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const content = completion.choices[0]?.message.content;

  try {
    const parsed = JSON.parse(content ?? "[]");
    return NextResponse.json({ questions: parsed });
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response", content },
      { status: 500 }
    );
  }
}
