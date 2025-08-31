export interface ProjectInfo {
  id: string;
  projectName: string;
  projectLocation: string;
  endUser: string;
  client: string;
  projectScope: string;
  checkType: 'inquiry' | 'pre-delivery';
  createdAt: Date;
  status: 'pending' | 'clear' | 'flagged' | 'review';
}

export interface SanctionEntity {
  id: string;
  name: string;
  aliases: string[];
  type: 'individual' | 'entity' | 'vessel' | 'aircraft';
  nationality?: string;
  country?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  passportNumbers?: string[];
  nationalIds?: string[];
  addresses?: string[];
  remarks?: string;
  listedDate: Date;
  source: string;
  matchScore?: number;
}

export interface SanctionCheck {
  database: string;
  entity: string;
  entityType: 'client' | 'country' | 'individual';
  status: 'clear' | 'flagged' | 'review' | 'no_data';
  details?: string;
  riskLevel: 'low' | 'medium' | 'high';
  matches?: SanctionEntity[];
  matchScore?: number;
  lastSyncDate?: Date;
}

export interface ComplianceResult {
  projectId: string;
  overallStatus: 'clear' | 'flagged' | 'review';
  checks: SanctionCheck[];
  summary: string;
  recommendations: string[];
  checkedAt: Date;
  searchQuery: string;
  fuzzyMatches?: SanctionEntity[];
}

export interface SanctionDatabase {
  name: string;
  region: string;
  description: string;
  lastUpdated: Date;
  sourceUrl: string;
  entityCount: number;
  syncStatus: 'syncing' | 'synced' | 'error' | 'never';
  lastSyncAttempt?: Date;
  errorMessage?: string;
}

export interface ExtractedInfo {
  projectName?: string;
  projectLocation?: string;
  endUser?: string;
  client?: string;
  projectScope?: string;
  confidence: number;
  extractedFields: string[];
}

export interface DocumentProcessingResult {
  success: boolean;
  extractedInfo?: ExtractedInfo;
  error?: string;
}

export interface SyncStatus {
  database: string;
  status: 'syncing' | 'synced' | 'error' | 'never';
  lastSync: Date;
  entityCount: number;
  errorMessage?: string;
}

export interface FuzzyMatchResult {
  entity: SanctionEntity;
  score: number;
  matchedField: string;
  matchedValue: string;
}