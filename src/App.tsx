import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProjectForm } from './components/ProjectForm';
import { LoadingScreen } from './components/LoadingScreen';
import { ComplianceResults } from './components/ComplianceResults';
import { SyncStatusComponent } from './components/SyncStatus';
import { ComplianceService } from './services/complianceService';
import { SanctionsService } from './services/sanctionsService';
import type { ProjectInfo, ComplianceResult } from './types/compliance';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<ComplianceResult | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await SanctionsService.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize sanctions service:', error);
        setIsInitialized(true); // Still set to true to show the app
      }
    };

    initializeApp();
  }, []);

  const handleSubmitProject = async (projectInfo: ProjectInfo) => {
    console.log('=== Starting compliance check ===');
    console.log('Project info:', projectInfo);
    
    setIsLoading(true);
    setCurrentResult(null);

    try {
      console.log('Starting compliance check for project:', projectInfo);
      const result = await ComplianceService.runDAMEXCheck(projectInfo);
      console.log('Compliance check completed successfully:', result);
      setCurrentResult(result);
    } catch (error) {
      console.error('Compliance check failed with error:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Show error to user
      alert(`Compliance check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Reset loading state
      setIsLoading(false);
    } finally {
      console.log('=== Compliance check finished ===');
      setIsLoading(false);
    }
  };

  const handleNewCheck = () => {
    setCurrentResult(null);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing ComplianceGuard...</p>
        </div>
      </div>
    );
  }

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
                <SyncStatusComponent />

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
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Use fuzzy matching for partial name matches
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