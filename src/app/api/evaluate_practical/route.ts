/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { imageUrls, practicalQuestion, field } = await req.json();

  if (!Array.isArray(imageUrls) || !imageUrls.length || !practicalQuestion || !field) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Step 1: Feedback for each image
    const feedbacks = await Promise.all(
      imageUrls.map(async (url: string) => {
        const visionRes = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Evaluate this uploaded image for the field "${field}" based on the practical task:\n\n"${practicalQuestion}".`,
                },
                {
                  type: "image_url",
                  image_url: { url },
                },
              ],
            },
          ],
        });

        const feedback = visionRes.choices?.[0]?.message?.content ?? "No feedback";
        return feedback.trim();
      })
    );

    console.log("✅ Feedbacks from GPT Vision:", feedbacks);

    // Step 2: Scoring via GPT
    const scorePrompt = `The following are AI-generated feedback responses for uploaded practical tasks in the field "${field}":\n\n${feedbacks.join(
      "\n\n"
    )}\n\nBased on this, give a score between 1 and 10 with a short reason. Respond ONLY as JSON:\n\n{ "score": 7, "summary": "..." }`;

    const scoreRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: scorePrompt }],
    });

    const scoreJson = scoreRes.choices?.[0]?.message?.content ?? "{}";
    console.log("✅ Raw GPT Score JSON:", scoreJson);

    let result: { score: number; summary: string } = { score: 0, summary: "No summary" };
    try {
      result = JSON.parse(scoreJson);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      console.error("❌ Failed to parse JSON:", scoreJson);
      return NextResponse.json({ error: "Failed to parse GPT response" }, { status: 500 });
    }

    console.log("✅ Parsed Result:", result);

    // Step 3: Update database
    const existingSubmission = await db.submission.findFirst({
      where: {
        userId: session.user.id,
        phase: 3,
      },
    });

    if (!existingSubmission) {
      return NextResponse.json(
        { error: "No matching Phase 3 submission found." },
        { status: 404 }
      );
    }

    const updated = await db.submission.update({
      where: { id: existingSubmission.id },
      data: {
        scores: [...(existingSubmission.scores ?? []), result.score],
        feedback: [...(existingSubmission.feedback ?? []), ...feedbacks],
      },
    });

    console.log("✅ Submission updated:", updated.id);

    return NextResponse.json({
      score: result.score,
      summary: result.summary,
      feedback: feedbacks,
    });
  } catch (err) {
    console.error("❌ General error in evaluation route:", err);
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic"; // Ensure this route is always fresh