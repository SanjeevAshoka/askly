import { logger } from '../utils/logger';

export interface Chunk {
  text: string;
  index: number;
}

export class TextChunker {
  private chunkSize: number;
  private overlap: number;

  constructor(chunkSize: number = 800, overlap: number = 200) {
    this.chunkSize = chunkSize;
    this.overlap = overlap;
  }

  chunkText(text: string): Chunk[] {
    logger.info('Text chunking started', { 
      textLength: text.length, 
      chunkSize: this.chunkSize, 
      overlap: this.overlap 
    });
    
    const chunks: Chunk[] = [];
    let index = 0;

    // Clean the text
    const cleanText = text.replace(/\s+/g, ' ').trim();
    logger.debug('Text cleaned', { cleanTextLength: cleanText.length });

    if (cleanText.length === 0) {
      logger.warn('Empty text after cleaning');
      return chunks;
    }

    let start = 0;
    while (start < cleanText.length) {
      const end = Math.min(start + this.chunkSize, cleanText.length);
      const chunkText = cleanText.slice(start, end);

      chunks.push({
        text: chunkText,
        index: index++,
      });
      if (end === cleanText.length) {
        break;
      }
      // Move start position with overlap
      start = end - this.overlap;

      // Prevent infinite loop if overlap >= chunkSize
      if (start >= end) {
        start = end;
      }
    }

    logger.info('Text chunking completed', { numChunks: chunks.length });
    return chunks;
  }
}

export const textChunker = new TextChunker();
