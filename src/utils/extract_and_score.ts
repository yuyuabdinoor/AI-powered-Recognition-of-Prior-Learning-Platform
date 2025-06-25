// src/server/extract_and_score.ts
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
 
 

import { db } from '~/server/db';
import { OpenAI } from 'openai';
import fs from 'fs/promises';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function extractTextFromFile(filePath: string): Promise<string> {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const fileType = path.extname(filePath).toLowerCase();

    if (fileType === '.pdf') {
      try {
        // Temporarily return a placeholder for PDF files to avoid the test file issue
        return `PDF file content placeholder for: ${path.basename(filePath)}`;
        
        // Uncomment below when pdf-parse issue is resolved
        // const pdfParse = require('pdf-parse');
        // const data = await pdfParse(fileBuffer);
        // return data.text || 'No text extracted from PDF';
      } catch (error) {
        console.error('Error parsing PDF:', error);
        return `Error parsing PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    } else if (['.jpg', '.jpeg', '.png'].includes(fileType)) {
      try {
        // Use require instead of import to avoid module resolution issues
        const Tesseract = require('tesseract.js');
        const { data: { text } } = await Tesseract.recognize(fileBuffer, 'eng', {
        });
        return text || 'No text extracted from image';
      } catch (error) {
        console.error('Error parsing image:', error);
        return `Error parsing image file: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }
    return `Unsupported file type: ${fileType}`;
  } catch (error) {
    console.error('Error reading file:', error);
    return `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

export async function extractAndScore(
  filePaths: string[],
  questions: string[],
  previousEvidenceText = '' // Optional parameter for pre-existing text
): Promise<any> {
  console.log('🔍 Starting extractAndScore with questions:', questions);
  
  let combinedText = previousEvidenceText ? `${previousEvidenceText}\n\n--- Uploaded Documents ---\n\n` : '';

  for (const filePath of filePaths) {
    const absolutePath = path.resolve(filePath);
    const extractedText = await extractTextFromFile(absolutePath);
    combinedText += extractedText + '\n\n';
    console.log('📄 Extracted text from', path.basename(filePath), ':', extractedText.substring(0, 100) + '...');
  }

  console.log('📝 Combined text length:', combinedText.length);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an AI assistant that scores a user's prior learning evidence based on a set of questions. Analyze the provided text and score each question from 1 to 10. Also, provide a justification for each score and overall feedback. The user has provided the following evidence: ${combinedText}`,
      },
      {
        role: 'user',
        content: `Please score my evidence based on the following questions: ${JSON.stringify(questions)}. 
        
        IMPORTANT: Respond ONLY with a valid JSON object in this exact format:
        {
          "scores": [number, number, number...],
          "justifications": ["string", "string", "string..."],
          "overall_score": number,
          "feedback": "string"
        }
        
        Do not include any other text or explanations outside the JSON object.`,
      },
    ],
  });

  const analysis = response.choices[0]?.message?.content;
  console.log('🤖 Raw AI response:', analysis);
  
  if (!analysis) {
    throw new Error('Failed to get analysis from OpenAI');
  }

  // Try to parse the response as JSON
  try {
    // Clean the response to extract only JSON
    const jsonMatch = analysis.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully parsed JSON response:', parsed);
      return parsed;
    }
    const parsed = JSON.parse(analysis);
    console.log('✅ Successfully parsed direct JSON response:', parsed);
    return parsed;
  } catch (error) {
    console.error('❌ Failed to parse OpenAI response:', error);
    console.error('📝 Raw response that failed to parse:', analysis);
    
    // Return a structured fallback response
    const fallback = {
      scores: questions.map(() => 5), // Default score of 5 for each question
      justifications: questions.map(() => 'Unable to parse AI response'),
      overall_score: 5,
      feedback: 'AI response parsing failed. Please review manually.',
      raw_response: analysis
    };
    console.log('🔄 Returning fallback response:', fallback);
    return fallback;
  }
}
