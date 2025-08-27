import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Shield, Download, Clock, Database } from 'lucide-react';
import type { ComplianceResult } from '../types/compliance';

interface ComplianceResultsProps {
  result: ComplianceResult;
  onNewCheck: () => void;
}

export const ComplianceResults: React.FC<ComplianceResultsProps> = ({ result, onNewCheck }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'clear':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'flagged':
        return <XCircle className="h-6 w-6 text-red-600" />;
      case 'review':
        return <AlertTriangle className="h-6 w-6 text-amber-600" />;
      default:
        return <Clock className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clear':
        return 'bg-green-50 border-green-200';
      case 'flagged':
        return 'bg-red-50 border-red-200';
      case 'review':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'clear':
        return 'text-green-800';
      case 'flagged':
        return 'text-red-800';
      case 'review':
        return 'text-amber-800';
      default:
        return 'text-gray-800';
    }
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportResults = () => {
    const reportData = {
      projectId: result.projectId,
      checkDate: result.checkedAt,
      overallStatus: result.overallStatus,
      summary: result.summary,
      recommendations: result.recommendations,
      detailedChecks: result.checks
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ComplianceGuard_Report_${result.projectId}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className={`rounded-lg border-2 p-6 ${getStatusColor(result.overallStatus)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {getStatusIcon(result.overallStatus)}
            <h2 className={`text-xl font-semibold ml-3 ${getStatusTextColor(result.overallStatus)}`}>
              Compliance Check {result.overallStatus.toUpperCase()}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportResults}
              className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
            <button
              onClick={onNewCheck}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              New Check
            </button>
          </div>
        </div>
        
        <p className={`text-sm mb-4 ${getStatusTextColor(result.overallStatus)}`}>
          Checked on {result.checkedAt.toLocaleDateString()} at {result.checkedAt.toLocaleTimeString()}
        </p>
        
        <p className={`${getStatusTextColor(result.overallStatus)} leading-relaxed`}>
          {result.summary}
        </p>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-blue-600" />
          Compliance Recommendations
        </h3>
        <ul className="space-y-2">
          {result.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                {index + 1}
              </span>
              <span className="text-gray-700">{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Detailed Results */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-blue-600" />
          Detailed Database Checks
        </h3>
        
        <div className="grid gap-4">
          {result.checks.map((check, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="flex items-center mr-4">
                    {getStatusIcon(check.status)}
                    <span className="ml-2 font-medium text-gray-900">{check.database}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskBadgeColor(check.riskLevel)}`}>
                    {check.riskLevel.toUpperCase()} RISK
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {check.entityType}: {check.entity}
                </div>
              </div>
              
              <p className="text-sm text-gray-600">{check.details}</p>
              
              {check.status !== 'clear' && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  <strong>Action Required:</strong> Additional review recommended for this entity.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};