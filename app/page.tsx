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
    updateThreadMessages 
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
    })();
  }, []);

  const { messages, input, handleInputChange, handleSubmit, status, setMessages, data } = useChat({
    api: '/api/chat',
    body: {
      customData: {
        fingerprint: fingerprintData?.requestId,
        // chatId: currentThreadId,
        detailed: isDetailed,
      },
    },
    initialMessages: currentThread?.messages || [],
  });

  // console.log(data, "data");
  useEffect(() => {
    console.log(data, "data");
  }, [data]);

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
    <>
      {/* {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      bubu */}
      <div className='fixed top-0 left-0 w-full  z-50'>
        Haf
        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      </div>
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
    </>
  );
}