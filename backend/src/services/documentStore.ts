export interface Document {
  id: string;
  name: string;
  uploadedAt: Date;
  numPages: number;
  status: 'processing' | 'ready' | 'error';
  extractedText?: string;
}

// In-memory document store (for learning purposes)
// In production, use a real database
class DocumentStore {
  private documents: Map<string, Document> = new Map();

  save(document: Document): void {
    this.documents.set(document.id, document);
  }

  get(id: string): Document | undefined {
    return this.documents.get(id);
  }

  getAll(): Document[] {
    return Array.from(this.documents.values());
  }

  delete(id: string): boolean {
    return this.documents.delete(id);
  }

  updateStatus(id: string, status: Document['status']): void {
    const doc = this.documents.get(id);
    if (doc) {
      doc.status = status;
    }
  }
}

export const documentStore = new DocumentStore();
