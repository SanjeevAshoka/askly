import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export interface VectorData {
  id: string;
  values: number[];
  metadata: {
    pdfId: string;
    chunkIndex: number;
    text: string;
  };
}

export interface QueryResult {
  text: string;
  score: number;
  metadata: any;
}

export class VectorStore {
  private pinecone: Pinecone;
  private indexName: string;

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: config.pinecone.apiKey,
    });
    this.indexName = config.pinecone.indexName;
    logger.info('Vector store initialized', { 
      indexName: this.indexName,
      apiKeyPrefix: config.pinecone.apiKey.substring(0, 10) + '...'
    });
  }

  private async getIndex() {
    logger.debug('Getting Pinecone index', { indexName: this.indexName });
    const index = this.pinecone.index(this.indexName);
    logger.debug('Pinecone index retrieved');
    return index;
  }

async upsertVectors(vectors: VectorData[]): Promise<void> {
  try {
    logger.info('Upserting vectors to Pinecone', {
      numVectors: vectors.length,
    });

    if (vectors.length === 0) {
      throw new Error('No vectors to upsert');
    }

    const index = await this.getIndex();

    const pineconeVectors = vectors.map(v => ({
      id: v.id,
      values: v.values,
      metadata: v.metadata,
    }));

    logger.info('Mapped vectors', {
      numPineconeVectors: pineconeVectors.length,
      firstVector: {
        id: pineconeVectors[0].id,
        valuesLength: pineconeVectors[0].values?.length || 0,
        hasMetadata: !!pineconeVectors[0].metadata,
      },
    });

    // Log the actual upsert payload
    const upsertPayload = { records: pineconeVectors };
    logger.info('Upsert payload', {
      hasRecords: !!upsertPayload.records,
      recordsLength: upsertPayload.records?.length,
      recordsArray: Array.isArray(upsertPayload.records)
    });

    await index.upsert(upsertPayload);

    logger.info('Vectors upserted successfully');
  } catch (error) {
    logger.error('Failed to upsert vectors', error);
    throw new Error(
      `Failed to upsert vectors: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
}

  async queryVectors(
    queryVector: number[],
    pdfId: string,
    topK: number = 5
  ): Promise<QueryResult[]> {
    try {
      logger.info('Querying vectors', { pdfId, topK });
      const index = await this.getIndex();
      
      const queryResponse = await index.query({
        vector: queryVector,
        topK,
        filter: {
          pdfId: { $eq: pdfId },
        },
        includeMetadata: true,
      });

      const results: QueryResult[] = [];
      
      if (queryResponse.matches) {
        for (const match of queryResponse.matches) {
          if (match.metadata) {
            results.push({
              text: match.metadata.text as string,
              score: match.score || 0,
              metadata: match.metadata,
            });
          }
        }
      }

      logger.info('Query completed', { numResults: results.length });
      return results;
    } catch (error) {
      logger.error('Failed to query vectors', error);
      throw new Error(`Failed to query vectors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteByPdfId(pdfId: string): Promise<void> {
    try {
      logger.info('Deleting vectors', { pdfId });
      const index = await this.getIndex();
      
      await index.deleteMany({
        filter: {
          pdfId: { $eq: pdfId },
        },
      });
      logger.info('Vectors deleted successfully');
    } catch (error) {
      logger.error('Failed to delete vectors', error);
      throw new Error(`Failed to delete vectors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const vectorStore = new VectorStore();
