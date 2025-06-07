 
 
 
 

import { NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { db } from '~/server/db';
import { extractAndScore } from '~/utils/extract_and_score';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const field = (formData.get('field') as string) || 'Documents';
  const files = formData.getAll('files') as File[];

  if (!files.length) {
    return NextResponse.json({ success: false, message: 'No files received' }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });

  const uploadedFileNames: string[] = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    await fs.writeFile(path.join(uploadDir, filename), buffer);
    uploadedFileNames.push(filename);
  }

  // Step 1: Save Evidence to DB
  const evidence = await db.evidence.create({
    data: {
      userId: session.user.id,
      phase: 0,
      field,
      filenames: uploadedFileNames,
      questions: [],
      responses: uploadedFileNames,
      scores: 0,
      feedback: '',
    },
  });

  // Step 2: Score the evidence directly using local util
  await extractAndScore(evidence.id);

  return NextResponse.json({ success: true, files: uploadedFileNames });
}

export const dynamic = 'force-dynamic';
