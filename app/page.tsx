'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import { ChatLayout } from '@/components/sections';
import { useThreads } from '@/hooks/useThreads';
import { useFingerprint } from '../hooks/useFingerprint';
import { useAttachments } from '@/hooks/useAttachments';

export default function Page() {
  const [isDetailed, setIsDetailed] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  
  const { 
    currentThread, 
    currentThreadId, 
    createThread,
    forceCreateThread, 
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

  const { attachments, clearAttachments } = useAttachments();

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
      forceCreateThread();
    }
  }, [currentThreadId, threads.length, forceCreateThread]);

  const { messages, input, handleInputChange, handleSubmit, status, setMessages, data } = useChat({
    api: '/api/chat',
    id: currentThreadId || undefined,
    experimental_prepareRequestBody({ messages }) {
      return { 
        message: messages[messages.length - 1],
        customData: {
          fingerprint: fingerprintData?.requestId,
          chatId: currentThread?.serverChatId, // Pouze server-potvrzené chat ID
          detailed: isDetailed,
          agentId: selectedAgent,
        }
      };
    },
    onError: (error) => {
      console.error('Chat error:', error);
      
      // Parsování error response pro insufficient tokens
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.error === 'insufficient_tokens') {
          // Zobrazení notifikace a přesměrování na subscription
          alert(`❌ ${errorData.message}\n\n💡 Kliknutím na OK budete přesměrování na stránku předplatného.`);
          window.location.href = '/subscription';
          return;
        }
      } catch (parseError) {
        // Pokud error není JSON, zpracuj jako obecnou chybu
        console.error('Error parsing error response:', parseError);
      }

      // Obecné error handling
      alert('❌ Došlo k chybě při odesílání zprávy. Zkuste to prosím znovu.');
    },
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
      // Připojení attachments k useChat
      handleSubmit(e, {
        experimental_attachments: attachments.map((att: any) => ({
          name: att.name,
          contentType: att.contentType,
          url: att.url,
        })),
      });
      
      // Vymazání attachments po odeslání
      clearAttachments();
    }
  };

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId);
    console.log('Selected agent:', agentId);
  };

  return (
    <ChatLayout
      input={input}
      handleInputChange={handleInputChange}
      handleFormSubmit={handleFormSubmit}
      status={status}
      isDetailed={isDetailed}
      setIsDetailed={setIsDetailed}
      selectedAgent={selectedAgent}
      onAgentSelect={handleAgentSelect}
    />
  );
}