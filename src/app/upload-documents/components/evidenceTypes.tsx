 
// src/app/upload-documents/components/evidenceTypes.tsx
import React from 'react';
import { FileText, Users, Clock, GraduationCap } from 'lucide-react';

export const evidenceTypes = [
  {
    id: 'references',
    title: 'Relevant References',
    description: 'Professional references and recommendations that validate your work experience and skills.',
    acceptedFormats: ['PDF', 'DOC', 'DOCX'],
    examples: [
      'Letters of recommendation',
      'Professional references contact information',
      'Performance evaluations',
      'LinkedIn recommendations exports',
    ],
    icon: <FileText className="h-6 w-6 text-purple-600" />,
  },
  {
    id: 'testimonials',
    title: 'Testimonials and Interviews',
    description: 'Direct feedback and testimonials from clients, employers, or colleagues about your work and professional capabilities.',
    acceptedFormats: ['PDF', 'DOC', 'DOCX', 'MP3', 'MP4'],
    examples: [
      'Client testimonials',
      'Employer interviews',
      'Project feedback documentation',
      'Customer satisfaction reports',
    ],
    icon: <Users className="h-6 w-6 text-purple-600" />,
  },
  {
    id: 'work-logs',
    title: 'Work Diaries and Logs',
    description: 'Detailed documentation of your work activities, projects, and achievements over time.',
    acceptedFormats: ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX'],
    examples: [
      'Project timelines and milestones',
      'Daily/weekly work logs',
      'Project completion reports',
      'Activity tracking documentation',
    ],
    icon: <Clock className="h-6 w-6 text-purple-600" />,
  },
  {
    id: 'training',
    title: 'Training and Education',
    description: 'Evidence of your educational background, professional development, and ongoing learning initiatives.',
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    examples: [
      'Degree certificates',
      'Professional certifications',
      'Training course completion records',
      'Workshop attendance certificates',
    ],
    icon: <GraduationCap className="h-6 w-6 text-purple-600" />,
  },
];
