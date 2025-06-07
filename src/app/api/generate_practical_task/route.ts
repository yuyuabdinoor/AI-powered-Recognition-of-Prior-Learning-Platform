/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { env } from "~/env";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { field } = await req.json();

  const prompt = `
You are an RPL assessor working under Kenya NITA. 
Generate ONE practical task a learner in "${field}" should do to prove competence. 
Only return JSON: 
{
  "question": "Task instruction.",
  "competencyId": "FIELD-PRACTICAL-001"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const result = completion.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(result);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return NextResponse.json({ question: parsed.question, competencyId: parsed.competencyId });
  } catch (error) {
    console.error("Practical generation failed:", error);
    return NextResponse.json({ question: "Upload a sample of your recent work." });
  }
}
