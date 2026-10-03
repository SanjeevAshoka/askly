const API_BASE_URL = 'http://localhost:3000';

export interface UploadResponse {
  success: boolean;
  pdfId: string;
  status: string;
  message?: string;
  error?: string;
}

export interface ChatResponse {
  answer: string;
  sources: Array<{
    text: string;
    score: number;
  }>;
  error?: string;
}

export interface Document {
  id: string;
  name: string;
  uploadedAt: string;
  numPages: number;
  status: 'processing' | 'ready' | 'error';
  extractedText?: string;
}

export const api = {
  async uploadPDF(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload PDF');
    }

    return response.json();
  },

  async chat(pdfId: string, question: string): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pdfId, question }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send chat message');
    }

    return response.json();
  },

  async getDocument(id: string): Promise<Document> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch document');
    }

    return response.json();
  },

  async getAllDocuments(): Promise<{ documents: Document[] }> {
    const response = await fetch(`${API_BASE_URL}/documents`);

    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    return response.json();
  },

  async healthCheck(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return response.json();
  },
};
