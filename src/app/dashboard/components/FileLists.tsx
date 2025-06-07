'use client';
import React, { useState } from 'react';
import { FileIcon, Download, Eye, X } from 'lucide-react';

interface FilesListProps {
  files: string[];
}

const FilesList: React.FC<FilesListProps> = ({ files }) => {
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') {
      return <div className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-500 rounded-md">PDF</div>;
    } else if (extension === 'zip') {
      return <div className="w-10 h-10 flex items-center justify-center bg-yellow-100 text-yellow-500 rounded-md">ZIP</div>;
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension ?? '')) {
      return <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-500 rounded-md">IMG</div>;
    } else {
      return <div className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-500 rounded-md">DOC</div>;
    }
  };
  
  const handlePreview = (file: string) => {
    setPreviewFile(file);
  };
  
  const closePreview = () => {
    setPreviewFile(null);
  };
  
  if (!files || files.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <FileIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No files were submitted for this assessment</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {files.map((file, index) => (
          <div 
            key={index}
            className="group flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
          >
            {getFileIcon(file)}
            
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{file}</p>
              <p className="text-xs text-gray-500">Uploaded with assessment</p>
            </div>
            
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handlePreview(file)}
                className="p-1 text-gray-500 hover:text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
                title="Preview"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button 
                className="p-1 text-gray-500 hover:text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-medium text-gray-800">{previewFile}</h3>
              <button 
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <FileIcon className="h-16 w-16 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 mb-2">Preview not available</p>
                <p className="text-sm text-gray-400">This is a demonstration. In a real application, file preview would be implemented here.</p>
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end">
              <button 
                onClick={closePreview}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors mr-2"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center">
                <Download className="h-4 w-4 mr-1" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesList;