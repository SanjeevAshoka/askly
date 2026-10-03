import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useStore } from '../store/useStore';
import { api } from '../utils/api';

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-left: 1px solid #e0e0e0;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Message = styled.div<{ $isUser: boolean }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  background: ${(props) => (props.$isUser ? '#007bff' : '#f0f0f0')};
  color: ${(props) => (props.$isUser ? 'white' : '#333')};
  align-self: ${(props) => (props.$isUser ? 'flex-end' : 'flex-start')};
  font-size: 14px;
  line-height: 1.5;
`;

const InputContainer = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 12px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #007bff;
  }
`;

const SendButton = styled.button`
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

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
`;

const Sources = styled.div`
  margin-top: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  font-size: 12px;
  color: #666;
`;

export const Chat = () => {
  const { activePdfId, getChatMessages, addChatMessage, isLoading } = useStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = activePdfId ? getChatMessages(activePdfId) : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activePdfId || isLoading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: input,
      timestamp: new Date(),
    };

    addChatMessage(activePdfId, userMessage);
    setInput('');

    try {
      const response = await api.chat(activePdfId, input);

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: response.answer,
        timestamp: new Date(),
        sources: response.sources,
      };

      addChatMessage(activePdfId, assistantMessage);
    } catch (err) {
      const errorMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: err instanceof Error ? err.message : 'Failed to get response',
        timestamp: new Date(),
      };
      addChatMessage(activePdfId, errorMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activePdfId) {
    return (
      <ChatContainer>
        <EmptyState>Upload a PDF and start chatting</EmptyState>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.length === 0 && (
          <EmptyState>Ask a question about the PDF</EmptyState>
        )}
        {messages.map((message) => (
          <div key={message.id}>
            <Message $isUser={message.role === 'user'}>
              {message.content}
            </Message>
            {message.sources && message.sources.length > 0 && (
              <Sources>
                <strong>Sources:</strong>
                {message.sources.map((source, i) => (
                  <div key={i}>
                    Score: {source.score.toFixed(3)} - {source.text.slice(0, 100)}...
                  </div>
                ))}
              </Sources>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <InputContainer>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question..."
          disabled={isLoading}
        />
        <SendButton onClick={handleSend} disabled={isLoading || !input.trim()}>
          Send
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};
