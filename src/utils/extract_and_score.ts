 
// src/server/extract_and_score.ts
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
 
 

import { db } from '~/server/db';
import { OpenAI } from 'openai';
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import fs from 'fs/promises';
import path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function extractAndScore(evidenceId: string) {
  const evidence = await db.evidence.findUnique({ where: { id: evidenceId } });
  if (!evidence) throw new Error('Evidence not found');

  let extractedText = '';

  for (const filename of evidence.filenames) {
    const ext = filename.split('.').pop()?.toLowerCase();
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
    const fileBuffer = await fs.readFile(filePath);

    if (ext === 'pdf') {
      const pdfData = await pdfParse(fileBuffer);
      extractedText += `\n${pdfData.text}`;
    } else if (['jpg', 'jpeg', 'png'].includes(ext ?? '')) {
      const result = await Tesseract.recognize(fileBuffer, 'eng');
      extractedText += `\n${result.data.text}`;
    } else {
      extractedText += `\n[Unsupported file type: ${filename}]`;
    }
  }

  const prompt = `
You are a certified assessor for Recognition of Prior Learning. Assess the following extracted evidence documents for the field "${evidence.field}" using official NITA/KNQA competency standards.

Extracted document content:
--------------------
${extractedText.slice(0, 3000)}
--------------------

Your assessment must consider:
- **Relevance**: Is the evidence directly related to the required skills and competencies in "${evidence.field}" as per NITA/KNQA?
- **Quality**: Is the evidence clear, authentic, and does it convincingly demonstrate the candidate’s competence?
- **Sufficiency & Validity**: Is there enough credible evidence to match the key competency areas?
- **Authenticity**: Can you reasonably infer the evidence truly represents the candidate's work?

Be strict and objective. If the evidence is irrelevant, insufficient, out-of-date, or unreadable, assign a score of 1 or 2 and explain why. Only award 9 or 10 if the evidence fully aligns with all key NITA/KNQA competencies and is of high quality.

**Return ONLY this JSON object and nothing else:**
{
  "score": (integer 1–10, where 1 = not relevant or poor quality, 10 = fully matches competency standards),
  "feedback": (brief, honest, competency-based explanation—if the score is low, clearly state which standard(s) are unmet)
}
If no readable or relevant evidence is found, score 1 or 2 and say so in feedback.

Do not include any text or explanation outside the JSON.
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  const raw = completion.choices?.[0]?.message?.content ?? '{}';

  let result: { score: number; feedback: string } = { score: 0, feedback: '' };
  try {
    result = JSON.parse(raw);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    console.error('Failed to parse AI response:', raw);
    result.feedback = 'AI response could not be parsed. Check input quality.';
  }

  await db.evidence.update({
    where: { id: evidenceId },
    data: {
      scores: result.score,
      feedback: result.feedback,
    },
  });

  return result;
}
