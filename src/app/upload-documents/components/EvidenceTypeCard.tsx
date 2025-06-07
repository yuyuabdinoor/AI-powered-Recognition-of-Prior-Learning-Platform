// src/app/upload-documents/components/EvidenceTypeCard.tsx
import React from 'react';

interface EvidenceTypeCardProps {
  id: string;
  title: string;
  description: string;
  acceptedFormats: string[];
  examples: string[];
  icon: React.ReactNode;
}

export default function EvidenceTypeCard({
  title,
  description,
  acceptedFormats,
  examples,
  icon,
}: EvidenceTypeCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition">
      <div className="flex items-center mb-3">
        <div className="mr-3">{icon}</div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      <p className="text-xs text-gray-500 mb-1">
        <strong>Formats:</strong> {acceptedFormats.join(', ')}
      </p>
      <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
        {examples.map((ex) => (
          <li key={ex}>{ex}</li>
        ))}
      </ul>
    </div>
  );
}
