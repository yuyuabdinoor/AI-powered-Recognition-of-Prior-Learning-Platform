/* eslint-disable @typescript-eslint/no-unsafe-assignment */
 
 
import { NextResponse } from 'next/server';
import { db } from '../../../server/db';
import { extractAndScore } from '~/utils/extract_and_score';



export async function POST(req: Request) {
  const internalSecret = req.headers.get('x-internal-secret');
  if (internalSecret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { evidenceId } = await req.json();
  if (!evidenceId) {
    return NextResponse.json({ error: 'Missing evidenceId' }, { status: 400 });
  }

  // Fetch the evidence
  const evidence = await db.evidence.findUnique({ where: { id: evidenceId } });
  if (!evidence?.filenames.length) {
    return NextResponse.json({ error: 'Evidence not found or no files' }, { status: 404 });
  }

  try {
    // Run scoring + feedback logic
     
    const result = await extractAndScore(evidence.id);

    // Update the evidence entry
    await db.evidence.update({
      where: { id: evidence.id },
      data: {
        scores: result.score,
        feedback: result.feedback,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Scoring failed:', err);
    return NextResponse.json({ error: 'Scoring failed' }, { status: 500 });
  }
}
