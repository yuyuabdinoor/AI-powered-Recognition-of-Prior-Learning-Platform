/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @next/next/no-html-link-for-pages */
'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Award,
  AlertTriangle,
  FileText,
  Download,
  CheckCircle,
  QrCode,
  PlusCircle,
  ChevronRight,
  List,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import ScoreIndicator from './ScoreIndicator';
import FeedbackSection from './FeedbackSection';
import FilesList from './FileLists';
import QRCode from 'qrcode';
import Link from 'next/link';
import ScoreChart from './ScoreChart';
import { Loader } from 'lucide-react';
import { env } from '~/env';

interface Certificate {
  id: string;
  tokenId: string | null;
  txHash: string | null;
  pdfUrl: string | null;
  ipfsUrl: string | null;
  phase: string;
}

interface Submission {
  id: string;
  field: string;
  scores: number[];
  justifications: string[];
  overall_score: number;
  feedback: string;
  questions: string[];
  responses: string[];
  createdAt: string;
  certificate: Certificate | null;
  phase: string;
}

export default function ResultsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [results, setResults] = useState<Submission[]>([]);
  const [selectedResult, setSelectedResult] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    if (status === 'authenticated') {
      async function fetchResults() {
        try {
          const res = await fetch('/api/final_result');
          if (!res.ok) {
            throw new Error('Failed to fetch results');
          }
          const data = await res.json();
          setResults(data);
        } catch (error) {
          console.error('Error fetching results:', error);
        } finally {
          setLoading(false);
        }
      }
      void fetchResults();
    }
  }, [status, router]);

  const DetailedResultView = ({
    result,
    onBack,
  }: {
    result: Submission;
    onBack: () => void;
  }) => {
    return (
      <div className="animate-fade-in">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-2 rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
        >
          <ArrowLeft size={16} />
          Back to All Results
        </button>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-4 sm:flex-row">
            <div>
              <h2 className="text-2xl font-bold">
                Assessment Result: {result.field}
              </h2>
              <p className="text-sm text-gray-500">
                Completed on: {new Date(result.createdAt).toLocaleString()}
              </p>
            </div>
            {result.certificate && result.overall_score >= env.NEXT_PUBLIC_PASS_THRESHOLD && (
              <div className="flex flex-shrink-0 space-x-2">
                <a
                  href={result.certificate.pdfUrl ?? '#'}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Download size={16} />
                  Download Certificate
                </a>
                <a
                  href={`/verify/${result.certificate.id}`}
                  className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ShieldCheck size={16} />
                  Verify Certificate
                </a>
              </div>
            )}
          </div>
          <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <div className="rounded-lg bg-gray-50 p-6">
                <h3 className="text-lg font-semibold">Overall Score</h3>
                <div className="mt-4 flex justify-center">
                  <ScoreIndicator
                    score={result.overall_score}
                    maxScore={10}
                  />
                </div>
                <p className="mt-4 text-center text-sm text-gray-600">
                  {result.feedback}
                </p>
              </div>
            </div>
            <div className="md:col-span-2">
              <ScoreChart scores={result.scores} questions={result.questions} />
            </div>
          </div>

          <div className="mt-8">
            <FeedbackSection
              summary={result.feedback}
              isPassed={result.overall_score >= env.NEXT_PUBLIC_PASS_THRESHOLD}
              questions={result.questions}
              justifications={result.justifications}
            />
          </div>

          {result.responses && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold">Supporting Documents</h3>
              <FilesList files={result.responses as any} />
            </div>
          )}
        </div>
      </div>
    );
  };

  const userName = session?.user?.name ?? 'Learner';

  if (status === 'loading' || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    // This is a fallback while the redirect is happening
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {!selectedResult ? (
          <div className="animate-fade-in">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Welcome back, {userName}!
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Here are your past assessment results.
                </p>
              </div>
              <button
                onClick={() => router.push('/assessment/phase-1')}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <PlusCircle size={18} />
                Start New Assessment
              </button>
            </div>

            <div className="mt-8">
              {results.length > 0 ? (
                <ul role="list" className="space-y-4">
                  {results.map(result => (
                    <li
                      key={result.id}
                      onClick={() => setSelectedResult(result)}
                      className="cursor-pointer overflow-hidden rounded-md bg-white shadow transition-shadow duration-200 hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full ${
                              result.overall_score >= env.NEXT_PUBLIC_PASS_THRESHOLD
                                ? 'bg-green-100'
                                : 'bg-red-100'
                            }`}
                          >
                            {result.overall_score >= env.NEXT_PUBLIC_PASS_THRESHOLD ? (
                              <CheckCircle
                                className="h-6 w-6 text-green-600"
                                aria-hidden="true"
                              />
                            ) : (
                              <AlertTriangle
                                className="h-6 w-6 text-red-600"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <div>
                            <p className="truncate text-sm font-medium text-purple-600">
                              Assessment for {result.field}
                            </p>
                            <div className="mt-1 flex items-center">
                              <p className="text-sm text-gray-500">
                                Completed on:{' '}
                                {new Date(result.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-4">
                          <ScoreIndicator
                            score={result.overall_score}
                            size="sm"
                          />
                          <ChevronRight
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                  <List className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No assessments
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by taking your first assessment.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <DetailedResultView
            result={selectedResult}
            onBack={() => setSelectedResult(null)}
          />
        )}
      </main>
    </div>
  );
}
