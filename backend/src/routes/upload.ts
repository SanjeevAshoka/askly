import { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import { pdfExtractor } from '../services/pdfExtractor';
import { textChunker } from '../services/textChunker';
import { embeddingService } from '../services/embedding';
import { vectorStore } from '../services/vectorStore';
import { documentStore, Document } from '../services/documentStore';
import { logger } from '../utils/logger';

export async function uploadRoutes(fastify: FastifyInstance) {
  fastify.post('/upload', async (request, reply) => {
    try {
      logger.info('Upload request received');
      
      const data = await request.file();
      
      if (!data) {
        logger.warn('No file uploaded');
        return reply.status(400).send({
          success: false,
          message: 'No file uploaded',
        });
      }

      logger.info(`File received: ${data.filename}`);

      // Validate file type
      if (data.mimetype !== 'application/pdf') {
        logger.warn(`Invalid file type: ${data.mimetype}`);
        return reply.status(400).send({
          success: false,
          message: 'Only PDF files are allowed',
        });
      }

      // Read file buffer
      const buffer = await data.toBuffer();
      logger.info(`Buffer created, size: ${buffer.length} bytes`);

      // Generate PDF ID
      const pdfId = randomUUID();
      logger.info(`Generated PDF ID: ${pdfId}`);

      // Save document metadata
      const document: Document = {
        id: pdfId,
        name: data.filename,
        uploadedAt: new Date(),
        numPages: 0,
        status: 'processing',
      };
      documentStore.save(document);
      logger.info('Document metadata saved');

      // Extract text from PDF
      logger.info('Starting PDF text extraction');
      const { text, numPages } = await pdfExtractor.extractPDF(buffer);
      logger.info(`PDF extracted: ${numPages} pages, ${text.length} characters`);
      document.numPages = numPages;
      document.extractedText = text;

      // Chunk the text
      logger.info('Starting text chunking');
      const chunks = textChunker.chunkText(text);
      logger.info(`Text chunked into ${chunks.length} chunks`);

      // Generate embeddings for each chunk
      logger.info('Starting embedding generation');
      const embeddings = await embeddingService.generateBatchEmbeddings(
        chunks.map(c => c.text)
      );
      logger.info(`Generated ${embeddings.length} embeddings`);

      // Validate embeddings match chunks
      if (embeddings.length !== chunks.length) {
        logger.error('Embeddings count mismatch', { 
          chunks: chunks.length, 
          embeddings: embeddings.length 
        });
        throw new Error(`Embeddings count (${embeddings.length}) does not match chunks count (${chunks.length})`);
      }

      if (embeddings.length === 0) {
        logger.error('No embeddings generated');
        throw new Error('No embeddings were generated');
      }

      // Prepare vectors for Pinecone
      const vectors = chunks.map((chunk, i) => ({
        id: `${pdfId}-${chunk.index}`,
        values: embeddings[i],
        metadata: {
          pdfId,
          chunkIndex: chunk.index,
          text: chunk.text,
        },
      }));
      logger.info(`Prepared ${vectors.length} vectors for Pinecone`);

      // Store vectors in Pinecone
      logger.info('Storing vectors in Pinecone');
      await vectorStore.upsertVectors(vectors);
      logger.info('Vectors stored successfully in Pinecone');

      // Update document status
      documentStore.updateStatus(pdfId, 'ready');
      logger.info('Document status updated to ready');

      return reply.send({
        success: true,
        pdfId,
        status: 'ready',
        message: 'PDF processed successfully',
      });
    } catch (error) {
      logger.error('Upload failed', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to process PDF',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}
