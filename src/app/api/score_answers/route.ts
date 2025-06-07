/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
  const { field, questions, answers }: { field: string; questions: string[]; answers: string[] } = body;

  if (!field || !Array.isArray(questions) || !Array.isArray(answers) || questions.length !== answers.length) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const evaluationPrompt = `
You are an RPL (Recognition of Prior Learning) evaluator.
For each question and its answer, give a score between 1 to 10 and a short feedback.

Return the result in JSON format like:
[
  {
    "question": "What is X?",
    "answer": "The answer",
    "score": 8,
    "feedback": "Well explained but missing technical term."
  }
]
`;

  const userInput = questions.map((q, i) => `Q: ${q}\nA: ${answers[i] ?? "[No Answer]"}`).join("\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: `${evaluationPrompt}\nQuestions and Answers:\n${userInput}` }],
    temperature: 0.4,
  });

  const resultRaw = completion.choices?.[0]?.message?.content ?? "[]";

  type EvaluationItem = {
    question: string;
    answer: string;
    score: number;
    feedback: string;
  };

  let evaluation: EvaluationItem[] = [];

  try {
    evaluation = JSON.parse(resultRaw);
  } catch (err) {
    console.error("Failed to parse evaluation:", resultRaw);
    return NextResponse.json({ error: "OpenAI output error" }, { status: 500 });
  }

  const scores = evaluation.map((e) => e.score);
  const feedback = evaluation.map((e) => e.feedback);

  const submission = await db.submission.create({
    data: {
      userId: session.user.id,
      phase: 1,
      field,
      questions,
      responses: answers,
      scores,
      feedback,
    },
  });

  return NextResponse.json({ success: true, submissionId: submission.id });
}
