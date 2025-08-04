import * as gensx from "@gensx/core";
import { generateText } from "@gensx/vercel-ai";
import { openai } from "@ai-sdk/openai";
import { findRelevantContent } from "@/lib/ai/embedding";
import { AppMessage } from "@/types/messages";

export const FindRelevantContent = gensx.Component(
  "FindRelevantContent",
  async ({ 
    query, 
    userId, 
    assistantId 
  }: { 
    query: string,
    userId: string, 
    assistantId?: string 
  }) => {
    console.log("Searching for relevant content:", query);
    
    try {
      const relevantContent = await findRelevantContent(query, userId, assistantId);
      console.log("Relevant content length:", relevantContent.length);
      
      if (relevantContent.length === 0) {
        return {
          success: true,
          message: "Nenašel jsem žádný relevantní obsah v uploadovaných dokumentech.",
          content: []
        };
      }
      
      return {
        success: true,
        message: `Našel jsem ${relevantContent.length} relevantních úryvků z uploadovaných dokumentů:`,
        content: relevantContent
      };
      
    } catch (error) {
      console.error("Error finding relevant content:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Neznámá chyba při hledání obsahu'
      };
    }
  },
);

export const RAGWorkflow = gensx.Workflow(
  "RAGWorkflow",
  async ({ 
    messages, 
    userId, 
    assistantId 
  }: { 
    messages: AppMessage[],
    userId: string, 
    assistantId?: string 
  }) => {
    // Získej poslední uživatelskou zprávu
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find(msg => msg.role === 'user');

    if (!lastUserMessage) {
      return {
        ragContext: "",
        success: false,
        message: "Žádná uživatelská zpráva k zpracování"
      };
    }

    try {
      // Query rewriting pomocí generateText
      const { text: rewrittenQuery, usage } = await generateText({
        model: openai('gpt-4o-mini'),
        prompt: `
Máš k dispozici konverzaci mezi uživatelem a asistentem. Tvým úkolem je přepsat poslední uživatelskou zprávu na optimální vyhledávací dotaz pro sémantické vyhledávání v dokumentech.

Konverzace:
${messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Posledni uživatelská zpráva: "${lastUserMessage.content}"

Přepiš tuto zprávu na standalone, kontextově bohatý vyhledávací dotaz, který bude efektivní pro sémantické vyhledávání v dokumentech. Pokud zpráva odkazuje na něco předchozího ("druhý", "ten", "to", apod.), nahraď to konkrétními pojmy z kontextu.

Vrať jen přepsaný dotaz, nic víc:
        `,
      });

      console.log("Original query:", lastUserMessage.content);
      console.log("Rewritten query:", rewrittenQuery);
      console.log("Usage RAG:", usage);

      // Najdi relevantní obsah
      const contentResult = await FindRelevantContent({
        query: rewrittenQuery.trim(),
        userId,
        assistantId
      });

      console.log("Content result:", contentResult);

      if (!contentResult.success || !contentResult.content || contentResult.content.length === 0) {
        return {
          ragContext: "",
          success: true,
          message: "Žádný relevantní obsah nebyl nalezen"
        };
      }

      // Vytvoř RAG kontext pro system prompt
      const ragContext = `
=== RELEVANTNÍ OBSAH Z DOKUMENTŮ ===

Nalezené informace související s dotazem uživatele:

${contentResult.content.map((item, index) => `
**Dokument ${index + 1}** (podobnost: ${(item.similarity * 100).toFixed(1)}%):
Obsah: ${item.name}
`).join('\n')}

=== KONEC RELEVANTNÍHO OBSAHU ===

INSTRUKCE: Při odpovědi využij výše uvedené informace z dokumentů, pokud jsou relevantní k uživatelovu dotazu. Vždy uveď zdroj informací.
      `;

      return {
        ragContext,
        success: true,
        message: `Nalezen relevantní obsah z ${contentResult.content.length} dokumentů`,
        rewrittenQuery: rewrittenQuery.trim(),
        // foundContent: contentResult.content
      };

    } catch (error) {
      console.error("Error in RAG workflow:", error);
      return {
        ragContext: "",
        success: false,
        error: error instanceof Error ? error.message : 'Neznámá chyba v RAG workflow'
      };
    }
  },
);
