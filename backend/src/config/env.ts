import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY || '',
    indexName: process.env.PINECONE_INDEX_NAME || '',
    environment: process.env.PINECONE_ENVIRONMENT || 'us-east-1-aws',
  },
  openai: {
    apiKey: process.env.OPENAI_API_TOKEN || '',
    chatModel: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
  },
  ollama: {
    host: process.env.OLLAMA_HOST || 'http://localhost:11434',
    embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'PINECONE_API_KEY',
  'PINECONE_INDEX_NAME',
  'OPENAI_API_TOKEN',
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}
