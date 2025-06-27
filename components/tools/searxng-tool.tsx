"use client";
import { useAssistantTool } from "@assistant-ui/react";
import { SearxngSearch } from "@langchain/community/tools/searxng_search";
import { Loader2, Search, AlertTriangle } from "lucide-react";
import { z } from "zod";

export const SearxngSearchToolUI = () => {
  useAssistantTool({
    toolName: "searxng_search",
    description: "Performs a web search using Searxng.",
    parameters: z.object({
      query: z.string().describe("The search query."),
    }),
    execute: async ({ query }) => {
      try {
        const search = new SearxngSearch({
          apiBase: process.env.SEARXNG_URL
        });
        const result = await search.call(query);
        return { success: true, result };
      } catch (error: any) {
        return { success: false, error: error.message || "An unknown error occurred" };
      }
    },
    render: ({ status, result, args }) => {
      const query = args?.query;

      switch (status.type) {
        case "running":
          return (
            <div className="bg-muted/50 flex min-h-[68px] items-center gap-3 rounded-md border-2 border-blue-400 p-3">
              <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-blue-500" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Searching the web...</span>
                <span className="text-muted-foreground text-sm">
                  Searching for "{query}"
                </span>
              </div>
            </div>
          );

        case "incomplete":
          if (status.reason !== "error") return null;
          return (
            <div className="bg-muted/50 flex min-h-[68px] items-center gap-3 rounded-md border-2 border-red-400 p-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Search Error</span>
                <span className="text-muted-foreground text-sm">
                  {result?.error || "An unknown error occurred."}
                </span>
              </div>
            </div>
          );

        case "complete":
          return (
            <div className="bg-muted/50 hover:bg-muted/70 flex min-h-[68px] flex-col gap-3 rounded-md border-2 border-blue-400 p-3 transition-all duration-300 hover:border-blue-500 hover:shadow-md">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 flex-shrink-0 text-blue-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Web Search Results</span>
                  <span className="text-muted-foreground text-sm">
                    Results for "{query}"
                  </span>
                </div>
              </div>
              <div className="text-muted-foreground text-sm">{result?.result}</div>
            </div>
          );

        default:
          return null;
      }
    },
  });

  return null;
};