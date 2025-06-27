'use client';

import { AssistantRuntimeProvider, CompositeAttachmentAdapter, SimpleImageAttachmentAdapter, SimpleTextAttachmentAdapter } from '@assistant-ui/react';
import { useChatRuntime } from '@assistant-ui/react-ai-sdk';
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

export const Assistant = () => {
  const [fingerprintData, setFingerprintData] = useState<GetResult | null>(null);

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

  const runtime = useChatRuntime({
    api: '/api/chat',
    maxSteps: 3,
    adapters: {
      attachments: new CompositeAttachmentAdapter([
        new SimpleImageAttachmentAdapter(),
        new SimpleTextAttachmentAdapter(),
      ]),
    },
    body: {
      customData: {
        fingerprint: fingerprintData?.requestId,
      },
    },
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
          <WeatherSearchToolUI />
          <GeocodeLocationToolUI />
          <SearxngSearchToolUI />
        </SidebarInset>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};
