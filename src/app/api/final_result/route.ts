import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { env } from "~/env";
import { generateCertificate } from "~/lib/generateCertificate";

export async function GET(req: Request) {
  const session = await auth();
  const { origin } = new URL(req.url);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const evidenceRecords = await db.evidence.findMany({
      where: {
        userId: session.user.id,
        phase: 4,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!evidenceRecords.length) {
      return NextResponse.json([], { status: 200 });
    }

    const results = await Promise.all(
      evidenceRecords.map(async (evidence) => {
        let certificate = await db.certificate.findFirst({
          where: {
            evidenceId: evidence.id,
          },
          orderBy: { createdAt: "desc" },
        });

        // If score is high enough and no cert exists, create one
        if (evidence.overall_score >= env.PASS_THRESHOLD && !certificate) {
          certificate = await generateCertificate({
            userId: session.user.id,
            name: session.user.name ?? "Anonymous",
            field: evidence.field,
            walletAddress: session.user.walletAddress,
            origin: origin,
            evidenceId: evidence.id,
          });
        }

        return {
          id: evidence.id,
          field: evidence.field,
          scores: evidence.scores,
          justifications: evidence.justifications,
          overall_score: evidence.overall_score,
          feedback: evidence.feedback,
          questions: evidence.questions,
          responses: evidence.filenames,
          createdAt: evidence.createdAt,
          certificate: certificate
            ? {
                id: certificate.id,
                tokenId: certificate.tokenId,
                txHash: certificate.txHash,
                pdfUrl: certificate.pdfUrl,
                ipfsUrl: certificate.ipfsUrl,
              }
            : null,
        };
      })
    );

    return NextResponse.json(results);
  } catch (err) {
    console.error("Failed to fetch evidence results:", err);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
