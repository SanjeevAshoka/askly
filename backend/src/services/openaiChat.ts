import OpenAI from 'openai';
import { config } from '../config/env';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
      baseURL: process.env.OPENAI_BASE_URL,
    });
  }

  async generateAnswer(question: string, context: string[]): Promise<string> {
    try {
      const contextText = context.join('\n\n');
      
      const systemPrompt = `You are a helpful assistant that answers questions based on the provided context. 
Use only the information from the context to answer. If the answer is not in the context, say "I don't have enough information to answer this question."`;

      const userPrompt = `Context:\n${contextText}\n\nQuestion: ${question}`;

      const response = await this.client.chat.completions.create({
        model: config.openai.chatModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      return response.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      throw new Error(`Failed to generate answer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const openaiService = new OpenAIService();
