import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { config } from './config/env';
import { uploadRoutes } from './routes/upload';
import { chatRoutes } from './routes/chat';
import { documentRoutes } from './routes/documents';

const fastify = Fastify({
  logger: true,
});

// Register plugins
fastify.register(cors, {
  origin: true,
});

fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Health check route
fastify.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      ollama: config.ollama.host,
      pinecone: config.pinecone.indexName,
      openai: config.openai.chatModel,
    },
  };
});

// Register routes
fastify.register(uploadRoutes);
fastify.register(chatRoutes);
fastify.register(documentRoutes);

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`Server running on http://localhost:${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
