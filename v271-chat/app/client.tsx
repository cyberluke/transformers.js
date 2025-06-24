"use client";

import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useChatRuntime } from '@assistant-ui/react-ai-sdk';
import { Perplexity } from "@/components/perplexity/Perplexity";

export function PerplexityClient() {
  const runtime = useChatRuntime({
    api: '/api/chat',
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Perplexity />
    </AssistantRuntimeProvider>
  );
}