import { z } from 'zod';

// Upload request validation
export const uploadSchema = z.object({
  file: z.any(), // Fastify handles file validation separately
});

// Chat request validation
export const chatSchema = z.object({
  pdfId: z.string().uuid('Invalid PDF ID format'),
  question: z.string().min(1, 'Question is required').max(1000, 'Question too long'),
});

// Document ID validation
export const documentIdSchema = z.object({
  id: z.string().uuid('Invalid document ID format'),
});

// Health check response schema
export const healthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  services: z.object({
    ollama: z.string(),
    pinecone: z.string(),
    openai: z.string(),
  }),
});

// Upload response schema
export const uploadResponseSchema = z.object({
  success: z.boolean(),
  pdfId: z.string().uuid(),
  status: z.string(),
  message: z.string().optional(),
});

// Chat response schema
export const chatResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(z.object({
    text: z.string(),
    score: z.number(),
  })),
});
