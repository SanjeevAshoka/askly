import { Ollama } from 'ollama';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export class EmbeddingService {
  private ollama: Ollama;

  constructor() {
    this.ollama = new Ollama({ host: config.ollama.host });
    logger.info('Embedding service initialized', { host: config.ollama.host });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      logger.debug('Generating embedding', { textLength: text.length });
      const response = await this.ollama.embeddings({
        model: config.ollama.embeddingModel,
        prompt: text,
      });
      logger.debug('Embedding generated', { dimension: response.embedding.length });
      return response.embedding;
    } catch (error) {
      logger.error('Failed to generate embedding', error);
      throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    logger.info('Batch embedding generation started', { numTexts: texts.length });
    const embeddings: number[][] = [];
    const batchSize = 5; // Process in smaller batches to avoid memory issues
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      logger.debug(`Processing batch ${Math.floor(i / batchSize) + 1}, size: ${batch.length}`);
      
      for (const text of batch) {
        const embedding = await this.generateEmbedding(text);
        embeddings.push(embedding);
      }
      
      // Force garbage collection hint
      if (global.gc) {
        global.gc();
      }
    }

    logger.info('Batch embedding generation completed', { numEmbeddings: embeddings.length });
    return embeddings;
  }
}

export const embeddingService = new EmbeddingService();
