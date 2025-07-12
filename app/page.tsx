'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect } from 'react';
import { ChatLayout } from '@/components/new';
import { useThreads } from '@/hooks/useThreads';
import { useFingerprint } from '../hooks/useFingerprint';

export default function Page() {
  const [isDetailed, setIsDetailed] = useState(false);
  
  const { 
    currentThread, 
    currentThreadId, 
    createThread, 
    updateMessages,
    setServerChatIdForThread,
    threads,
    loadThreads,
    hasServerThreads 
  } = useThreads();

  const { 
    fingerprintData,
    initialize: initializeFingerprint,
    isInitialized,
  } = useFingerprint();

  // Initialize fingerprint first - eager initialization in root
  useEffect(() => {
    if (!isInitialized) {
      initializeFingerprint();
    }
  }, [isInitialized, initializeFingerprint]);

  // Initialize threads from server - eager initialization after fingerprint
  useEffect(() => {
    console.log('useEffect', isInitialized, hasServerThreads);
    if (isInitialized && !hasServerThreads) {
      loadThreads();
    }
  }, [isInitialized, hasServerThreads, loadThreads]);

  // Initialize first thread if none exists
  useEffect(() => {
    if (!currentThreadId && threads.length === 0) {
      createThread();
    }
  }, [currentThreadId, threads.length, createThread]);

  const { messages, input, handleInputChange, handleSubmit, status, setMessages, data } = useChat({
    api: '/api/chat',
    body: {
      customData: {
        fingerprint: fingerprintData?.requestId,
        chatId: currentThread?.serverChatId, // Pouze server-potvrzené chat ID
        detailed: isDetailed,
      },
    },
    id: currentThreadId || undefined
  });

  // Sledování server response pro chat ID
  useEffect(() => {
    if (data && Array.isArray(data) && currentThreadId) {
      const chatIdData = data.find((item: any) => item.type === 'chat-id') as { type: string; chatId: string } | undefined;
      if (chatIdData?.chatId) {
        console.log('Received server chat ID:', chatIdData.chatId);
        setServerChatIdForThread(currentThreadId, chatIdData.chatId);
      }
    }
  }, [data, currentThreadId, setServerChatIdForThread]);

  // Update thread when messages change
  useEffect(() => {
    if (currentThreadId && messages.length > 0) {
      updateMessages(currentThreadId, messages);
    }
  }, [messages, currentThreadId, updateMessages]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && currentThreadId) {
      handleSubmit(e);
    }
  };

  return (
    <ChatLayout
      input={input}
      handleInputChange={handleInputChange}
      handleFormSubmit={handleFormSubmit}
      status={status}
      isDetailed={isDetailed}
      setIsDetailed={setIsDetailed}
    />
  );
}