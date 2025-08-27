import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ComplianceGuard Pro</h1>
              <p className="text-sm text-gray-600">Advanced Export Control & Sanctions Screening</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
              Databases Online
            </div>
            <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};