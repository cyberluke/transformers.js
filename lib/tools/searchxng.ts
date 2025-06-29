import { tool } from "ai";
import z from "zod";

export const searchWebTool = tool({
  description: `search the web for information.`,
  parameters: z.object({
    query: z.string().describe('the query to search the web for'),
  }),
  execute: async ({ query }) => {
    console.log(query, "query search");
    const result = await fetch(`${process.env.SEARXNG_URL}/search?q=${query}&format=json`);
    const data = await result.json();
    // console.log(data, "data search");
    return { success: true, result: data };
  },
});