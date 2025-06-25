'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ScoreChartProps {
  scores: number[];
  questions: string[];
}

const ScoreChart: React.FC<ScoreChartProps> = ({ scores, questions }) => {
  const data = {
    labels: questions.map((q, i) => `Q${i + 1}`), // Short labels like Q1, Q2
    datasets: [
      {
        label: 'Score (out of 10)',
        data: scores,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Detailed Score Breakdown',
        font: {
          size: 18,
        },
      },
      tooltip: {
        callbacks: {
          // Show the full question text in the tooltip on hover
          title: (tooltipItems: any) => {
             return questions[tooltipItems[0].dataIndex];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default ScoreChart; 