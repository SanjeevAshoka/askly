import styled from 'styled-components';
import { useStore } from '../store/useStore';
import { api } from '../utils/api';

const UploadContainer = styled.div`
  padding: 24px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #0056b3;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const StatusText = styled.p`
  font-size: 14px;
  color: #666;
`;

const ErrorText = styled.p`
  font-size: 14px;
  color: #dc3545;
`;

export const PDFUpload = () => {
  const { addPDF, setLoading, isLoading, error, setError } = useStore();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload to backend first
      const response = await api.uploadPDF(file);

      if (response.success) {
        // Add PDF with the ID returned from backend
        const pdf = {
          id: response.pdfId,
          name: file.name,
          uploadedAt: new Date(),
          numPages: 0,
          status: 'ready' as const,
        };
        addPDF(pdf);
      } else {
        setError(response.message || 'Failed to process PDF');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UploadContainer>
      <Title>Upload PDF</Title>
      <FileInput
        type="file"
        accept=".pdf"
        id="pdf-upload"
        onChange={handleFileSelect}
        disabled={isLoading}
      />
      <UploadButton
        as="label"
        htmlFor="pdf-upload"
        disabled={isLoading}
      >
        {isLoading ? 'Uploading...' : 'Choose PDF File'}
      </UploadButton>
      {error && <ErrorText>{error}</ErrorText>}
      <StatusText>Supported format: PDF (max 10MB)</StatusText>
    </UploadContainer>
  );
};
