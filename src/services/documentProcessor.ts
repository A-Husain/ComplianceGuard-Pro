export class DocumentProcessor {
  static async extractFromText(text: string): Promise<ExtractedInfo> {
    const extractedInfo: ExtractedInfo = {
      confidence: 0,
      extractedFields: []
    };

    // Clean and normalize text
    const normalizedText = text.replace(/\s+/g, ' ').trim();
    
    // Extract project name
    const projectNamePatterns = [
      /project\s*(?:name|title)?\s*:?\s*([^\n\r,;]{3,100})/i,
      /(?:project|job|work)\s+(?:called|named|titled)\s+([^\n\r,;]{3,100})/i,
      /(?:re|subject)\s*:?\s*([^\n\r,;]{5,100})/i,
      /proposal\s+for\s+([^\n\r,;]{3,100})/i
    ];

    for (const pattern of projectNamePatterns) {
      const match = normalizedText.match(pattern);
      if (match && match[1]) {
        extractedInfo.projectName = match[1].trim().replace(/['"]/g, '');
        extractedInfo.extractedFields.push('projectName');
        break;
      }
    }

    // Extract client/company information
    const clientPatterns = [
      /(?:client|company|organization|firm)\s*:?\s*([^\n\r,;]{2,80})/i,
      /(?:from|for)\s+([A-Z][a-zA-Z\s&.,'-]{2,80}(?:Inc|LLC|Ltd|Corp|Company|Co\.|GmbH|AG))/,
      /dear\s+([A-Z][a-zA-Z\s&.,'-]{2,80})/i,
      /(?:contact|client)\s+(?:person|name)\s*:?\s*([^\n\r,;]{2,80})/i
    ];

    for (const pattern of clientPatterns) {
      const match = normalizedText.match(pattern);
      if (match && match[1]) {
        extractedInfo.client = match[1].trim().replace(/['"]/g, '');
        extractedInfo.extractedFields.push('client');
        break;
      }
    }

    // Extract location/country
    const locationPatterns = [
      /(?:location|country|region|site)\s*:?\s*([^\n\r,;]{2,50})/i,
      /(?:in|at|located in)\s+([A-Z][a-zA-Z\s-]{2,50})/,
      /(?:delivery to|ship to|destination)\s*:?\s*([^\n\r,;]{2,50})/i,
      /(?:project site|installation site)\s*:?\s*([^\n\r,;]{2,50})/i
    ];

    for (const pattern of locationPatterns) {
      const match = normalizedText.match(pattern);
      if (match && match[1]) {
        extractedInfo.projectLocation = match[1].trim().replace(/['"]/g, '');
        extractedInfo.extractedFields.push('projectLocation');
        break;
      }
    }

    // Extract end user (if different from client)
    const endUserPatterns = [
      /(?:end user|final user|ultimate user)\s*:?\s*([^\n\r,;]{2,80})/i,
      /(?:for use by|to be used by)\s+([^\n\r,;]{2,80})/i,
      /(?:final destination|ultimate destination)\s*:?\s*([^\n\r,;]{2,80})/i
    ];

    for (const pattern of endUserPatterns) {
      const match = normalizedText.match(pattern);
      if (match && match[1]) {
        extractedInfo.endUser = match[1].trim().replace(/['"]/g, '');
        extractedInfo.extractedFields.push('endUser');
        break;
      }
    }

    // Extract project scope/description
    const scopePatterns = [
      /(?:scope|description|details|requirements)\s*:?\s*([^\n\r]{10,500})/i,
      /(?:project involves|work includes|deliverables)\s*:?\s*([^\n\r]{10,500})/i,
      /(?:we need|looking for|require)\s+([^\n\r]{10,500})/i
    ];

    for (const pattern of scopePatterns) {
      const match = normalizedText.match(pattern);
      if (match && match[1]) {
        extractedInfo.projectScope = match[1].trim().replace(/['"]/g, '');
        extractedInfo.extractedFields.push('projectScope');
        break;
      }
    }

    // If no specific scope found, try to extract a general description
    if (!extractedInfo.projectScope) {
      const sentences = normalizedText.split(/[.!?]+/).filter(s => s.length > 20);
      if (sentences.length > 0) {
        extractedInfo.projectScope = sentences.slice(0, 3).join('. ').trim();
        if (extractedInfo.projectScope.length > 10) {
          extractedInfo.extractedFields.push('projectScope');
        }
      }
    }

    // Calculate confidence based on extracted fields
    extractedInfo.confidence = Math.min(100, (extractedInfo.extractedFields.length / 4) * 100);

    return extractedInfo;
  }

  static async processFile(file: File): Promise<ExtractedInfo> {
    if (file.type === 'application/pdf') {
      return this.processPDF(file);
    } else if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
      return this.processTextFile(file);
    } else {
      throw new Error('Unsupported file type. Please upload PDF or text files.');
    }
  }

  private static async processPDF(file: File): Promise<ExtractedInfo> {
    try {
      // For now, we'll simulate PDF processing since pdf-parse requires Node.js
      // In a real implementation, you'd use a PDF processing service or library
      const text = await this.simulatePDFExtraction(file);
      return this.extractFromText(text);
    } catch (error) {
      throw new Error('Failed to process PDF file');
    }
  }

  private static async processTextFile(file: File): Promise<ExtractedInfo> {
    const text = await file.text();
    return this.extractFromText(text);
  }

  private static async simulatePDFExtraction(file: File): Promise<string> {
    // Simulate PDF text extraction - in production, use a proper PDF library
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`
          Project Proposal
          
          Client: Acme Manufacturing Corp
          Project: Industrial Automation System
          Location: Germany
          
          We are requesting a quote for an industrial automation system
          to be installed at our manufacturing facility in Munich, Germany.
          The project involves PLC programming, HMI development, and
          system integration services.
          
          End User: Acme Manufacturing Corp
          Project Scope: Complete automation solution including hardware
          procurement, software development, installation, and commissioning.
        `);
      }, 1000);
    });
  }
}