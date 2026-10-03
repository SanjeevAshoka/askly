import React from 'react';
import styled from 'styled-components';
import { useStore } from '../store/useStore';
import { api } from '../utils/api';

const ContentContainer = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #fafafa;
`;

const ContentText = styled.div`
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  font-size: 14px;
  font-family: 'Courier New', monospace;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
`;

export const PDFContent = () => {
  const { activePdfId, pdfs } = useStore();
  const [content, setContent] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  const activePdf = pdfs.find((pdf) => pdf.id === activePdfId);

  React.useEffect(() => {
    if (activePdfId) {
      setLoading(true);
      api.getDocument(activePdfId)
        .then((doc) => {
          setContent(doc.extractedText || 'No content available');
        })
        .catch((err) => {
          console.error('Failed to fetch document:', err);
          setContent('Failed to load content');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setContent('');
    }
  }, [activePdfId]);

  if (!activePdf) {
    return <EmptyState>Select a PDF to view its content</EmptyState>;
  }

  if (loading) {
    return <EmptyState>Loading content...</EmptyState>;
  }

  return (
    <ContentContainer>
      <ContentText>{content}</ContentText>
    </ContentContainer>
  );
};
