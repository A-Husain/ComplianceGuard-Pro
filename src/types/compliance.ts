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

export interface SanctionCheck {
  database: string;
  entity: string;
  entityType: 'client' | 'country' | 'individual';
  status: 'clear' | 'flagged' | 'review';
  details?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ComplianceResult {
  projectId: string;
  overallStatus: 'clear' | 'flagged' | 'review';
  checks: SanctionCheck[];
  summary: string;
  recommendations: string[];
  checkedAt: Date;
}

export interface SanctionDatabase {
  name: string;
  region: string;
  description: string;
  lastUpdated: Date;
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