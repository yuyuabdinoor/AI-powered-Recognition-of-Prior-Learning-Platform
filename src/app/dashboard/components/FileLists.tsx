'use client';
import React from 'react';
import { Download, Eye, File as FileIcon } from 'lucide-react';

interface FilesListProps {
  files: { name: string; url: string }[] | string[];
}

const FilesList: React.FC<FilesListProps> = ({ files = [] }) => {
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') {
      return <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-100 text-red-500">PDF</div>;
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension ?? '')) {
      return <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100 text-blue-500">IMG</div>;
    } else {
      return <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-500">DOC</div>;
    }
  };

  const normalizedFiles = files.map(file => 
    typeof file === 'string' ? { name: file, url: `/uploads/${file}` } : file
  );

  if (normalizedFiles.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <FileIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No supporting documents were provided.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {normalizedFiles.map((file, index) => (
        <div 
          key={index}
          className="group flex items-center rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-blue-300 hover:shadow-sm"
        >
          {getFileIcon(file.name)}
          
          <div className="ml-3 flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-800">{file.name}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <a 
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200"
              title="Preview"
            >
              <Eye className="h-3 w-3" />
              Preview
            </a>
            <a 
              href={file.url}
              download
              className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-600 hover:bg-blue-200"
              title="Download"
            >
              <Download className="h-3 w-3" />
              Download
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FilesList;