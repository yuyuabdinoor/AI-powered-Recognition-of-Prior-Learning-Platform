// src/lib/fillCertificate.ts
import fs from 'fs/promises';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface FillData {
  name: string;
  date: string;
  id?: string;
  field?: string;
}

export async function fillCertificate(data: FillData): Promise<Buffer> {
  const { name, date, id, field } = data;

  // 1) Load your blank template
  const templatePath = path.join(
    process.cwd(),
    'public',
    'templates',
    'certificate_template.pdf'
  );
  const templateBytes = await fs.readFile(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);

  // 2) Grab the first page
  const page = pdfDoc.getPage(0);
  const { width, height } = page.getSize();

  // 3) Embed fonts
  const nameFont   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Recipient's Name - positioned to fit under "proudly presented to"
  const nameSize  = 36;
  const nameWidth = nameFont.widthOfTextAtSize(name, nameSize);
  page.drawText(name, {
    x: (width - nameWidth) / 2,
    y: height / 2 - 25, // Adjusted for the template layout
    size: nameSize,
    font: nameFont,
    color: rgb(0, 0, 0),
  });

  // "for completing the..." text
  if (field) {
    const completionText = `for completing the ${field} course on the RPL Platform`;
    const completionTextSize = 12;
    const completionTextWidth = regularFont.widthOfTextAtSize(completionText, completionTextSize);
    page.drawText(completionText, {
      x: (width - completionTextWidth) / 2,
      y: height / 2 - 80, // Positioned below the name
      size: completionTextSize,
      font: regularFont,
      color: rgb(0.2, 0.2, 0.2),
    });
  }

  // Date in the top-right
  page.drawText(`Date: ${date}`, {
    x: width - 150,
    y: height - 60,
    size: 12,
    font: regularFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Certificate ID in the lower-left, positioned to avoid the signature line
  if (id) {
    page.drawText(`Certificate No: ${id}`, {
      x: 60,
      y: 80,
      size: 10,
      font: regularFont,
      color: rgb(0.2, 0.2, 0.2),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
