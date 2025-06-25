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

  // --- New User Verification Step ---
  // Verify that the user from the session exists in the database
  const userExists = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!userExists) {
    // If the user doesn't exist, it's a stale session. Force a logout.
    return NextResponse.json(
      { success: false, message: 'Stale session. Please log in again.' },
      { status: 401 }
    );
  }
  // --- End of New User Verification Step ---

  const formData = await req.formData();
  const field = (formData.get('field') as string) || 'Documents';
  const files = formData.getAll('files') as File[];

  if (!files.length) {
    return NextResponse.json({ success: false, message: 'No files received' }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });

  const uploadedFileNames: string[] = [];
  const filePaths: string[] = [];
  
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);
    uploadedFileNames.push(filename);
    filePaths.push(filePath);
  }

  // Step 1: Fetch all previous assessment evidence for the user
  const previousEvidence = await db.evidence.findMany({
    where: {
      userId: session.user.id,
      phase: { in: [1, 2, 3] } // Phases for Knowledge, Scenarios, Practical
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  // Combine assessment data and uploaded document text for the AI
  let combinedText = '';

  // Add text from previous phases
  previousEvidence.forEach((ev: { phase: number; field: string; questions: any; responses: any; }) => {
    combinedText += `--- Assessment Phase ${ev.phase} (${ev.field}) ---\n`;
    if (Array.isArray(ev.questions) && Array.isArray(ev.responses)) {
      ev.questions.forEach((q: string, index: number) => {
        combinedText += `Question: ${q}\nAnswer: ${ev.responses[index]}\n\n`;
      });
    }
  });

  // The text from uploaded files will be extracted by extractAndScore

  // Step 2: Create a new Evidence record for this final, holistic evaluation
  const finalEvidence = await db.evidence.create({
    data: {
      userId: session.user.id,
      phase: 4, // Signifies the final, combined assessment
      field,
      filenames: uploadedFileNames,
      questions: [],
      responses: [],
      scores: 0,
      feedback: '',
    },
  });

  // Step 3: Evaluate the combined evidence
  try {
    console.log('🎯 Starting holistic evaluation for field:', field);
    
    // Generic evaluation questions for the combined data
    const evaluationQuestions = [
      `Based on the entire assessment (knowledge, scenarios, practical) and supporting documents, what are the candidate's specific skills and competencies in ${field}?`,
      `How does the combined evidence align with ${field} industry standards and best practices?`,
      `What overall level of expertise and experience in ${field} is demonstrated?`,
      `What are the candidate's key strengths and areas for improvement in ${field}?`,
      `How well do the uploaded documents support the claims made in the assessments?`
    ];

    console.log('📋 Using holistic evaluation questions:', evaluationQuestions);
    
    // Pass the file paths and the combined text from previous phases
    const scoringResult = await extractAndScore(filePaths, evaluationQuestions, combinedText);
    console.log('📊 Holistic scoring result:', scoringResult);
    
    // Update the final evidence record with all scoring details
    await db.evidence.update({
      where: { id: finalEvidence.id },
      data: {
        questions: evaluationQuestions,
        scores: scoringResult.scores || [],
        justifications: scoringResult.justifications || [],
        overall_score: scoringResult.overall_score || 0,
        feedback: scoringResult.feedback || 'No feedback available',
      },
    });

    return NextResponse.json({ 
      success: true, 
      files: uploadedFileNames,
      scores: scoringResult,
      questions: evaluationQuestions
    });
  } catch (error) {
    console.error('❌ Error during holistic evaluation:', error);
    return NextResponse.json({ success: true, files: uploadedFileNames, message: "Files uploaded, but evaluation failed." });
  }
}

export const dynamic = 'force-dynamic';
