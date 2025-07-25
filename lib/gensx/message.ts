import * as gensx from "@gensx/core";
import { createMessage } from "@/lib/db/actions";
import { AppMessage } from "@/types/messages";
import { processAttachmentsForEmbeddings } from "../ai/file-processing";

export const HandleChatMessage = gensx.Workflow(
  "HandleChatMessage",
  async ({ 
    userMessage,
    chatId, 
    userId,
    assistentId,
  }: { 
    userMessage: AppMessage,
    chatId: string, 
    userId: string, 
    assistentId?: string,
  }) => {
    // Vytvoříme zprávu v databázi
    const message = await createMessage({
      chatId: chatId,
      userId: userId,
      content: userMessage.content as string,
      parts: userMessage.parts || null,
      experimental_attachments: userMessage.experimental_attachments || null,
      role: 'user',
    });

    // Zpracujeme attachments pro embeddings pokud existují
    let embeddingResults = null;
    if (userMessage.experimental_attachments && userMessage.experimental_attachments.length > 0) {
      console.log('Zpracovávám experimental_attachments pro embeddings...');
      
      try {
        embeddingResults = await processAttachmentsForEmbeddings(
          userMessage.experimental_attachments as any, // TODO: fix types
          userId,
          assistentId
        );
        
        console.log('Výsledky zpracování embeddingů:', embeddingResults);
        
        // Můžeme přidat info do systémové zprávy, že máme k dispozici obsah z dokumentů
        const processedFiles = embeddingResults
          .filter(result => result.status === 'success')
          .map(result => result.fileName);
          
        if (processedFiles.length > 0) {
          console.log(`Úspěšně zpracovány soubory pro embeddings: ${processedFiles.join(', ')}`);
        }
        
      } catch (error) {
        console.error('Chyba při zpracování attachments pro embeddings:', error);
        // Pokračujeme i při chybě, embeddings jsou volitelné
      }
    }

    return {
      message,
      embeddingResults,
    };
  },
);