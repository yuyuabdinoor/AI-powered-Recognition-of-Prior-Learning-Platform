/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @next/next/no-html-link-for-pages */
'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Award,
  AlertTriangle,
  FileText,
  Download,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import ScoreIndicator from './ScoreIndicator';
import FeedbackSection from './FeedbackSection';
import FilesList from './FileLists';

interface Submission {
  field: string;
  scores: number[];
  feedback: string[];
  responses: string[];
  createdAt: string;
  qrHash?: string;
  // Blockchain fields (add these if not already present)
  tokenId?: string | null;
  txHash?: string | null;
  pdfUrl?: string | null;
}

export default function ResultsDashboard() {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? 'Learner';
  const [result, setResult] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCertificate, setLoadingCertificate] = useState(false);

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch('/api/final_result');
        const data = await res.json();
        setResult(data);
      } catch (error) {
        console.error('Error fetching results:', error);
        setResult(null);
      } finally {
        setLoading(false);
      }
    }
    void fetchResults();
  }, []);

  const handleDownloadCertificate = async () => {
    if (!result) return;
    setLoadingCertificate(true);
    try {
      const qr = result.qrHash ?? '';
      let downloadUrl = `/api/generate-certificate?` +
        `name=${encodeURIComponent(userName)}` +
        `&field=${encodeURIComponent(result.field)}`;
      if (qr) downloadUrl += `&qr=${encodeURIComponent(qr)}`;

      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error('Certificate generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${result.field}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      // Redirect to jobs page (optional)
      const query = encodeURIComponent(result.field + ' jobs');
      const techKeywords = /(it|software|computer|ict|developer)/i;
      const isTech = techKeywords.test(result.field);
      const jobUrl = isTech
        ? `https://www.linkedin.com/jobs/search?keywords=${query}`
        : `https://www.indeed.com/jobs?q=${query}`;
      window.location.href = jobUrl;
    } catch (error) {
      console.error('Download or redirect failed:', error);
      alert('Certificate download or redirect failed. Check console for details.');
    } finally {
      setLoadingCertificate(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          <p className="mt-4 text-lg text-gray-700">Loading your assessment results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-lg">
          <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Results Not Found</h2>
          <p className="text-gray-600 mb-4">
            We couldn&apos;t find your assessment results. Please try again later.
          </p>
          <a
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  const isPassed = (result.scores[0] ?? 0) >= 6;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 min-h-screen">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Assessment Results</h1>
        <p className="text-gray-600">Recognition of Prior Learning (RPL) Evaluation</p>
      </header>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden transform transition-all">
        <div
          className={`w-full py-4 px-6 flex items-center justify-between ${
            isPassed ? 'bg-green-500' : 'bg-amber-500'
          }`}
        >
          <div className="flex items-center">
            {isPassed ? (
              <CheckCircle className="h-6 w-6 text-white mr-2" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-white mr-2" />
            )}
            <h2 className="text-xl font-bold text-white">
              {isPassed ? 'Assessment Passed' : 'Assessment Needs Improvement'}
            </h2>
          </div>
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
            {result.field}
          </span>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Overall Performance</h3>
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">Score:</span>
                <ScoreIndicator score={result.scores[0] ?? 0} maxScore={10} />
              </div>
            </div>
          </div>

          <FeedbackSection summary={result.feedback[0] ?? 'No summary'} isPassed={isPassed} />

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              Assessment Portfolio
            </h3>
            <FilesList files={result.responses} />
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200 text-center">
            {isPassed ? (
              <>
                <Award className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-gray-800">Congratulations!</h3>
                <p className="text-gray-600 mb-4">
                  You&apos;ve demonstrated the required competencies in {result.field}.
                </p>
                <button
                  onClick={handleDownloadCertificate}
                  disabled={loadingCertificate}
                  className="mt-6 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {loadingCertificate ? (
                    <>…Preparing Certificate…</>
                  ) : (
                    <><Download className="h-5 w-5 mr-2" /> Download Certificate & View Jobs</>
                  )}
                </button>
                {/* Blockchain links and info */}
                {result.txHash && (
                  <a
                    href={`https://mumbai.polygonscan.com/tx/${result.txHash}`}
                    target="_blank"
                    rel="noopener"
                    className="mt-4 ml-3 inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                  >
                    <Award className="h-5 w-5 mr-2" />
                    View On-Chain Proof
                  </a>
                )}
                {result.pdfUrl && result.pdfUrl.startsWith('ipfs://') && (
                  <a
                    href={result.pdfUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                    target="_blank"
                    rel="noopener"
                    className="mt-2 ml-3 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download from IPFS
                  </a>
                )}
                {result.tokenId && (
                  <div className="mt-2 text-gray-600 text-sm">
                    <span className="font-mono bg-gray-100 rounded px-2 py-1">Blockchain Token ID: {result.tokenId}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">…</div>
            )}
          </div>
        </div>
      </div>

      <footer className="mt-10 text-center text-sm text-gray-500">
        <p>Assessment completed and verified according to NITA standards.</p>
        <p className="mt-1">© 2025 RPL Assessment Platform</p>
      </footer>
    </div>
  );
}
