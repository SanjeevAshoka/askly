import { FastifyInstance } from 'fastify';
import { documentStore } from '../services/documentStore';

export async function documentRoutes(fastify: FastifyInstance) {
  // Get document by ID
  fastify.get('/documents/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const document = documentStore.get(id);
      
      if (!document) {
        return reply.status(404).send({
          error: 'Document not found',
        });
      }

      return reply.send({
        id: document.id,
        name: document.name,
        uploadedAt: document.uploadedAt,
        numPages: document.numPages,
        status: document.status,
        extractedText: document.extractedText,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Failed to fetch document',
      });
    }
  });

  // Get all documents
  fastify.get('/documents', async (request, reply) => {
    try {
      const documents = documentStore.getAll();
      
      return reply.send({
        documents: documents.map(doc => ({
          id: doc.id,
          name: doc.name,
          uploadedAt: doc.uploadedAt,
          numPages: doc.numPages,
          status: doc.status,
        })),
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Failed to fetch documents',
      });
    }
  });
}
