import React from 'react';
import { Database, Search, Shield, Globe } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  const databases = [
    { name: 'OFAC SDN List', region: 'USA', icon: Shield },
    { name: 'EU Consolidated List', region: 'Europe', icon: Globe },
    { name: 'UN Security Council', region: 'Global', icon: Database },
    { name: 'UK HMT List', region: 'UK', icon: Search }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Running Compliance Screening</h2>
        <p className="text-gray-600">Screening against multiple sanctions databases...</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {databases.map((db, index) => {
          const Icon = db.icon;
          return (
            <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{db.name}</h3>
                <p className="text-sm text-gray-600">{db.region}</p>
              </div>
              <div className="ml-auto">
                <div className="animate-pulse h-2 w-2 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Processing:</strong> Checking entities against sanctions, embargo, and restricted party lists
          from USA, EU, UN, and other regulatory authorities.
        </p>
      </div>
    </div>
  );
};