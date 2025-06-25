'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Loader } from 'lucide-react';

// Use the local worker file
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface CertificateViewerProps {
  pdfUrl: string;
}

export default function CertificateViewer({ pdfUrl }: CertificateViewerProps) {
  return (
    <div className="mt-8 overflow-hidden rounded-xl shadow-2xl">
      <Document file={pdfUrl} loading={<div className="flex h-[200px] items-center justify-center"><Loader className="h-12 w-12 animate-spin text-purple-600" /></div>}>
        <Page pageNumber={1} renderTextLayer={false} renderAnnotationLayer={false} />
      </Document>
    </div>
  );
} 