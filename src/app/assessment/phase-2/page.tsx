/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader, CheckCircle, ArrowRight, ChevronRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Scenario {
  question: string;
  competencyId: string;
}

export default function Phase2() {
  const [field, setField] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();

  const fetchScenarios = useCallback(async (fieldName: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/generate_scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: fieldName }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setScenarios(data.questions);
        setResponses(Array(data.questions.length).fill(''));
      } else {
        throw new Error("No scenarios received from API.");
      }
    } catch (err) {
      alert("Failed to load scenarios. Redirecting you to Phase 1.");
      router.push('/assessment/phase-1');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // This check is flawed, but we're leaving it for now as per instructions.
    const savedField = localStorage.getItem('phase-1_field');
    if (!savedField) {
      alert("Please complete Phase 1 first.");
      router.push("/assessment/phase-1");
    } else {
      setField(savedField);
      void fetchScenarios(savedField);
    }
  }, [router, fetchScenarios]);

  const handleResponseChange = (value: string) => {
    const updated = [...responses];
    updated[currentScenarioIndex] = value;
    setResponses(updated);
  };

  const handleNextScenario = () => {
    if (currentScenarioIndex < scenarios.length - 1) {
      setCurrentScenarioIndex(currentScenarioIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePreviousScenario = () => {
    if (currentScenarioIndex > 0) {
      setCurrentScenarioIndex(currentScenarioIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (responses.some(r => !r.trim())) {
      alert("Please answer all scenarios before submitting.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/score_scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          field, 
          questions: scenarios.map(s => s.question), 
          responses 
        }),
      });

      if (!res.ok) throw new Error("Submission failed");
      
      router.push(`/assessment/phase-3?field=${encodeURIComponent(field as string)}`);
    } catch (error) {
      console.error("Submission failed:", error);
      alert("An error occurred while submitting your responses. Please try again.");
      setIsSaving(false);
    }
  };

  const progress = scenarios.length > 0 ? ((currentScenarioIndex + 1) / scenarios.length) * 100 : 0;
  
  const renderQuestionnaire = () => {
    const currentScenario = scenarios[currentScenarioIndex];
    if (!currentScenario) {
      // This should ideally not happen if isLoading is handled correctly,
      // but it's a good safeguard.
      return (
        <div className="text-center text-gray-600">
          <p>No scenario to display. Something went wrong.</p>
        </div>
      );
    }
    
    return (
     <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center">{field} Assessment</h2>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Scenario {currentScenarioIndex + 1} of {scenarios.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg animate-fadeIn">
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Competency: {currentScenario.competencyId}</p>
          <h3 className="text-xl font-semibold text-gray-800">{currentScenario.question}</h3>
        </div>
        <textarea
          value={responses[currentScenarioIndex] ?? ""}
          onChange={(e) => handleResponseChange(e.target.value)}
          placeholder="Describe how you would handle this situation..."
          rows={8}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-y"
          required
        />
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={handlePreviousScenario}
          disabled={currentScenarioIndex === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>
        <button
          onClick={handleNextScenario}
          disabled={isSaving || !responses[currentScenarioIndex]?.trim()}
          className="flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {isSaving ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : currentScenarioIndex < scenarios.length - 1 ? (
            <>
              Next Scenario <ArrowRight className="w-5 h-5" />
            </>
          ) : (
            <>
              Continue to Phase 3 <CheckCircle className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-bold text-lg">2</div>
              <h1 className="text-xl font-bold text-gray-800">Scenario</h1>
            </div>
             <div className="flex items-center text-sm font-medium text-gray-500">
              <span className="text-blue-600">Knowledge</span>
              <ChevronRight className="w-5 h-5 text-blue-600" />
              <span className="text-gray-900">Scenario</span>
               <ChevronRight className="w-5 h-5" />
              <span>Practical</span>
            </div>
          </div>
        </div>
      </div>

       <main className="max-w-4xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg text-gray-600">Preparing your scenarios...</p>
          </div>
        ) : (
          renderQuestionnaire()
        )}
      </main>
    </div>
  );
}
