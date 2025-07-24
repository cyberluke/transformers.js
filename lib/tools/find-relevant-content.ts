import { tool } from "ai";
import z from "zod";
import { findRelevantContent } from "@/lib/ai/embedding";

export const findRelevantContentTool = (
  userId: string,
  assistantId?: string
) => tool({
  description: 'Najde relevantní obsah z uložených dokumentů na základě uživatelova dotazu. Použij tento tool když uživatel pokládá otázky, které by mohly být zodpovězeny pomocí obsahu z uploadovaných dokumentů.',
  parameters: z.object({
    query: z.string().describe('Uživatelův dotaz pro vyhledání relevantního obsahu'),
  }),
  execute: async ({ query }) => {
    console.log("Searching for relevant content:", query);
    
    try {
      const relevantContent = await findRelevantContent(query, userId, assistantId);
      
      if (relevantContent.length === 0) {
        return {
          success: true,
          message: "Nenašel jsem žádný relevantní obsah v uploadovaných dokumentech.",
          content: []
        };
      }
      
      const formattedContent = relevantContent.map((item, index) => {
        return `**Relevantní obsah ${index + 1}** (podobnost: ${(item.similarity * 100).toFixed(1)}%):\n${item.name}`;
      });
      
      return {
        success: true,
        message: `Našel jsem ${relevantContent.length} relevantních úryvků z uploadovaných dokumentů:`,
        content: relevantContent,
        formattedContent: formattedContent.join('\n\n')
      };
      
    } catch (error) {
      console.error("Error finding relevant content:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Neznámá chyba při hledání obsahu'
      };
    }
  },
}); 