import React, { useState } from 'react';
import { Header } from './components/Header';
import { ProjectForm } from './components/ProjectForm';
import { LoadingScreen } from './components/LoadingScreen';
import { ComplianceResults } from './components/ComplianceResults';
import { ComplianceService } from './services/complianceService';
import type { ProjectInfo, ComplianceResult } from './types/compliance';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<ComplianceResult | null>(null);

  const handleSubmitProject = async (projectInfo: ProjectInfo) => {
    setIsLoading(true);
    setCurrentResult(null);

    try {
      const result = await ComplianceService.runDAMEXCheck(projectInfo);
      setCurrentResult(result);
    } catch (error) {
      console.error('Compliance check failed:', error);
      // In production, show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewCheck = () => {
    setCurrentResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <LoadingScreen />
        ) : currentResult ? (
          <ComplianceResults result={currentResult} onNewCheck={handleNewCheck} />
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Compliance Screening Dashboard</h2>
              <p className="text-lg text-gray-600">
                Screen your projects against global sanctions and embargo lists to ensure regulatory compliance.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ProjectForm onSubmit={handleSubmitProject} isLoading={isLoading} />
              </div>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Coverage</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">USA (OFAC)</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">EU Sanctions</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">UN Security Council</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">UK HMT</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Practices</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Run initial check upon customer inquiry
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Re-check before final delivery
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Document all screening results
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Review flagged entities with legal team
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;