/* eslint-disable @typescript-eslint/no-unused-vars */
// src/lib/generateCertificate.ts
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { PDFFont } from 'pdf-lib';
import fetch from 'node-fetch';

export interface CertificateData {
  name: string;
  field: string;
  date: string;
  certificateId?: string;
  signatureUrl?: string;
  logoUrl?: string;
  qrCodeData?: string;
}

async function embedFontSafe(pdfDoc: PDFDocument, fontName: StandardFonts): Promise<PDFFont> {
  return pdfDoc.embedFont(fontName);
}

export async function createCertificate(data: CertificateData): Promise<Buffer> {
  const {
    name,
    field,
    date,
    certificateId = '',
    signatureUrl,
    logoUrl,
    qrCodeData,
  } = data;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  // Embed fonts
  const helvetica = await embedFontSafe(pdfDoc, StandardFonts.Helvetica);
  const helveticaBold = await embedFontSafe(pdfDoc, StandardFonts.HelveticaBold);
  const timesRoman = await embedFontSafe(pdfDoc, StandardFonts.TimesRoman);
  const timesRomanBold = await embedFontSafe(pdfDoc, StandardFonts.TimesRomanBold);

  // Draw decorative border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: rgb(0.2, 0.2, 0.2),
    borderWidth: 2,
    opacity: 0.8,
  });

  // Logo (if any)
  if (logoUrl) {
    try {
      const res = await fetch(logoUrl);
      const imgBytes = await res.arrayBuffer();
      const logoImg = await pdfDoc.embedPng(imgBytes);
      const logoDims = logoImg.scale(0.15);
      page.drawImage(logoImg, {
        x: width / 2 - logoDims.width / 2,
        y: height - 100,
        width: logoDims.width,
        height: logoDims.height,
      });
    } catch {}
  }

  // Title
  const title = 'CERTIFICATE OF COMPLETION';
  page.drawText(title, {
    x: width / 2 - helveticaBold.widthOfTextAtSize(title, 24) / 2,
    y: height - 150,
    size: 24,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Subtitle line
  page.drawLine({
    start: { x: 80, y: height - 160 },
    end: { x: width - 80, y: height - 160 },
    thickness: 1,
    color: rgb(0.1, 0.1, 0.1),
  });

  // “This certifies that”
  const phrase = 'This certifies that';
  page.drawText(phrase.toUpperCase(), {
    x: width / 2 - helvetica.widthOfTextAtSize(phrase, 12) / 2,
    y: height - 200,
    size: 12,
    font: helvetica,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Recipient name
  page.drawText(name, {
    x: width / 2 - helveticaBold.widthOfTextAtSize(name, 20) / 2,
    y: height - 230,
    size: 20,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

  // Description
  const desc = `has successfully completed the practical assessment for the field of "${field}".`;
  page.drawText(desc, {
    x: 60,
    y: height - 280,
    size: 12,
    font: timesRoman,
    maxWidth: width - 120,
    lineHeight: 16,
  });

  // Certificate ID
  if (certificateId) {
    const idLabel = `Certificate No: ${certificateId}`;
    page.drawText(idLabel, {
      x: 60,
      y: height - 320,
      size: 10,
      font: timesRoman,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  // Date issued
  page.drawText(`Date: ${date}`, {
    x: width - 180,
    y: height - 320,
    size: 10,
    font: timesRoman,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Signature block
  if (signatureUrl) {
    try {
      const res = await fetch(signatureUrl);
      const sigBytes = await res.arrayBuffer();
      const sigImg = await pdfDoc.embedPng(sigBytes);
      const sigDims = sigImg.scale(0.2);
      page.drawImage(sigImg, {
        x: width - 200,
        y: 120,
        width: sigDims.width,
        height: sigDims.height,
      });
      page.drawText('Authorized Signature', {
        x: width - 200,
        y: 100,
        size: 10,
        font: timesRoman,
      });
    } catch {}
  }

  // QR code (on-chain hash)
  if (qrCodeData) {
    try {
      const res = await fetch(qrCodeData);
      const qrBytes = await res.arrayBuffer();
      const qrImg = await pdfDoc.embedPng(qrBytes);
      const qrDims = qrImg.scale(0.18);
      page.drawImage(qrImg, {
        x: 50,
        y: 120,
        width: qrDims.width,
        height: qrDims.height,
      });
      page.drawText('Scan to verify', {
        x: 50,
        y: 100,
        size: 8,
        font: timesRoman,
      });
    } catch {}
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
