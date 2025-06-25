/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client';

import React, { useEffect, useState } from 'react';
import { Upload, ArrowRight, CheckCircle } from 'lucide-react';
import { formDataToObject } from '@trpc/server/unstable-core-do-not-import';

export default function Page() {
  const [field, setField] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [practicalQuestion, setPracticalQuestion] = useState('');

  useEffect(() => {
    const savedField = localStorage.getItem('phase-1_field');
    if (!savedField) {
      alert('Please complete previous phases.');
      window.location.href = '/assessment/phase-1';
    } else {
      setField(savedField);

      // Fetch practical question
      const fetchQuestion = async () => {
        try {
          const res = await fetch('/api/generate_practical_task', {
            method: 'POST',
            body: JSON.stringify({ field: savedField }),
            headers: { 'Content-Type': 'application/json' },
          });

          if (!res.ok) {
            // It's better to throw an error to be caught by the catch block
            throw new Error(`API responded with status ${res.status}`);
          }

          const data = await res.json();
          const task = data.question;

          if (!task) {
            // Handle cases where the API returns a success status but no question
            throw new Error("No practical task received from the API.");
          }
          
          setPracticalQuestion(task);
          localStorage.setItem('phase-3_question', task);
        } catch (err) {
          console.error('Failed to load practical task:', err);
          const fallback = 'Describe and upload a sample of your practical work.';
          setPracticalQuestion(fallback);
          localStorage.setItem('phase-3_question', fallback);
        }
      };

      void fetchQuestion();
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (!files.length) return alert('Please upload at least one file.');

    const formData = new FormData();
    files.forEach((file) => formData.append('file', file));
    formData.append('field', field);
    formData.append('notes', notes);
    formData.append('question', practicalQuestion);

    setUploading(true);

    const res = await fetch('/api/submit_practical', {
      method: 'POST',
      body: formData,
    });

    setUploading(false);

    if (res.ok) {
      setSubmitted(true);
      setTimeout(() => {
        window.location.href = `/upload-documents?field=${encodeURIComponent(field)}`;
      }, 1500);
    } else {
      alert('Upload failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Phase 3: Practical Work Upload</h1>

        <p className="mb-6 text-gray-600 font-medium">
          Field: <span className="text-gray-800 font-semibold">{field}</span>
        </p>

        {practicalQuestion && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <h2 className="text-lg font-semibold text-blue-700 mb-1">Your Practical Task</h2>
            <p className="text-sm text-blue-900">{practicalQuestion}</p>
          </div>
        )}

        <div className="mb-6">
          <label className="block font-medium mb-2 text-gray-700">
            Upload Files (HTML, CSS, images, or PDFs)
          </label>
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              accept="text/html,text/css,image/*,application/pdf"
              onChange={handleFileChange}
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {files.length > 0 ? (
              <div className="text-sm text-gray-600 space-y-1">
                {files.map((file, idx) => (
                  <div key={idx}>{file.name}</div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500">
                <Upload className="w-8 h-8 mb-2" />
                <p className="text-sm">Click to upload your work samples</p>
                <p className="text-xs text-gray-400">(HTML, CSS, PDF, or image files)</p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-2 text-gray-700">
            Describe Your Work (optional)
          </label>
          <textarea
            placeholder="Describe your uploaded work..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            rows={4}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={uploading || submitted}
            className={`inline-flex items-center px-6 py-3 rounded-md font-semibold text-white ${
              submitted ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
            } transition duration-300`}
          >
            {uploading ? 'Uploading...' : submitted ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Uploaded! Redirecting...
              </>
            ) : (
              <>
                Submit Work <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {submitted && (
          <div className="mt-6 text-green-600 font-medium text-center">
            Upload complete! You will be redirected shortly.
          </div>
        )}
      </div>
    </div>
  );
}
