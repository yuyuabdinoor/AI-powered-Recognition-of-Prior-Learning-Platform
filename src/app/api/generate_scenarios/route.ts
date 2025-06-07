/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { env } from "~/env";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { field } = await req.json();

  const prompt = `Generate 5 scenario-based questions for the NITA field "${field}".
Respond strictly as a JSON array of objects with this format:
[
  { "question": "Your scenario question here", "competencyId": "FIELD-SCENARIO-001" }
]`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
  });

  const content = completion.choices[0]?.message?.content ?? "[]";

  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
    if (!Array.isArray(parsed) || !parsed.every(item =>
      typeof item === "object" &&
      item !== null &&
      "question" in item &&
      "competencyId" in item &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      typeof item.question === "string" &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      typeof item.competencyId === "string"
    )) {
      throw new Error("Invalid format in AI response");
    }
  } catch (err) {
    console.error("Error parsing scenario questions:", content);
    return NextResponse.json({ error: "Failed to parse questions", raw: content }, { status: 500 });
  }

  return NextResponse.json({ questions: parsed });
}
