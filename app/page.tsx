'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect } from 'react';
import FingerprintJS, { GetResult } from "@fingerprintjs/fingerprintjs-pro";
import { ChatLayout } from '@/components/new';
import { useThreadStore } from '@/lib/stores/thread-store';

export default function Page() {
  const [fingerprintData, setFingerprintData] = useState<GetResult | null>(null);
  const [isDetailed, setIsDetailed] = useState(false);
  
  const { 
    currentThread, 
    currentThreadId, 
    createThread, 
    updateThreadMessages,
    setServerChatId 
  } = useThreadStore();

  // Initialize first thread if none exists
  useEffect(() => {
    if (!currentThreadId && useThreadStore.getState().threads.length === 0) {
      createThread();
    }
  }, [currentThreadId, createThread]);

  useEffect(() => {
    (async () => {
      const fpPromise = FingerprintJS.load({
        apiKey: process.env.NEXT_PUBLIC_FINGERPRINT_API_KEY!,
      });
      const fp = await fpPromise;
      const data = await fp.get({ extendedResult: true });
      setFingerprintData(data);
      // Tady nacist data z db do thread store
    })();
  }, []);

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
        setServerChatId(currentThreadId, chatIdData.chatId);
      }
    }
  }, [data, currentThreadId, setServerChatId]);

  // Update thread when messages change
  useEffect(() => {
    if (currentThreadId && messages.length > 0) {
      updateThreadMessages(currentThreadId, messages);
    }
  }, [messages, currentThreadId, updateThreadMessages]);

  // Update messages when switching threads
  useEffect(() => {
    if (currentThread) {
      setMessages(currentThread.messages);
    } else {
      setMessages([]);
    }
  }, [currentThread, setMessages]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && currentThreadId) {
      handleSubmit(e);
    }
  };

  return (
    <ChatLayout
      fingerprintData={fingerprintData}
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleFormSubmit={handleFormSubmit}
      status={status}
      isDetailed={isDetailed}
      setIsDetailed={setIsDetailed}
    />
  );
}