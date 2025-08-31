import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Shield, Download, Clock, Database, Info, User, Building, MapPin } from 'lucide-react';
import jsPDF from 'jspdf';
import type { ComplianceResult, SanctionEntity } from '../types/compliance';

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
      case 'no_data':
        return <Info className="h-6 w-6 text-blue-600" />;
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
      case 'no_data':
        return 'bg-blue-50 border-blue-200';
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
      case 'no_data':
        return 'text-blue-800';
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

  const getEntityTypeIcon = (type: string) => {
    switch (type) {
      case 'individual':
        return <User className="h-4 w-4" />;
      case 'entity':
        return <Building className="h-4 w-4" />;
      case 'vessel':
        return <Database className="h-4 w-4" />;
      case 'aircraft':
        return <Database className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const exportResults = () => {
    const doc = new jsPDF();

    // Set up fonts and styling
    doc.setFont('helvetica');
    doc.setFontSize(20);

    // Header
    doc.setTextColor(59, 130, 246); // Blue color
    doc.text('ComplianceGuard Report', 20, 30);

    // Project Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Project ID: ${result.projectId}`, 20, 50);
    doc.text(`Check Date: ${result.checkedAt.toLocaleDateString()}`, 20, 60);
    doc.text(`Check Time: ${result.checkedAt.toLocaleTimeString()}`, 20, 70);
    doc.text(`Search Query: ${result.searchQuery || 'N/A'}`, 20, 80);

    // Screening Summary
    doc.setFontSize(12);
    doc.setTextColor(59, 130, 246);
    doc.text('Screening Summary', 20, 100);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Screening performed: ${result.checkedAt.toLocaleDateString()} at ${result.checkedAt.toLocaleTimeString()}`, 20, 115);
    doc.text(`Databases checked: ${result.checks.length} databases`, 20, 125);

    const latestCheck = result.checks
      .filter(check => check.lastSyncDate)
      .sort((a, b) => new Date(b.lastSyncDate!).getTime() - new Date(a.lastSyncDate!).getTime())[0];
    const latestUpdate = latestCheck?.lastSyncDate ? new Date(latestCheck.lastSyncDate) : null;

    doc.text(`Latest database update: ${latestUpdate?.toLocaleDateString() || 'N/A'}`, 20, 135);
    doc.text(`Report generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 145);

    // Overall Status
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text('Overall Status', 20, 165);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const statusText = `Status: ${result.overallStatus.toUpperCase()}`;
    doc.text(statusText, 20, 180);

    // Summary
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text('Summary', 20, 200);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const summaryLines = doc.splitTextToSize(result.summary, 170);
    doc.text(summaryLines, 20, 215);

    // Recommendations
    let yPosition = 235 + (summaryLines.length * 5);
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('Recommendations', 20, yPosition);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    yPosition += 15;

    result.recommendations.forEach((recommendation, index) => {
      const recLines = doc.splitTextToSize(`${index + 1}. ${recommendation}`, 160);
      doc.text(recLines, 25, yPosition);
      yPosition += recLines.length * 5 + 5;
    });

    // Detailed Checks
    yPosition += 10;
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('Detailed Database Checks', 20, yPosition);

    yPosition += 15;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    result.checks.forEach((check, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }

      // Database name and status
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${check.database} - ${check.status.toUpperCase()}`, 20, yPosition);

      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Entity: ${check.entity} (${check.entityType})`, 25, yPosition);

      yPosition += 6;
      doc.text(`Risk Level: ${check.riskLevel.toUpperCase()}`, 25, yPosition);

      if (check.lastSyncDate) {
        yPosition += 6;
        doc.text(`Database screened: ${new Date(check.lastSyncDate).toLocaleDateString()} at ${new Date(check.lastSyncDate).toLocaleTimeString()}`, 25, yPosition);
      }

      if (check.matchScore) {
        yPosition += 6;
        doc.text(`Match Score: ${Math.round(check.matchScore * 100)}%`, 25, yPosition);
      }

      yPosition += 8;
      const detailsLines = doc.splitTextToSize(check.details || 'No details available', 160);
      doc.text(detailsLines, 25, yPosition);
      yPosition += detailsLines.length * 4 + 10;

      // Add match details if available
      if (check.matches && check.matches.length > 0) {
        check.matches.forEach((match: SanctionEntity) => {
          yPosition += 5;
          doc.setFont('helvetica', 'bold');
          doc.text(`Match: ${match.name}`, 30, yPosition);

          yPosition += 5;
          doc.setFont('helvetica', 'normal');
          if (match.nationality) {
            doc.text(`Nationality: ${match.nationality}`, 35, yPosition);
            yPosition += 4;
          }
          if (match.country) {
            doc.text(`Country: ${match.country}`, 35, yPosition);
            yPosition += 4;
          }
          if (match.remarks) {
            const remarksLines = doc.splitTextToSize(`Remarks: ${match.remarks}`, 140);
            doc.text(remarksLines, 35, yPosition);
            yPosition += remarksLines.length * 4;
          }
        });
      }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pageCount}`, 20, 280);
      doc.text(`Generated by ComplianceGuard on ${new Date().toLocaleDateString()}`, 20, 285);
    }

    // Save the PDF
    const fileName = `ComplianceGuard_Report_${result.projectId}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
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
              Export PDF
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

        {result.searchQuery && (
          <div className="mt-4 p-3 bg-white rounded border">
            <p className="text-sm text-gray-600">
              <strong>Search Query:</strong> {result.searchQuery}
            </p>
          </div>
        )}

        {/* Screening Summary */}
        <div className="mt-4 p-3 bg-white rounded border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Screening performed:</span>
              <div className="text-gray-600">
                {result.checkedAt.toLocaleDateString()} at {result.checkedAt.toLocaleTimeString()}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Databases checked:</span>
              <div className="text-gray-600">
                {result.checks.length} databases
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Latest database update:</span>
              <div className="text-gray-600">
                {(() => {
                  const latestCheck = result.checks
                    .filter(check => check.lastSyncDate)
                    .sort((a, b) => new Date(b.lastSyncDate!).getTime() - new Date(a.lastSyncDate!).getTime())[0];
                  return latestCheck?.lastSyncDate ? new Date(latestCheck.lastSyncDate).toLocaleDateString() : 'N/A';
                })()}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Report generated:</span>
              <div className="text-gray-600">
                {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
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

              {/* Database Screening Date */}
              {check.lastSyncDate && (
                <div className="mb-3 text-xs text-gray-500">
                  <span className="font-medium">Database screened:</span> {new Date(check.lastSyncDate).toLocaleDateString()} at {new Date(check.lastSyncDate).toLocaleTimeString()}
                </div>
              )}

              <p className="text-sm text-gray-600 mb-3">{check.details}</p>

              {check.matchScore && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Match Confidence:</span>
                    <span className="font-medium">{Math.round(check.matchScore * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${check.matchScore >= 0.9 ? 'bg-red-500' :
                        check.matchScore >= 0.7 ? 'bg-orange-500' :
                          check.matchScore >= 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                      style={{ width: `${check.matchScore * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {check.matches && check.matches.length > 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Matched Entities:</h4>
                  {check.matches.map((match: SanctionEntity, matchIndex: number) => (
                    <div key={matchIndex} className="border-l-2 border-blue-400 pl-3 mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        {getEntityTypeIcon(match.type)}
                        <span className="font-medium text-sm">{match.name}</span>
                        <span className="text-xs text-gray-500">({match.type})</span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        {match.nationality && (
                          <div>Nationality: {match.nationality}</div>
                        )}
                        {match.country && (
                          <div>Country: {match.country}</div>
                        )}
                        {match.dateOfBirth && (
                          <div>DOB: {match.dateOfBirth}</div>
                        )}
                        {match.remarks && (
                          <div>Remarks: {match.remarks}</div>
                        )}
                        <div>Listed: {new Date(match.listedDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {check.status !== 'clear' && check.status !== 'no_data' && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                  <strong>Action Required:</strong> Additional review recommended for this entity.
                </div>
              )}

              {check.status === 'no_data' && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                  <strong>Database Unavailable:</strong> This database has not been synchronized or encountered an error.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};