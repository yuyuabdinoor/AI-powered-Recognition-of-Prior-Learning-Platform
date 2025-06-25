// src/utils/extractTextFromFile.ts
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';

async function extractTextFromPDF(fileBuffer: Buffer): Promise<string> {
    const data = await pdfParse(fileBuffer);
    return data.text;
}

async function extractTextFromImage(fileBuffer: Buffer): Promise<string> {
    const { data: { text } } = await Tesseract.recognize(fileBuffer);
    return text;
}

export async function extractTextFromFile(file: File): Promise<string> {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type;

    if (fileType === 'application/pdf') {
        return extractTextFromPDF(fileBuffer);
    } else if (fileType.startsWith('image/')) {
        return extractTextFromImage(fileBuffer);
    } else {
        throw new Error('Unsupported file type');
    }
}

