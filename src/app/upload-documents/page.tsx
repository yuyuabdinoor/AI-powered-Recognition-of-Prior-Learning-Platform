/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUp, CheckCircle, AlertCircle, Info } from 'lucide-react';
import EvidenceTypeCard from './components/EvidenceTypeCard';
import { evidenceTypes } from './components/evidenceTypes';

const fieldOptions = [
  { value: '', label: 'Select Field' },
  { value: 'Tailoring', label: 'Tailoring' },
  { value: 'Plumbing', label: 'Plumbing' },
  { value: 'ICT', label: 'ICT' },
  // Add more as needed
];

export default function UploadDocumentsPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedField, setSelectedField] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setUploadStatus('idle');
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0 || !selectedField) return;

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('field', selectedField);

    setUploading(true);
    try {
      const res = await fetch('/api/upload_documents', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        setUploadStatus('success');
        // Redirect to dashboard after brief confirmation
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Assessment Document Upload
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Please upload the required evidence documents for your assessment. Review the guidelines below to ensure you submit the correct documentation.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2 text-purple-600" />
            Types of Evidence for Assessment
          </h2>
          <p className="text-gray-600 mb-6">
            The following evidence types are accepted for your assessment. Please ensure your documents meet the specified requirements.
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            {evidenceTypes.map((type) => (
              <EvidenceTypeCard key={type.id} {...type} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Your Documents</h2>
          
          {/* Field Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="field-select">
              Choose your assessment field:
            </label>
            <select
              id="field-select"
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="border px-3 py-2 rounded-md w-full"
            >
              {fieldOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors duration-200">
            <div className="space-y-2">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <FileUp className="h-12 w-12 mx-auto text-purple-500" />
              </div>
              <div className="text-sm text-gray-600">
                <label 
                  htmlFor="file-upload" 
                  className="relative cursor-pointer text-purple-600 font-medium hover:text-purple-500 focus-within:outline-none"
                >
                  <span>Upload files</span>
                  <input 
                    id="file-upload" 
                    name="file-upload" 
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileChange}
                    className="sr-only" 
                  />
                </label>
                <span className="pl-1">or drag and drop</span>
              </div>
              <p className="text-xs text-gray-500">
                Accepted file formats: PDF, JPG, JPEG, PNG, DOC, DOCX
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-900 mb-2">Selected files:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Documents uploaded successfully! Redirecting...
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Upload failed. Please try again.
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto bg-purple-600 text-white px-6 py-3 rounded-md font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={files.length === 0 || uploading || !selectedField}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : "Submit Documents"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
