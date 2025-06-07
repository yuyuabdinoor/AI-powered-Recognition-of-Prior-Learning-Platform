'use client';
import React, { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

interface FeedbackSectionProps {
  summary: string;
  isPassed: boolean;
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ summary, isPassed }) => {
  const [expanded, setExpanded] = useState(false);
  
  // For a real application, this data would come from the API
  const detailedFeedback = [
    {
      category: "Technical Skills",
      score: isPassed ? 4 : 3,
      maxScore: 5,
      comments: "Good demonstration of basic techniques. Could improve on advanced pattern-making."
    },
    {
      category: "Portfolio Quality",
      score: isPassed ? 4 : 2,
      maxScore: 5,
      comments: "Solid presentation of work samples. Include more diverse projects."
    },
    {
      category: "Industry Knowledge",
      score: isPassed ? 3 : 2,
      maxScore: 5,
      comments: "Acceptable understanding of industry standards. Need more awareness of current trends."
    },
    {
      category: "Documentation",
      score: isPassed ? 4 : 3,
      maxScore: 5,
      comments: "Well-organized supporting documents. Could provide more detail on processes."
    }
  ];
  
  return (
    <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
      <div className="flex items-start">
        <MessageSquare className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">Assessment Feedback</h3>
            <button 
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-blue-600 flex items-center hover:text-blue-800 transition-colors"
            >
              {expanded ? (
                <>
                  <span>Show Less</span>
                  <ChevronUp className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  <span>Show Detailed Feedback</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          </div>
          
          <div className="mt-3 text-gray-700">
            <p>{summary}</p>
          </div>
          
          {expanded && (
            <div className="mt-6 space-y-4 animate-fadeIn">
              <h4 className="font-medium text-gray-800">Detailed Assessment Areas</h4>
              
              <div className="space-y-4">
                {detailedFeedback.map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-md border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">{item.category}</span>
                      <div className="flex items-center">
                        <div className="h-2 w-24 bg-gray-200 rounded-full mr-2">
                          <div 
                            className={`h-2 rounded-full ${item.score / item.maxScore >= 0.7 ? 'bg-green-500' : 'bg-amber-500'}`}
                            style={{ width: `${(item.score / item.maxScore) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{item.score}/{item.maxScore}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{item.comments}</p>
                  </div>
                ))}
              </div>
              
              <div className={`mt-4 p-4 rounded-md ${isPassed ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                <p className="text-sm font-medium">
                  {isPassed 
                    ? "Assessor's recommendation: Candidate has demonstrated sufficient competency for certification."
                    : "Assessor's recommendation: Candidate should focus on improvement areas before seeking reassessment."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackSection;