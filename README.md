# RAG PDF Chat Application

A simple RAG (Retrieval-Augmented Generation) application that allows users to upload PDFs and ask questions about their content.

## Tech Stack

**Backend:**
- Node.js, Fastify, TypeScript
- Ollama (local embeddings - nomic-embed-text)
- Pinecone (vector database)
- OpenAI API (chat responses)
- pdf-parse (PDF text extraction)

**Frontend:**
- React, TypeScript, Webpack
- Styled Components
- Zustand (state management)

## Setup

### Prerequisites
- Node.js (v20+)
- Ollama installed (https://ollama.ai/download)
- Pinecone account (free tier)
- OpenAI API key

### Installation

1. **Install Ollama and pull embedding model:**
```bash
ollama pull nomic-embed-text
```

2. **Set up environment variables:**
Create `backend/.env`:
```env
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name
OPENAI_API_TOKEN=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1/  # or your custom base URL
OPENAI_CHAT_MODEL=gpt-4o-mini
OLLAMA_HOST=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
PORT=3000
```

3. **Install dependencies:**
```bash
cd backend && npm install
cd ../frontend && npm install
```

## Running the Application

**Terminal 1 - Start Ollama:**
```bash
ollama serve
```

**Terminal 2 - Start Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - Start Frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

## Architecture

**Upload Flow:**
1. User uploads PDF
2. Backend extracts text using pdf-parse
3. Text is chunked (800 chars with 200 overlap)
4. Ollama generates embeddings (768 dimensions)
5. Embeddings stored in Pinecone with metadata
6. PDF ID returned to frontend

**Chat Flow:**
1. User asks question
2. Ollama generates embedding for question
3. Pinecone queries for similar chunks (filtered by PDF ID)
4. Relevant chunks sent to OpenAI with question
5. Answer returned with sources

## API Endpoints

- `POST /upload` - Upload and process PDF
- `POST /chat` - Ask question about PDF
- `GET /documents/:id` - Get document metadata and extracted text
- `GET /documents` - Get all documents
- `GET /health` - Health check

## Pinecone Configuration

- **Dimension:** 768 (matches nomic-embed-text)
- **Metric:** cosine
- **Index Type:** Serverless (free tier)
