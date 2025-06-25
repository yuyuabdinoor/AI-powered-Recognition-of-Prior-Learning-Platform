'use client';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FeedbackSectionProps {
  summary: string;
  isPassed: boolean;
  questions: string[];
  justifications: string[];
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ summary, isPassed, questions, justifications }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`mt-6 rounded-lg p-6 ${isPassed ? 'bg-green-50' : 'bg-amber-50'}`}>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Assessment Feedback</h3>
      <p className="text-gray-700 mb-4">{summary}</p>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center text-blue-600 font-semibold"
      >
        {showDetails ? 'Hide Detailed Feedback' : 'Show Detailed Feedback'}
        {showDetails ? <ChevronUp className="w-5 h-5 ml-1" /> : <ChevronDown className="w-5 h-5 ml-1" />}
      </button>

      {showDetails && (
        <div className="mt-4 space-y-4">
          {questions.map((question, index) => (
            <div key={index} className="border-t pt-4">
              <p className="font-semibold text-gray-800">{`Q${index + 1}: ${question}`}</p>
              <p className="text-gray-600 mt-1">{`Justification: ${justifications[index]}`}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackSection;