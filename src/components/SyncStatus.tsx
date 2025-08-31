import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { SanctionsService } from '../services/sanctionsService';
import type { SyncStatus } from '../types/compliance';

export const SyncStatusComponent: React.FC = () => {
    const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        loadSyncStatus();
    }, []);

    const loadSyncStatus = () => {
        const statuses = SanctionsService.getSyncStatus();
        setSyncStatuses(statuses);
    };

    const handleManualSync = async () => {
        setIsSyncing(true);
        try {
            await SanctionsService.forceSync();
            loadSyncStatus();
        } catch (error) {
            console.error('Manual sync failed:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'synced':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'syncing':
                return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
            case 'error':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'never':
                return <Clock className="h-4 w-4 text-gray-600" />;
            default:
                return <AlertTriangle className="h-4 w-4 text-amber-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'synced':
                return 'bg-green-100 text-green-800';
            case 'syncing':
                return 'bg-blue-100 text-blue-800';
            case 'error':
                return 'bg-red-100 text-red-800';
            case 'never':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-amber-100 text-amber-800';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Database Status</h3>
                <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
            </div>

            <div className="space-y-3">
                {syncStatuses.map((status) => (
                    <div key={status.database} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                        <div className="flex items-center">
                            {getStatusIcon(status.status)}
                            <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{status.database}</div>
                                <div className="text-xs text-gray-500">
                                    {status.status === 'synced' && status.lastSync && (
                                        <>Last sync: {new Date(status.lastSync).toLocaleDateString()}</>
                                    )}
                                    {status.status === 'error' && status.errorMessage && (
                                        <>Error: {status.errorMessage}</>
                                    )}
                                    {status.status === 'never' && (
                                        <>Never synced</>
                                    )}
                                    {status.entityCount > 0 && (
                                        <span className="ml-2">• {status.entityCount.toLocaleString()} entities</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status.status)}`}>
                            {status.status.toUpperCase()}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
                <div className="font-medium mb-1">Auto-sync Information:</div>
                <div>• Databases sync automatically every 24 hours</div>
                <div>• Manual sync available for immediate updates</div>
                <div>• Data is cached locally for fast searches</div>
            </div>
        </div>
    );
};
