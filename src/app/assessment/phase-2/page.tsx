/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client';

import { useState, useEffect } from 'react';
import { LoaderCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface Scenario {
  question: string;
  competencyId: string;
}

export default function PhaseTwo() {
  const [field, setField] = useState('');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedField = localStorage.getItem('phase-1_field');
    const savedAnswers = localStorage.getItem('phase-1_answers');

    if (!savedField || !savedAnswers) {
      alert("Please complete Phase 1 first.");
      window.location.href = "/assessment/phase-1";
    } else {
      setField(savedField);
    }
  }, []);

  const fetchScenarios = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate_scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field }),
      });

      const data = await res.json();
      setScenarios(data.questions);
      setResponses(Array(data.questions.length).fill(''));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert("Failed to load scenarios.");
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (index: number, value: string) => {
    const updated = [...responses];
    updated[index] = value;
    setResponses(updated);
  };

  const handleSubmit = async () => {
    const res = await fetch('/api/score_scenarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field, questions: scenarios, responses }),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      alert("Submission failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Phase 2: Scenario-Based Assessment</h1>
        <p className="text-gray-600 mb-6">Field: <span className="font-semibold text-gray-800">{field}</span></p>

        {!scenarios.length && (
          <button
            onClick={fetchScenarios}
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-3 rounded font-medium hover:bg-purple-700 transition"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <LoaderCircle className="animate-spin h-5 w-5" />
                Generating...
              </span>
            ) : (
              'Generate Scenarios'
            )}
          </button>
        )}

        {scenarios.length > 0 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              handleSubmit();
            }}
            className="space-y-6 mt-8"
          >
            {scenarios.map((scenario, idx) => (
              <div key={idx} className="bg-gray-50 border rounded p-5 shadow-sm">
                <p className="font-semibold text-gray-800 mb-2">
                  Q{idx + 1}: {scenario.question}
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  Competency: {scenario.competencyId}
                </p>
                <textarea
                  required
                  value={responses[idx]}
                  onChange={(e) => handleResponseChange(idx, e.target.value)}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:ring focus:ring-blue-200"
                  rows={4}
                  placeholder="Type your response..."
                />
              </div>
            ))}

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-3 rounded font-semibold hover:bg-green-700 transition"
              >
                Submit Responses
              </button>
            </div>
          </form>
        )}

        {submitted && (
          <div className="mt-6 flex flex-col items-center text-green-600 font-medium">
            <CheckCircle className="w-6 h-6 mb-1" />
            Responses submitted! Proceed to the next phase.
            <button
              onClick={() => window.location.href = '/assessment/phase-3'}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              Go to Phase 3 <ArrowRight className="inline ml-1 w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
