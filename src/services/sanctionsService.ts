import type {
  SanctionCheck,
  SanctionDatabase,
  SanctionEntity,
  SyncStatus,
  FuzzyMatchResult
} from '../types/compliance';

// Real sanctions database configurations
const SANCTIONS_DATABASES: SanctionDatabase[] = [
  {
    name: 'OFAC SDN List',
    region: 'USA',
    description: 'Office of Foreign Assets Control Specially Designated Nationals and Blocked Persons',
    lastUpdated: new Date(),
    sourceUrl: 'https://www.treasury.gov/ofac/downloads/sdnlist.txt',
    entityCount: 0,
    syncStatus: 'never'
  },
  {
    name: 'EU Consolidated Sanctions List',
    region: 'Europe',
    description: 'European Union Consolidated List of Persons, Groups and Entities Subject to EU Financial Sanctions',
    lastUpdated: new Date(),
    sourceUrl: 'https://webgate.ec.europa.eu/fsd/fsf/public/files/csvFullSanctionsList/content',
    entityCount: 0,
    syncStatus: 'never'
  },
  {
    name: 'United Nations Sanctions List',
    region: 'Global',
    description: 'United Nations Security Council Consolidated Sanctions List',
    lastUpdated: new Date(),
    sourceUrl: 'https://scsanctions.un.org/resources/xml/en/consolidated.xml',
    entityCount: 0,
    syncStatus: 'never'
  },
  {
    name: 'HMT Consolidated List',
    region: 'UK',
    description: 'HM Treasury Consolidated List of Financial Sanctions Targets',
    lastUpdated: new Date(),
    sourceUrl: 'https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1234567/consolidated_list_of_financial_sanctions_targets.csv',
    entityCount: 0,
    syncStatus: 'never'
  }
];

// Local storage keys
const STORAGE_KEYS = {
  SANCTIONS_DATA: 'complianceguard_sanctions_data',
  LAST_SYNC: 'complianceguard_last_sync',
  SYNC_STATUS: 'complianceguard_sync_status',
  DATABASES: 'complianceguard_databases'
};

// Fuzzy matching configuration
const FUZZY_CONFIG = {
  MIN_SCORE: 0.3,
  EXACT_MATCH_BONUS: 0.2,
  PARTIAL_MATCH_BONUS: 0.1,
  ALIAS_MATCH_BONUS: 0.15
};

export class SanctionsService {
  private static sanctionsData: Map<string, SanctionEntity[]> = new Map();
  private static lastSync: Date | null = null;
  private static syncInterval: number | null = null;

  // Initialize the service
  static async initialize(): Promise<void> {
    try {
      console.log('=== SanctionsService: Starting initialization ===');
      await this.loadFromStorage();
      console.log('=== SanctionsService: Storage loaded successfully ===');
      await this.checkAndSync();
      console.log('=== SanctionsService: Initial sync completed ===');
      this.startAutoSync();
      console.log('=== SanctionsService: Auto-sync started ===');
    } catch (error) {
      console.error('=== SanctionsService: Error during initialization ===', error);
      // Don't throw the error, just log it and continue
    }
  }

  // Load data from local storage
  private static async loadFromStorage(): Promise<void> {
    try {
      const storedData = localStorage.getItem(STORAGE_KEYS.SANCTIONS_DATA);
      const storedSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      const storedStatus = localStorage.getItem(STORAGE_KEYS.SYNC_STATUS);

      if (storedData) {
        const parsedData = JSON.parse(storedData);
        this.sanctionsData = new Map(Object.entries(parsedData));
      }

      if (storedSync) {
        this.lastSync = new Date(storedSync);
      }

      if (storedStatus) {
        const statusData = JSON.parse(storedStatus);
        SANCTIONS_DATABASES.forEach(db => {
          const status = statusData[db.name];
          if (status) {
            db.syncStatus = status.status;
            db.lastSyncAttempt = status.lastSyncAttempt ? new Date(status.lastSyncAttempt) : undefined;
            db.errorMessage = status.errorMessage;
            db.entityCount = status.entityCount || 0;
          }
        });
      }
    } catch (error) {
      console.error('Error loading sanctions data from storage:', error);
    }
  }

  // Save data to local storage
  private static async saveToStorage(): Promise<void> {
    try {
      const dataObject = Object.fromEntries(this.sanctionsData);
      localStorage.setItem(STORAGE_KEYS.SANCTIONS_DATA, JSON.stringify(dataObject));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, this.lastSync?.toISOString() || '');

      const statusData = Object.fromEntries(
        SANCTIONS_DATABASES.map(db => [
          db.name,
          {
            status: db.syncStatus,
            lastSyncAttempt: db.lastSyncAttempt?.toISOString(),
            errorMessage: db.errorMessage,
            entityCount: db.entityCount
          }
        ])
      );
      localStorage.setItem(STORAGE_KEYS.SYNC_STATUS, JSON.stringify(statusData));
    } catch (error) {
      console.error('Error saving sanctions data to storage:', error);
    }
  }

  // Check if sync is needed (every 24 hours)
  private static async checkAndSync(): Promise<void> {
    const now = new Date();
    const hoursSinceLastSync = this.lastSync
      ? (now.getTime() - this.lastSync.getTime()) / (1000 * 60 * 60)
      : 25; // Force sync if never synced

    if (hoursSinceLastSync >= 24) {
      await this.syncAllDatabases();
    }
  }

  // Start automatic sync every 24 hours
  private static startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.syncAllDatabases();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  // Sync all databases
  static async syncAllDatabases(): Promise<SyncStatus[]> {
    const results: SyncStatus[] = [];

    for (const db of SANCTIONS_DATABASES) {
      try {
        db.syncStatus = 'syncing';
        db.lastSyncAttempt = new Date();
        await this.saveToStorage();

        const entities = await this.fetchSanctionsData(db);
        this.sanctionsData.set(db.name, entities);
        db.entityCount = entities.length;
        db.syncStatus = 'synced';
        db.lastUpdated = new Date();
        db.errorMessage = undefined;

        results.push({
          database: db.name,
          status: 'synced',
          lastSync: new Date(),
          entityCount: entities.length
        });
      } catch (error) {
        db.syncStatus = 'error';
        db.errorMessage = error instanceof Error ? error.message : 'Unknown error';

        results.push({
          database: db.name,
          status: 'error',
          lastSync: new Date(),
          entityCount: 0,
          errorMessage: db.errorMessage
        });
      }
    }

    this.lastSync = new Date();
    await this.saveToStorage();
    return results;
  }

  // Fetch sanctions data from official sources
  private static async fetchSanctionsData(db: SanctionDatabase): Promise<SanctionEntity[]> {
    // Note: In a real implementation, you would fetch from actual APIs
    // For now, we'll simulate the data structure with realistic mock data

    const mockData: SanctionEntity[] = [];

    switch (db.name) {
      case 'OFAC SDN List':
        mockData.push(
          {
            id: 'ofac-001',
            name: 'AHMAD KHALIL ARIF AL-DULAYMI',
            aliases: ['AHMAD AL-DULAYMI', 'KHALIL ARIF'],
            type: 'individual',
            nationality: 'Iraqi',
            country: 'Iraq',
            dateOfBirth: '1960-01-01',
            placeOfBirth: 'Baghdad, Iraq',
            passportNumbers: ['I123456789'],
            nationalIds: ['IRQ123456'],
            addresses: ['Baghdad, Iraq'],
            remarks: 'Former Iraqi official',
            listedDate: new Date('2003-03-20'),
            source: 'OFAC SDN List'
          },
          {
            id: 'ofac-002',
            name: 'IRANIAN REVOLUTIONARY GUARD CORPS',
            aliases: ['IRGC', 'PASDARAN', 'REVOLUTIONARY GUARDS'],
            type: 'entity',
            country: 'Iran',
            addresses: ['Tehran, Iran'],
            remarks: 'Iranian military organization',
            listedDate: new Date('2007-10-25'),
            source: 'OFAC SDN List'
          }
        );
        break;

      case 'EU Consolidated Sanctions List':
        mockData.push(
          {
            id: 'eu-001',
            name: 'ALEXANDER LUKASHENKO',
            aliases: ['ALYAKSANDR LUKASHENKA'],
            type: 'individual',
            nationality: 'Belarusian',
            country: 'Belarus',
            dateOfBirth: '1954-08-30',
            placeOfBirth: 'Kopys, Belarus',
            passportNumbers: ['AB1234567'],
            nationalIds: ['BLR123456'],
            addresses: ['Minsk, Belarus'],
            remarks: 'President of Belarus',
            listedDate: new Date('2020-10-02'),
            source: 'EU Consolidated Sanctions List'
          }
        );
        break;

      case 'United Nations Sanctions List':
        mockData.push(
          {
            id: 'un-001',
            name: 'KIM JONG-UN',
            aliases: ['KIM JONG UN', 'KIM JONG IL'],
            type: 'individual',
            nationality: 'North Korean',
            country: 'North Korea',
            dateOfBirth: '1984-01-08',
            placeOfBirth: 'Pyongyang, North Korea',
            passportNumbers: ['KP123456789'],
            nationalIds: ['PRK123456'],
            addresses: ['Pyongyang, North Korea'],
            remarks: 'Supreme Leader of North Korea',
            listedDate: new Date('2006-10-14'),
            source: 'United Nations Sanctions List'
          }
        );
        break;

      case 'HMT Consolidated List':
        mockData.push(
          {
            id: 'hmt-001',
            name: 'VLADIMIR PUTIN',
            aliases: ['VLADIMIR VLADIMIROVICH PUTIN'],
            type: 'individual',
            nationality: 'Russian',
            country: 'Russia',
            dateOfBirth: '1952-10-07',
            placeOfBirth: 'Leningrad, USSR',
            passportNumbers: ['RU123456789'],
            nationalIds: ['RUS123456'],
            addresses: ['Moscow, Russia'],
            remarks: 'President of Russia',
            listedDate: new Date('2022-02-25'),
            source: 'HMT Consolidated List'
          }
        );
        break;
    }

    return mockData;
  }

  // Fuzzy string matching using Levenshtein distance
  private static calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1.0;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));

    for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= s2.length; j++) {
      for (let i = 1; i <= s1.length; i++) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    const maxLength = Math.max(s1.length, s2.length);
    return 1 - (matrix[s2.length][s1.length] / maxLength);
  }

  // Find fuzzy matches across all databases
  private static findFuzzyMatches(query: string): FuzzyMatchResult[] {
    const results: FuzzyMatchResult[] = [];
    const normalizedQuery = query.toLowerCase().trim();

    for (const [dbName, entities] of this.sanctionsData) {
      for (const entity of entities) {
        // Check main name
        const nameScore = this.calculateSimilarity(normalizedQuery, entity.name);
        if (nameScore >= FUZZY_CONFIG.MIN_SCORE) {
          results.push({
            entity,
            score: nameScore + (nameScore === 1 ? FUZZY_CONFIG.EXACT_MATCH_BONUS : 0),
            matchedField: 'name',
            matchedValue: entity.name
          });
        }

        // Check aliases
        for (const alias of entity.aliases) {
          const aliasScore = this.calculateSimilarity(normalizedQuery, alias);
          if (aliasScore >= FUZZY_CONFIG.MIN_SCORE) {
            results.push({
              entity,
              score: aliasScore + FUZZY_CONFIG.ALIAS_MATCH_BONUS,
              matchedField: 'alias',
              matchedValue: alias
            });
          }
        }

        // Check nationality/country
        if (entity.nationality) {
          const nationalityScore = this.calculateSimilarity(normalizedQuery, entity.nationality);
          if (nationalityScore >= FUZZY_CONFIG.MIN_SCORE) {
            results.push({
              entity,
              score: nationalityScore + FUZZY_CONFIG.PARTIAL_MATCH_BONUS,
              matchedField: 'nationality',
              matchedValue: entity.nationality
            });
          }
        }

        if (entity.country) {
          const countryScore = this.calculateSimilarity(normalizedQuery, entity.country);
          if (countryScore >= FUZZY_CONFIG.MIN_SCORE) {
            results.push({
              entity,
              score: countryScore + FUZZY_CONFIG.PARTIAL_MATCH_BONUS,
              matchedField: 'country',
              matchedValue: entity.country
            });
          }
        }
      }
    }

    // Sort by score and remove duplicates
    return results
      .sort((a, b) => b.score - a.score)
      .filter((result, index, self) =>
        index === self.findIndex(r => r.entity.id === result.entity.id)
      );
  }

  // Main entity checking function
  static async checkEntity(entityName: string, entityType: 'client' | 'country' | 'individual'): Promise<SanctionCheck[]> {
    // Ensure data is loaded
    if (this.sanctionsData.size === 0) {
      await this.loadFromStorage();
    }

    const checks: SanctionCheck[] = [];
    const fuzzyMatches = this.findFuzzyMatches(entityName);

    for (const db of SANCTIONS_DATABASES) {
      const dbEntities = this.sanctionsData.get(db.name) || [];
      const dbMatches = fuzzyMatches.filter(match => match.entity.source === db.name);

      let status: 'clear' | 'flagged' | 'review' | 'no_data' = 'clear';
      let details = '';
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      let matches: SanctionEntity[] = [];
      let matchScore = 0;

      if (dbMatches.length > 0) {
        const bestMatch = dbMatches[0];
        matchScore = bestMatch.score;
        matches = [bestMatch.entity];

        if (bestMatch.score >= 0.9) {
          status = 'flagged';
          riskLevel = 'high';
          details = `Exact or near-exact match found in ${db.name}. Entity "${entityName}" matches "${bestMatch.matchedValue}" (${bestMatch.matchedField}) with ${Math.round(bestMatch.score * 100)}% confidence.`;
        } else if (bestMatch.score >= 0.7) {
          status = 'flagged';
          riskLevel = 'high';
          details = `High-confidence match found in ${db.name}. Entity "${entityName}" matches "${bestMatch.matchedValue}" (${bestMatch.matchedField}) with ${Math.round(bestMatch.score * 100)}% confidence.`;
        } else if (bestMatch.score >= 0.5) {
          status = 'review';
          riskLevel = 'medium';
          details = `Potential match found in ${db.name}. Entity "${entityName}" matches "${bestMatch.matchedValue}" (${bestMatch.matchedField}) with ${Math.round(bestMatch.score * 100)}% confidence. Manual review recommended.`;
        } else {
          status = 'review';
          riskLevel = 'low';
          details = `Low-confidence match found in ${db.name}. Entity "${entityName}" matches "${bestMatch.matchedValue}" (${bestMatch.matchedField}) with ${Math.round(bestMatch.score * 100)}% confidence.`;
        }
      } else {
        if (db.syncStatus === 'synced' && db.entityCount > 0) {
          details = `No matches found in ${db.name}. Entity "${entityName}" is not listed in this database.`;
        } else if (db.syncStatus === 'error') {
          status = 'no_data';
          details = `Unable to search ${db.name} due to sync error: ${db.errorMessage}. Please try again later or contact support.`;
        } else {
          status = 'no_data';
          details = `Database ${db.name} has not been synchronized yet. Please wait for the next sync cycle or contact support to request immediate sync.`;
        }
      }

      checks.push({
        database: db.name,
        entity: entityName,
        entityType,
        status,
        details,
        riskLevel,
        matches,
        matchScore,
        lastSyncDate: db.lastUpdated
      });
    }

    return checks;
  }

  // Get database information
  static getDatabases(): SanctionDatabase[] {
    return SANCTIONS_DATABASES;
  }

  // Get sync status
  static getSyncStatus(): SyncStatus[] {
    return SANCTIONS_DATABASES.map(db => ({
      database: db.name,
      status: db.syncStatus,
      lastSync: db.lastUpdated,
      entityCount: db.entityCount,
      errorMessage: db.errorMessage
    }));
  }

  // Force manual sync
  static async forceSync(): Promise<SyncStatus[]> {
    return await this.syncAllDatabases();
  }

  // Get fuzzy matches for a query
  static getFuzzyMatches(query: string): FuzzyMatchResult[] {
    return this.findFuzzyMatches(query);
  }

  // Cleanup
  static cleanup(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}