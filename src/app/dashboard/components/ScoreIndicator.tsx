// src/app/dashboard/components/ScoreIndicator.tsx
'use client';

import React from 'react';

interface ScoreIndicatorProps {
  score: number | null | undefined;
  maxScore?: number;
}

const ScoreIndicator: React.FC<ScoreIndicatorProps> = ({ score, maxScore = 10 }) => {
  const safeScore = typeof score === 'number' && !isNaN(score) ? score : 0;

  const percentage = Math.min((safeScore / maxScore) * 100, 100);

  return (
    <div className="flex items-center space-x-2 w-full max-w-xs">
      <div className="h-4 flex-1 bg-gray-200 rounded overflow-hidden">
        <div
          className="h-4 bg-blue-600 transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-700 min-w-[48px] text-right">
        {safeScore.toFixed(1)} / {maxScore}
      </span>
    </div>
  );
};

export default ScoreIndicator;
