// src/lib/fillCertificate.ts
import fs from 'fs/promises';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface FillData {
  name: string;
  date: string;
  id?: string;
}

export async function fillCertificate(data: FillData): Promise<Buffer> {
  const { name, date, id } = data;

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
  const footerFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // 4) Draw the recipient’s name, centered horizontally
  const nameSize  = 36;
  const nameWidth = nameFont.widthOfTextAtSize(name, nameSize);
  page.drawText(name, {
    x: (width - nameWidth) / 2,
    y: height - 300,    // tweak vertically as needed
    size: nameSize,
    font: nameFont,
    color: rgb(0, 0, 0),
  });

  // 5) Draw the date in the top-right corner so it no longer overlaps signatures
  page.drawText(`Date: ${date}`, {
    x: width - 200,     // adjust left/right as needed
    y: height - 100,    // ~100pts down from top border
    size: 12,
    font: footerFont,
    color: rgb(0, 0, 0),
  });

  // 6) Draw the certificate ID in the lower-left, if provided
  if (id) {
    page.drawText(`Certificate No: ${id}`, {
      x: 50,
      y: 120,
      size: 10,
      font: footerFont,
      color: rgb(0, 0, 0),
    });
  }

  // 7) Serialize and return
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
