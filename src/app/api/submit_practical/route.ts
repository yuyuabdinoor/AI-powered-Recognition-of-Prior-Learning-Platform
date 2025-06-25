import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const field = formData.get("field") as string;
  const notes = formData.get("notes") as string;
  const question = formData.get("question") as string;
  const files = formData.getAll("file") as File[];

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const fileNames: string[] = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);
    fileNames.push(filename);
  }

  await db.evidence.create({
    data: {
      userId: session.user.id,
      phase: 3, // Practical Submission
      field,
      questions: [question],
      responses: fileNames, // Store uploaded filenames
      scores: [], // No AI scoring at this stage
      feedback: notes || "", // Store user's notes
    },
  });

  return NextResponse.json({ success: true, uploaded: fileNames, field, question });
}
export const dynamic = "force-dynamic"; // Ensure this route is always fresh
export const revalidate = 0; // Disable caching for this route