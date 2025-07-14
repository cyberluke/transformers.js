'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
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
    setTitleForThread,
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


  const didLoadRef = useRef(false);

  // Initialize threads from server - eager initialization after fingerprint
  useEffect(() => {
    if (isInitialized && !hasServerThreads && !didLoadRef.current) {
      didLoadRef.current = true;
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

  // Sledování server response pro chat ID a title
  useEffect(() => {
    if (data && Array.isArray(data) && currentThreadId) {
      const chatIdData = data.find((item: any) => item.type === 'chat-id') as { type: string; chatId: string } | undefined;
      if (chatIdData?.chatId) {
        console.log('Received server chat ID:', chatIdData.chatId);
        setServerChatIdForThread(currentThreadId, chatIdData.chatId);
      }

      const chatTitleData = data.find((item: any) => item.type === 'chat-title') as { type: string; title: string } | undefined;
      if (chatTitleData?.title) {
        console.log('Received chat title:', chatTitleData.title);
        setTitleForThread(currentThreadId, chatTitleData.title);
      }
    }
  }, [data, currentThreadId, setServerChatIdForThread, setTitleForThread]);

  // Synchronizace zpráv při switching threadu
  useEffect(() => {
    if (currentThreadId && currentThread) {
      // Při switching nastav zprávy z thread store do useChat
      if (currentThread.messages.length > 0 && messages.length === 0) {
        setMessages(currentThread.messages);
      }
    }
  }, [currentThreadId, currentThread, setMessages, messages.length]);

  // TODO: Podivat se pak poradne na nejlepsi reseni tohoto problému.

  // Update thread when messages change (jen pokud se skutečně změnily)
  useEffect(() => {
    if (currentThreadId) {
      console.log('updateMessages', messages);
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