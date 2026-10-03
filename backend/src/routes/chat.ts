import { FastifyInstance } from 'fastify';
import { chatSchema } from '../utils/validation';
import { embeddingService } from '../services/embedding';
import { vectorStore } from '../services/vectorStore';
import { openaiService } from '../services/openaiChat';
import { documentStore } from '../services/documentStore';
import { logger } from '../utils/logger';

export async function chatRoutes(fastify: FastifyInstance) {
  fastify.post('/chat', async (request, reply) => {
    try {
      logger.info('Chat request received');
      
      // Validate request body
      const { pdfId, question } = chatSchema.parse(request.body);
      logger.info('Chat request validated', { pdfId, questionLength: question.length });

      // Check if document exists and is ready
      const document = documentStore.get(pdfId);
      if (!document) {
        logger.warn('Document not found', { pdfId });
        return reply.status(404).send({
          error: 'Document not found',
        });
      }

      if (document.status !== 'ready') {
        logger.warn('Document not ready', { pdfId, status: document.status });
        return reply.status(400).send({
          error: 'Document is not ready for chat',
          status: document.status,
        });
      }

      // Generate embedding for the question
      logger.info('Generating question embedding');
      const questionEmbedding = await embeddingService.generateEmbedding(question);

      // Query Pinecone for similar chunks
      logger.info('Querying Pinecone for similar chunks');
      const results = await vectorStore.queryVectors(questionEmbedding, pdfId, 5);
      logger.info('Query completed', { numResults: results.length });

      if (results.length === 0) {
        logger.warn('No relevant chunks found');
        return reply.send({
          answer: 'I could not find relevant information in the document to answer your question.',
          sources: [],
        });
      }

      // Extract context from results
      const context = results.map(r => r.text);
      logger.info('Context extracted', { contextLength: context.length });

      // Generate answer using OpenAI
      logger.info('Generating answer with OpenAI');
      const answer = await openaiService.generateAnswer(question, context);
      logger.info('Answer generated', { answerLength: answer.length });

      // Prepare sources
      const sources = results.map(r => ({
        text: r.text,
        score: r.score,
      }));

      return reply.send({
        answer,
        sources,
      });
    } catch (error) {
      logger.error('Chat request failed', error);
      
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Invalid request',
          details: error.message,
        });
      }

      return reply.status(500).send({
        error: 'Failed to process chat request',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}
