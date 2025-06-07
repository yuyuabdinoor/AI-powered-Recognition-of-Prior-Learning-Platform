'use client';
import React, { useEffect, useState } from 'react';

interface ScoreIndicatorProps {
  score: number;
  maxScore: number;
}

const ScoreIndicator: React.FC<ScoreIndicatorProps> = ({ score, maxScore }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const percentage = (score / maxScore) * 100;
  
  useEffect(() => {
    // Animate the score from 0 to the actual value
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [score]);

  // Determine color based on score percentage
  const getScoreColor = () => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-blue-500';
    if (percentage >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  // Determine background gradient based on score percentage
  const getGradient = () => {
    if (percentage >= 80) return 'from-green-200 to-green-500';
    if (percentage >= 60) return 'from-blue-200 to-blue-500';
    if (percentage >= 40) return 'from-amber-200 to-amber-500';
    return 'from-red-200 to-red-500';
  };

  return (
    <div className="flex items-center">
      <div className="relative w-16 h-16 mr-3">
        {/* Background circle */}
        <div className="absolute inset-0 rounded-full bg-gray-200"></div>
        
        {/* Progress circle with gradient */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-gray-200 stroke-current"
            strokeWidth="10"
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
          ></circle>
          
          <circle
            className={`stroke-current text-blue-500 transition-all duration-1000 ease-out`}
            strokeWidth="10"
            strokeLinecap="round"
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            strokeDasharray="251.2"
            strokeDashoffset={251.2 - (251.2 * animatedScore) / maxScore}
            style={{
              stroke: `url(#scoreGradient)`,
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
            }}
          ></circle>
          
          {/* Define the gradient */}
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className={`stop-color-start ${getGradient().split(' ')[0]}`} />
              <stop offset="100%" className={`stop-color-end ${getGradient().split(' ')[1]}`} />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Score number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-bold ${getScoreColor()}`}>
            {animatedScore}
          </span>
        </div>
      </div>
      
      <div>
        <div className={`text-sm font-medium ${getScoreColor()}`}>
          {percentage >= 60 ? 'Satisfactory' : 'Needs Improvement'}
        </div>
        <div className="text-xs text-gray-500">
          {score} out of {maxScore} points
        </div>
      </div>
    </div>
  );
};

export default ScoreIndicator;