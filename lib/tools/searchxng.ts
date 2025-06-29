import { tool } from "ai";
import z from "zod";
import { Writer } from "@/types/server";

export const searchWebTool = (writer: { value: Writer | null }) => tool({
  description: `search the web for information.`,
  parameters: z.object({
    query: z.string().describe('the query to search the web for'),
  }),
  execute: async ({ query }) => {
    console.log(query, "query search");
    // writer.writeData({
    //   type: "search-web",
    //   query: query,
    // });
    // writer.writeData({
    //   type: "status-update",
    //   payload: { progress: 50 }
    // });
    // writer.value?.write("0:test\n")
    // writer.value?.write("2:test\n")
    // writer.value?.write("3:test\n")
    // writer.value?.write("8:test\n")
    // writer.value?.write("9:test\n")
    // writer.value?.write("a:test\n")
    // writer.value?.write("b:test\n")
    // writer.value?.write("c:test\n")
    const result = await fetch(`${process.env.SEARXNG_URL}/search?q=${query}&format=json`);
    const data = await result.json();
    // console.log(data, "data search");
    return { success: true, result: data };
  },
});

// function createSearchWebTool(writer: any) {
