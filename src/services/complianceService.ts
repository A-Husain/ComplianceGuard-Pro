import type { ProjectInfo, ComplianceResult, SanctionCheck } from '../types/compliance';
import { SanctionsService } from './sanctionsService';

export class ComplianceService {
  static async runDAMEXCheck(projectInfo: ProjectInfo): Promise<ComplianceResult> {
    const allChecks: SanctionCheck[] = [];
    
    // Check client/end user
    const clientChecks = await SanctionsService.checkEntity(projectInfo.client, 'client');
    allChecks.push(...clientChecks);
    
    if (projectInfo.endUser && projectInfo.endUser !== projectInfo.client) {
      const endUserChecks = await SanctionsService.checkEntity(projectInfo.endUser, 'individual');
      allChecks.push(...endUserChecks);
    }
    
    // Check project location (country)
    const locationChecks = await SanctionsService.checkEntity(projectInfo.projectLocation, 'country');
    allChecks.push(...locationChecks);
    
    // Determine overall status
    const hasFlagged = allChecks.some(check => check.status === 'flagged');
    const hasReview = allChecks.some(check => check.status === 'review');
    
    let overallStatus: 'clear' | 'flagged' | 'review';
    if (hasFlagged) {
      overallStatus = 'flagged';
    } else if (hasReview) {
      overallStatus = 'review';
    } else {
      overallStatus = 'clear';
    }
    
    // Generate summary and recommendations
    const { summary, recommendations } = this.generateSummaryAndRecommendations(allChecks, overallStatus);
    
    return {
      projectId: projectInfo.id,
      overallStatus,
      checks: allChecks,
      summary,
      recommendations,
      checkedAt: new Date()
    };
  }
  
  private static generateSummaryAndRecommendations(
    checks: SanctionCheck[], 
    overallStatus: 'clear' | 'flagged' | 'review'
  ): { summary: string; recommendations: string[] } {
    const flaggedCount = checks.filter(c => c.status === 'flagged').length;
    const reviewCount = checks.filter(c => c.status === 'review').length;
    const clearCount = checks.filter(c => c.status === 'clear').length;
    
    let summary = '';
    const recommendations: string[] = [];
    
    switch (overallStatus) {
      case 'clear':
        summary = `Compliance screening completed successfully. All entities cleared across ${checks.length} database checks. No sanctions or embargo restrictions identified.`;
        recommendations.push('Project may proceed as planned');
        recommendations.push('Maintain records for compliance audit purposes');
        recommendations.push('Re-run check before final delivery');
        break;
        
      case 'review':
        summary = `Compliance screening identified ${reviewCount} entities requiring additional review. Enhanced due diligence recommended before proceeding.`;
        recommendations.push('Conduct enhanced due diligence on flagged entities');
        recommendations.push('Consult legal/compliance team before proceeding');
        recommendations.push('Document additional verification steps taken');
        recommendations.push('Consider risk mitigation measures');
        break;
        
      case 'flagged':
        summary = `Compliance screening FAILED. ${flaggedCount} entities found on sanctions lists. Project cannot proceed without compliance clearance.`;
        recommendations.push('DO NOT PROCEED with current project structure');
        recommendations.push('Immediate legal/compliance review required');
        recommendations.push('Consider alternative project structure or partners');
        recommendations.push('Document all findings for regulatory reporting');
        break;
    }
    
    return { summary, recommendations };
  }
}