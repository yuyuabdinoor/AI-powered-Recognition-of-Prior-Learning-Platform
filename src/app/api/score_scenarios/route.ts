/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { env } from "~/env";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { field, questions, responses }: { field: string; questions: string[]; responses: string[] } = body;

  const prompt = `
You are an RPL assessor. Evaluate each scenario-based response.
Score each answer from 1 to 10 and give feedback.

Return a JSON array of objects with this format:
{
  "question": "...",
  "answer": "...",
  "score": 8,
  "feedback": "Good reasoning but missed one step."
}
`;

  const formattedInput = questions.map((q, i) => `Q: ${q}\nA: ${responses[i]}`).join("\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: `${prompt}\n\n${formattedInput}` }],
    temperature: 0.3,
  });

  const raw = completion.choices?.[0]?.message?.content ?? "[]";

  let evaluation: { question: string; answer: string; score: number; feedback: string }[] = [];

  try {
    evaluation = JSON.parse(raw);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    console.error("Failed to parse evaluation response:", raw);
    return NextResponse.json({ error: "Parsing error from OpenAI" }, { status: 500 });
  }

  const scores = evaluation.map((e) => e.score);
  const feedback = evaluation.map((e) => e.feedback);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const submission = await db.submission.create({
    data: {
      userId: session.user.id,
      phase: 2,
      field,
      questions,
      responses,
      scores,
      feedback,
    },
  });

  return NextResponse.json({ success: true, submissionId: submission.id });
}
