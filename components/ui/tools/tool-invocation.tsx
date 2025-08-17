'use client';

import { SearchWebTool } from '@/lib/tools/search-web';
import { GenericTool } from '@/components/ui/tools/generic-tool';

interface ToolInvocationProps {
  toolInvocation: any;
  index: number;
}

export function ToolInvocation({ toolInvocation, index }: ToolInvocationProps) {
  // Router pro různé typy toolů
  switch (toolInvocation.toolName) {
    case 'searchWeb':
      return <SearchWebTool toolInvocation={toolInvocation} index={index} />;
    
    // Zde přidáme další specializované tools...
    // case 'generateChatTitle':
    //   return <ChatTitleTool toolInvocation={toolInvocation} index={index} />;
    
    default:
      return <GenericTool toolInvocation={toolInvocation} index={index} />;
  }
}
