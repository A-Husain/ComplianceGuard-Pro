import React, { useState } from 'react';
import { Building, MapPin, User, FileText, Search, AlertTriangle, Wand2 } from 'lucide-react';
import type { ProjectInfo } from '../types/compliance';
import type { ExtractedInfo } from '../types/compliance';
import { DocumentUpload } from './DocumentUpload';

interface ProjectFormProps {
  onSubmit: (projectInfo: ProjectInfo) => void;
  isLoading: boolean;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, isLoading }) => {
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [isProcessingDocument, setIsProcessingDocument] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    projectLocation: '',
    endUser: '',
    client: '',
    projectScope: '',
    checkType: 'inquiry' as const
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleExtractedInfo = (extractedInfo: ExtractedInfo) => {
    const newFormData = { ...formData };

    if (extractedInfo.projectName) {
      newFormData.projectName = extractedInfo.projectName;
    }
    if (extractedInfo.projectLocation) {
      newFormData.projectLocation = extractedInfo.projectLocation;
    }
    if (extractedInfo.endUser) {
      newFormData.endUser = extractedInfo.endUser;
    }
    if (extractedInfo.client) {
      newFormData.client = extractedInfo.client;
    }
    if (extractedInfo.projectScope) {
      newFormData.projectScope = extractedInfo.projectScope;
    }

    setFormData(newFormData);
    setShowDocumentUpload(false);

    // Clear any existing errors for fields that were filled
    const newErrors = { ...errors };
    extractedInfo.extractedFields.forEach(field => {
      if (newErrors[field]) {
        delete newErrors[field];
      }
    });
    setErrors(newErrors);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    if (!formData.projectLocation.trim()) {
      newErrors.projectLocation = 'Project location is required';
    }
    if (!formData.client.trim()) {
      newErrors.client = 'Client information is required';
    }
    if (!formData.projectScope.trim()) {
      newErrors.projectScope = 'Project scope is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const projectInfo: ProjectInfo = {
      id: `proj_${Date.now()}`,
      ...formData,
      createdAt: new Date(),
      status: 'pending'
    };

    onSubmit(projectInfo);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 p-2 rounded-lg mr-3">
          <Search className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Compliance Screening</h2>
          <p className="text-sm text-gray-600">Advanced due diligence and sanctions screening</p>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setShowDocumentUpload(!showDocumentUpload)}
            className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            disabled={isLoading || isProcessingDocument}
          >
            <Wand2 className="h-4 w-4 mr-1" />
            Auto-Extract
          </button>
        </div>
      </div>

      {showDocumentUpload && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <DocumentUpload
            onExtractedInfo={handleExtractedInfo}
            isProcessing={isProcessingDocument}
            setIsProcessing={setIsProcessingDocument}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Building className="h-4 w-4 mr-2" />
              Project Name
            </label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => handleInputChange('projectName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.projectName ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="Enter project name"
              disabled={isProcessingDocument}
            />
            {errors.projectName && (
              <p className="mt-1 text-sm text-red-600">{errors.projectName}</p>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 mr-2" />
              Project Location
            </label>
            <input
              type="text"
              value={formData.projectLocation}
              onChange={(e) => handleInputChange('projectLocation', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.projectLocation ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="Country/Region"
              disabled={isProcessingDocument}
            />
            {errors.projectLocation && (
              <p className="mt-1 text-sm text-red-600">{errors.projectLocation}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Building className="h-4 w-4 mr-2" />
              Client/Company
            </label>
            <input
              type="text"
              value={formData.client}
              onChange={(e) => handleInputChange('client', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.client ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="Client company name"
              disabled={isProcessingDocument}
            />
            {errors.client && (
              <p className="mt-1 text-sm text-red-600">{errors.client}</p>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 mr-2" />
              End User (Optional)
            </label>
            <input
              type="text"
              value={formData.endUser}
              onChange={(e) => handleInputChange('endUser', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="End user or individual"
              disabled={isProcessingDocument}
            />
          </div>
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FileText className="h-4 w-4 mr-2" />
            Project Scope
          </label>
          <textarea
            value={formData.projectScope}
            onChange={(e) => handleInputChange('projectScope', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.projectScope ? 'border-red-300' : 'border-gray-300'
              }`}
            placeholder="Describe the project scope, deliverables, and any sensitive technologies involved..."
            disabled={isProcessingDocument}
          />
          {errors.projectScope && (
            <p className="mt-1 text-sm text-red-600">{errors.projectScope}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="checkType"
                value="inquiry"
                checked={formData.checkType === 'inquiry'}
                onChange={(e) => handleInputChange('checkType', e.target.value)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
                disabled={isProcessingDocument}
              />
              <span className="text-sm text-gray-700">Initial Inquiry Check</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="checkType"
                value="pre-delivery"
                checked={formData.checkType === 'pre-delivery'}
                onChange={(e) => handleInputChange('checkType', e.target.value)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
                disabled={isProcessingDocument}
              />
              <span className="text-sm text-gray-700">Pre-Delivery Check</span>
            </label>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-amber-800">Compliance Notice</h3>
              <p className="text-sm text-amber-700 mt-1">
                This check will screen against USA, EU, UN, and UK sanctions databases.
                Ensure all information is accurate and complete for proper compliance screening.
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || isProcessingDocument}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
        >
          {isLoading || isProcessingDocument ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
              {isProcessingDocument ? 'Processing Document...' : 'Running ComplianceGuard Check...'}
            </div>
          ) : (
            'Run Compliance Check'
          )}
        </button>
      </form>
    </div>
  );
};