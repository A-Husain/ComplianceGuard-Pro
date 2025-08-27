import React, { useState, useRef } from 'react';
import { Upload, FileText, Copy, Loader, CheckCircle, AlertCircle, X } from 'lucide-react';
import { DocumentProcessor } from '../services/documentProcessor';
import type { ExtractedInfo } from '../types/compliance';

interface DocumentUploadProps {
  onExtractedInfo: (info: ExtractedInfo) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  onExtractedInfo, 
  isProcessing, 
  setIsProcessing 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [lastExtraction, setLastExtraction] = useState<ExtractedInfo | null>(null);
  const [showTextArea, setShowTextArea] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const extractedInfo = await DocumentProcessor.processFile(file);
      setLastExtraction(extractedInfo);
      onExtractedInfo(extractedInfo);
    } catch (error) {
      console.error('File processing error:', error);
      alert('Failed to process file. Please try again or enter information manually.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextExtraction = async () => {
    if (!textInput.trim()) return;

    setIsProcessing(true);
    try {
      const extractedInfo = await DocumentProcessor.extractFromText(textInput);
      setLastExtraction(extractedInfo);
      onExtractedInfo(extractedInfo);
      setTextInput('');
      setShowTextArea(false);
    } catch (error) {
      console.error('Text processing error:', error);
      alert('Failed to process text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'text-green-600';
    if (confidence >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 75) return 'bg-green-50 border-green-200';
    if (confidence >= 50) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center">
            <Loader className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Document</h3>
            <p className="text-gray-600">Extracting project information...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Project Document</h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your PDF, email, or text file here
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Choose File
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Supports PDF, TXT, DOC files up to 10MB
            </p>
          </div>
        )}
      </div>

      {/* Text Input Option */}
      <div className="text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>
      </div>

      {!showTextArea ? (
        <button
          onClick={() => setShowTextArea(true)}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={isProcessing}
        >
          <Copy className="h-5 w-5 mr-2" />
          Paste Email or Text Content
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Paste your email or document content:
            </label>
            <button
              onClick={() => {
                setShowTextArea(false);
                setTextInput('');
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste your project inquiry, email content, or document text here..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isProcessing}
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowTextArea(false);
                setTextInput('');
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={handleTextExtraction}
              disabled={!textInput.trim() || isProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </div>
              ) : (
                'Extract Information'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Extraction Results */}
      {lastExtraction && (
        <div className={`rounded-lg border p-4 ${getConfidenceBg(lastExtraction.confidence)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              {lastExtraction.confidence >= 75 ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
              )}
              <h4 className="font-medium text-gray-900">Information Extracted</h4>
            </div>
            <span className={`text-sm font-medium ${getConfidenceColor(lastExtraction.confidence)}`}>
              {lastExtraction.confidence.toFixed(0)}% confidence
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {lastExtraction.extractedFields.map((field) => (
              <div key={field} className="flex items-center">
                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600 capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}:</span>
                <span className="ml-1 text-gray-900 font-medium truncate">
                  {lastExtraction[field as keyof ExtractedInfo] as string}
                </span>
              </div>
            ))}
          </div>

          {lastExtraction.confidence < 75 && (
            <div className="mt-3 p-2 bg-white rounded text-xs text-gray-600">
              <strong>Note:</strong> Some information may need manual verification. 
              Please review the extracted data before proceeding.
            </div>
          )}
        </div>
      )}
    </div>
  );
};