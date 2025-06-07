 
 
 
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch latest evidence assessment for the user
    const evidence = await db.evidence.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    });

    if (!evidence) {
      return NextResponse.json(null, { status: 404 });
    }

    // Try to find a Certificate anchored for this field & user
    const certificate = await db.certificate.findFirst({
      where: { userId: session.user.id, /* optionally: field: evidence.field */ },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      field: evidence.field,
      scores: [evidence.scores],         // Expect array for compatibility
      feedback: [evidence.feedback],
      responses: evidence.filenames,     // This is your uploaded files
      createdAt: evidence.createdAt,
      // Blockchain fields (can be undefined if not anchored)
      tokenId: certificate?.tokenId ?? null,
      txHash: certificate?.txHash ?? null,
      pdfUrl: certificate?.pdfUrl ?? null,
    });
  } catch (err) {
    console.error("Failed to fetch evidence result:", err);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
