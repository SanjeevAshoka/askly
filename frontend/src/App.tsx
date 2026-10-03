import React from 'react';
import styled from 'styled-components';
import { PDFChips } from './components/PDFChips';
import { PDFUpload } from './components/PDFUpload';
import { PDFContent } from './components/PDFContent';
import { Chat } from './components/Chat';
import { GlobalStyle } from './styles/globalStyles';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const LeftPanel = styled.div`
  width: 40%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e0e0e0;
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

function App() {
  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <PDFChips />
        <MainContent>
          <LeftPanel>
            <PDFUpload />
            <PDFContent />
          </LeftPanel>
          <RightPanel>
            <Chat />
          </RightPanel>
        </MainContent>
      </AppContainer>
    </>
  );
}

export default App;
