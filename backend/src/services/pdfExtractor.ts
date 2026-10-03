const {PDFParse} = require('pdf-parse');
import { logger } from '../utils/logger';

export interface PDFExtractResult {
  text: string;
  numPages: number;
}

export class PDFExtractor {
  async extractPDF(buffer: Buffer): Promise<PDFExtractResult> {
    try {
      logger.info('PDF extraction started', { bufferSize: buffer.length });
      const parser = new PDFParse({data:buffer});
      const data = await parser.getText();
      
      logger.info('PDF extraction completed', { 
        numPages: data.numpages, 
        totalTextLength: data.text.length 
      });
      
      return {
        text: data.text,
        numPages: data.numpages,
      };
    } catch (error) {
      logger.error('PDF extraction failed', error);
      throw new Error(`Failed to extract PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const pdfExtractor = new PDFExtractor();
