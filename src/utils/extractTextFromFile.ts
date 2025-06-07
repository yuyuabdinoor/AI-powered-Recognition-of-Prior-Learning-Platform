// src/utils/extractTextFromFile.ts
import Tesseract from 'tesseract.js';

export async function extractTextFromImage(filepath: string): Promise<string> {
  try {
    const result = await Tesseract.recognize(filepath, 'eng');
    return result.data.text;
  } catch (error) {
    console.error(`OCR failed for ${filepath}`, error);
    return '';
  }
}

