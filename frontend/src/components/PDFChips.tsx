import styled from 'styled-components';
import { useStore } from '../store/useStore';

const ChipsContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  overflow-x: auto;
`;

const Chip = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: 2px solid ${(props) => (props.$active ? '#007bff' : '#e0e0e0')};
  background: ${(props) => (props.$active ? '#007bff' : 'white')};
  color: ${(props) => (props.$active ? 'white' : '#333')};
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    border-color: #007bff;
    color: #007bff;
  }

  ${(props) =>
    props.$active &&
    `
    &:hover {
      background: #0056b3;
      color: white;
      border-color: #0056b3;
    }
  `}
`;

const CloseButton = styled.span`
  margin-left: 8px;
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
`;

export const PDFChips = () => {
  const { pdfs, activePdfId, setActivePDF, removePDF } = useStore();

  if (pdfs.length === 0) return null;

  return (
    <ChipsContainer>
      {pdfs.map((pdf) => (
        <Chip
          key={pdf.id}
          $active={pdf.id === activePdfId}
          onClick={() => setActivePDF(pdf.id)}
        >
          {pdf.name}
          <CloseButton
            onClick={(e) => {
              e.stopPropagation();
              removePDF(pdf.id);
            }}
          >
            ×
          </CloseButton>
        </Chip>
      ))}
    </ChipsContainer>
  );
};
