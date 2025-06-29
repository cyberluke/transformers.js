'use client';

import { AssistantRuntimeProvider, CompositeAttachmentAdapter, SimpleImageAttachmentAdapter, SimpleTextAttachmentAdapter, ThreadMessage, useMessage } from '@assistant-ui/react';
// import { useChatRuntime } from '@assistant-ui/react-ai-sdk';
import FingerprintJS, { GetResult } from '@fingerprintjs/fingerprintjs-pro';

import { Thread } from '@/components/assistant-ui/thread';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Perplexity } from '@/components/perplexity/Perplexity';
import { WeatherSearchToolUI } from "@/components/tools/weather-tool";
import { GeocodeLocationToolUI } from "@/components/tools/weather-tool";
import { SearxngSearchToolUI } from "@/components/tools/searxng-tool";
import { useEffect, useState } from 'react';
import { useChatRuntime } from '@/lib/client/assistant-ui/chatRuntime';

// export const TestMessage = () => {
//   const msg = useMessage((m) => m);
//   console.log(msg);
//   return 'test';
// }

export const Assistant = () => {
  const [fingerprintData, setFingerprintData] = useState<GetResult | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  // const annotations = useMessage((m) => m.metadata.unstable_annotations);
  // const msg = useMessage();
  // const {message} = useMessage();

  useEffect(() => {
    (async () => {
      const fpPromise = FingerprintJS.load({
        apiKey: process.env.NEXT_PUBLIC_FINGERPRINT_API_KEY!,
        // endpoint: process.env.NEXT_PUBLIC_FINGERPRINT_ENDPOINT!, // TODO: Endpoint needs custom subdomain
      });
      const fp = await fpPromise;
      const data = await fp.get({ extendedResult: true });
      setFingerprintData(data);
    })();
  }, []);

  // useEffect(() => {
  //   // console.log(message);
  //   console.log(annotations);
  // }, [annotations]);

  const runtime = useChatRuntime({
    api: '/api/chat',
    adapters: {
      attachments: new CompositeAttachmentAdapter([
        new SimpleImageAttachmentAdapter(),
        new SimpleTextAttachmentAdapter(),
      ]),
    },
    body: {
      customData: {
        fingerprint: fingerprintData?.requestId,
        chatId
      },
      // messages: [
      //   {
      //     role: 'user',
      //     content: [{
      //       type: 'text',
      //       text: TestMessage()
      //     }]
      //   }
      // ]
    },
    onFinish: (message) => {
      const annotations = message.metadata.unstable_annotations;
      const chatId = annotations?.find((annotation: any) => annotation.type === "chat-id")?.chatId;
      setChatId(chatId);
      console.log(chatId);
      // console.log(annotations);
    },

    // onResponse: async (response) => {

    //   response.body?.pipeThrough(new TransformStream({
    //     transform(chunk, controller) {
    //       console.log(chunk);
    //       controller.enqueue(chunk);
    //     }
    //   }));

    //   console.log(response);
    //   // if (!response.body) return;
    //   // for await (const chunk of response.body) {
    //   //   console.log(chunk);
    //   //   // const decoder = new TextDecoder();
    //   //   // const text = decoder.decode(chunk);
    //   //   // console.log(text);
    //   // }
    // },
    experimental_prepareRequestBodyFix: ({messages}) => {
      const lastMessage = messages[messages.length - 1];
      return {
        messages: [lastMessage],
      };
      // return {
      //   messages: messages,
      // };
    }
    
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <p>Dev: {fingerprintData?.visitorId}</p>
            </div>
            {/* <Separator orientation="vertical" className="mr-2 h-4" /> */}
            {/* <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Build Your Own ChatGPT UX
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Starter Template</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb> */}
          </header>
          <Perplexity />
          {/* <WeatherSearchToolUI />
          <GeocodeLocationToolUI />
          <SearxngSearchToolUI /> */}
        </SidebarInset>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};
