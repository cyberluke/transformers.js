import { tool } from "ai";
import z from "zod";
import { Writer } from "@/types/server";
import { updateChat } from "@/lib/db/actions/chats";

export const generateChatTitleTool = (
  writer: { value: Writer | null },
  chatId: string,
  userId: string
) => tool({
  description: 'Vygeneruje název pro chat na základě uživatelovy otázky',
  parameters: z.object({
    title: z.string().max(50).describe('Krátký, výstižný název chatu v češtině'),
  }),
  execute: async ({ title }) => {
    console.log("Generated chat title:", title);
    
    // Pošleme název přes writeData
    writer.value?.writeData({
      type: "chat-title",
      title: title
    });

    await updateChat(chatId, userId, {
      title: title
    });
    
    return { success: true, title };
  },
}); 