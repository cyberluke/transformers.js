import { removeUserTokens } from '@/lib/db/actions';
import { createMessage } from '@/lib/db/actions/messages';
import fs from 'fs';

// Vytvoření parts z finishData
export const createMessageParts = (finishData: any) => {
  const parts = [];
  let textContent = "";

  for (const [stepIndex, step] of finishData.steps.entries()) {
    if (step.toolResults && step.toolResults.length > 0 && step.finishReason === "tool-calls") {
      parts.push({ type: "step-start" });

      for (const toolResult of step.toolResults) {
        if (toolResult.type === "tool-result") {
          parts.push({
            type: "tool-invocation",
            toolInvocation: {
              state: "result",
              step: stepIndex,
              toolCallId: toolResult.toolCallId,
              toolName: toolResult.toolName,
              args: toolResult.args,
              result: toolResult.result,
            }
          });
        }
      }
    } else if (step.text.length > 0) {
      parts.push({ type: "step-start" });
      textContent += step.text;

      parts.push({
        type: "text",
        text: step.text,
      });
    }
  }
  
  return { parts, textContent };
};

// Uložení zprávy do databáze
export const saveAssistantMessage = async (chatId: string, userId: string, textContent: string, parts: any[]) => {
  await createMessage({
    chatId,
    userId,
    content: textContent,
    parts,
    role: 'assistant',
  });
};

// Hlavní onFinish handler
export const createFinishHandler = (chatId: string, userId: string, allTokens: number) => {
  return (finishData: any) => {
    console.log("finishData");

    // fs.writeFileSync('finishData.json', JSON.stringify(finishData, null, 2));
    const usage = finishData.usage.totalTokens;
    const totalTokens = allTokens + usage;
    removeUserTokens(userId, totalTokens);

    const { parts, textContent } = createMessageParts(finishData);
    
    // Uložíme jen assistant zprávu - user zpráva už je uložená
    saveAssistantMessage(chatId, userId, textContent, parts);

    console.log("DONE STREAMING");
  };
}; 