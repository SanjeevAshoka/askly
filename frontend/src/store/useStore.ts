import { create } from 'zustand';

export interface PDFDocument {
  id: string;
  name: string;
  uploadedAt: Date;
  numPages: number;
  status: 'processing' | 'ready' | 'error';
  extractedText?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{
    text: string;
    score: number;
  }>;
}

interface StoreState {
  pdfs: PDFDocument[];
  activePdfId: string | null;
  chatMessages: Map<string, ChatMessage[]>;
  isLoading: boolean;
  error: string | null;

  // Actions
  addPDF: (pdf: PDFDocument) => void;
  removePDF: (id: string) => void;
  setActivePDF: (id: string) => void;
  updatePDFStatus: (id: string, status: PDFDocument['status']) => void;
  addChatMessage: (pdfId: string, message: ChatMessage) => void;
  clearChatMessages: (pdfId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getChatMessages: (pdfId: string) => ChatMessage[];
}

export const useStore = create<StoreState>((set, get) => ({
  pdfs: [],
  activePdfId: null,
  chatMessages: new Map(),
  isLoading: false,
  error: null,

  addPDF: (pdf) => {
    set((state) => {
      const newPdfs = [...state.pdfs, pdf];
      // Keep only last 5 PDFs
      if (newPdfs.length > 5) {
        newPdfs.shift();
      }
      return { pdfs: newPdfs, activePdfId: pdf.id };
    });
  },

  removePDF: (id) => {
    set((state) => {
      const newPdfs = state.pdfs.filter((pdf) => pdf.id !== id);
      const newActivePdfId = state.activePdfId === id ? null : state.activePdfId;
      const newChatMessages = new Map(state.chatMessages);
      newChatMessages.delete(id);
      return { pdfs: newPdfs, activePdfId: newActivePdfId, chatMessages: newChatMessages };
    });
  },

  setActivePDF: (id) => {
    set({ activePdfId: id });
  },

  updatePDFStatus: (id, status) => {
    set((state) => ({
      pdfs: state.pdfs.map((pdf) =>
        pdf.id === id ? { ...pdf, status } : pdf
      ),
    }));
  },

  addChatMessage: (pdfId, message) => {
    set((state) => {
      const newChatMessages = new Map(state.chatMessages);
      const existing = newChatMessages.get(pdfId) || [];
      newChatMessages.set(pdfId, [...existing, message]);
      return { chatMessages: newChatMessages };
    });
  },

  clearChatMessages: (pdfId) => {
    set((state) => {
      const newChatMessages = new Map(state.chatMessages);
      newChatMessages.set(pdfId, []);
      return { chatMessages: newChatMessages };
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  getChatMessages: (pdfId) => {
    return get().chatMessages.get(pdfId) || [];
  },
}));
