import type { SanctionCheck, SanctionDatabase } from '../types/compliance';

// Mock sanctions databases
const SANCTIONS_DATABASES: SanctionDatabase[] = [
  {
    name: 'OFAC SDN List',
    region: 'USA',
    description: 'Office of Foreign Assets Control Specially Designated Nationals',
    lastUpdated: new Date('2025-01-15')
  },
  {
    name: 'EU Consolidated List',
    region: 'Europe',
    description: 'European Union Consolidated List of Sanctions',
    lastUpdated: new Date('2025-01-14')
  },
  {
    name: 'UN Security Council',
    region: 'Global',
    description: 'United Nations Security Council Sanctions List',
    lastUpdated: new Date('2025-01-13')
  },
  {
    name: 'UK HMT List',
    region: 'UK',
    description: 'HM Treasury Consolidated List of Targets',
    lastUpdated: new Date('2025-01-12')
  }
];

// Mock flagged entities for demonstration
const MOCK_FLAGGED_ENTITIES = [
  'sanctioned-company-ltd',
  'blocked-individual',
  'iran',
  'north korea',
  'russia',
  'belarus',
  'syria',
  'crimea'
];

const MOCK_REVIEW_ENTITIES = [
  'review-required-corp',
  'partial-sanctions-country',
  'china',
  'venezuela'
];

export class SanctionsService {
  static async checkEntity(entityName: string, entityType: 'client' | 'country' | 'individual'): Promise<SanctionCheck[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const checks: SanctionCheck[] = [];
    const normalizedEntity = entityName.toLowerCase().trim();

    for (const db of SANCTIONS_DATABASES) {
      let status: 'clear' | 'flagged' | 'review' = 'clear';
      let details = '';
      let riskLevel: 'low' | 'medium' | 'high' = 'low';

      if (MOCK_FLAGGED_ENTITIES.includes(normalizedEntity)) {
        status = 'flagged';
        details = `Entity "${entityName}" found on ${db.name}`;
        riskLevel = 'high';
      } else if (MOCK_REVIEW_ENTITIES.includes(normalizedEntity)) {
        status = 'review';
        details = `Entity "${entityName}" requires additional review per ${db.name}`;
        riskLevel = 'medium';
      } else {
        details = `No matches found in ${db.name}`;
      }

      checks.push({
        database: db.name,
        entity: entityName,
        entityType,
        status,
        details,
        riskLevel
      });
    }

    return checks;
  }

  static getDatabases(): SanctionDatabase[] {
    return SANCTIONS_DATABASES;
  }
}