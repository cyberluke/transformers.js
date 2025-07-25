import { generateObject, generateText } from "@gensx/vercel-ai";
import * as gensx from "@gensx/core";
import { openai } from "@ai-sdk/openai";
import z from "zod";
import { JSONSchema7 } from "json-schema";

export const RepairArgs = gensx.Component(
  "RepairArgs",
  async ({ parameters, toolName, args, paramSchema }: { parameters: z.ZodType<any>, toolName: string, args: any, paramSchema: JSONSchema7 }) => {
    const { object: repairedArgs } = await generateObject({
      model: openai('gpt-4o', { structuredOutputs: true }),
      schema: parameters,
      prompt: [
        `The model tried to call the tool "${toolName}"` +
          ` with the following arguments:`,
        JSON.stringify(args),
        `The tool accepts the following schema:`,
        JSON.stringify(paramSchema),
        'Please fix the arguments.',
      ].join('\n'),
    });

    return repairedArgs;
  },
);