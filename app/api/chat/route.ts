// import { findRelevantContent } from '@/lib/ai/embedding';
// import { createEmbedding } from '@/lib/db/actions/embeddings';
import { createChat, getChat, updateChat } from '@/lib/db/actions/chats';
import { createMessage } from '@/lib/db/actions/messages';
import { validateFingerprint } from '@/lib/server/fingerprint/auth';
import { addMemories, getMemories, retrieveMemories } from '@/lib/server/mem0/mem0-utils';
import { SYSTEM_HIGHLIGHT_PROMPT } from '@/lib/server/mem0/prompt';
import { searchWebTool } from '@/lib/tools/searchxng';
import { generateChatTitleTool } from '@/lib/tools/chat-title';
import { Writer } from '@/types/server';
// import { retrieveMemories } from '@/lib/server/mem0/server';
// import { retrieveMemories } from '@/lib/server/mem0/server';
//import { addMemories, getMemories } from "@mem0/vercel-ai-provider";
import { openai } from '@ai-sdk/openai';
import { frontendTools } from '@assistant-ui/react-ai-sdk';
import { SearxngSearch } from '@langchain/community/tools/searxng_search';
import { createDataStream, createDataStreamResponse, StreamData, streamText, tool } from 'ai';
import { randomUUID } from 'crypto';
import z from 'zod';
import fs from 'fs';
// import { z } from 'zod';
// import SelfHostedMem0 from '@/components/mem0/mem0';

export const maxDuration = 30;

// // Configure mem0 options
// const mem0Options = {
//   baseURL: process.env.MEM0_BASE_URL, // your self-hosted endpoint
//   apiKey: process.env.MEM0_API_KEY,   // your API key
// };

// // Použití
// const mem0 = new SelfHostedMem0(process.env.MEM0_BASE_URL || 'https://mem.nanotrik.ai');

// const retrieveMemories = (memories: any) => {
//   if (memories.length === 0) return "";
//   const systemPrompt =
//     "These are the memories I have stored. Give more weightage to the question by users and try to answer that first. You have to modify your answer based on the memories I have provided. If the memories are irrelevant you can ignore them. Also don't reply to this section of the prompt, or the memories, they are only for your reference. The System prompt starts after text System Message: \n\n";
//   const memoriesText = memories
//     .map((memory: any) => {
//       return `Memory: ${memory.memory}\n\n`;
//     })
//     .join("\n\n");

//   return `System Message: ${systemPrompt} ${memoriesText}`;
// };

function clearUserMessage(message: any) {
  return {
    // role: message.role,
    content: message.content,
    attachments: message.attachments,
    metadata: message.metadata,
  };
}

const getBaseSystemPrompt = () => {
  const baseSystemPrompt = `
  Dnes je ${new Date().toLocaleDateString('cs-CZ', {
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  })}.
  Jsi asistent, který pomáhá lidem v České republice.
  Vždy se snaž odpovídat v češtině.
  Vždy se snaž mít vědomosti aktuální.
  
  DŮLEŽITÉ: Na začátku každé nové konverzace vždy vygeneruj krátký, výstižný název chatu (max 50 znaků) na základě uživatelovy první otázky. 
  Použij tool generateChatTitle pro odeslání názvu. Tento krok je nezbytný.
  `;
  console.log(baseSystemPrompt, "baseSystemPrompt");
  return baseSystemPrompt;
}

export async function POST(req: Request) {
  const { messages, customData } = await req.json();
  // TODO: Security check zod

  console.log(messages, customData, "customData");
  console.log(JSON.stringify(messages, null, 2), "req.body");

  // Validace fingerprint
  const { userId, error } = await validateFingerprint(customData?.fingerprint);

  if (error) {
    return error;
  }

  let chat = null;

  if (!customData.chatId) {
    chat = await createChat({
      userId: userId!,
      title: 'New Chat',
    });
  } else {
    chat = await getChat(customData.chatId, userId!);

    if (!chat) {
      return new Response('Chat not found', { status: 404 });
    }
  }

  const config = {
    user_id: userId!,
    rerank: true,
    threshold: 0.1,
    output_format: "v1.0",
    enable_graph: true
  }

  let writerRef: { value: Writer | null } = {
    value: null
  }


  // const memories = await getMemories(messages, config);
  // const memories = await getMemories(messages);
  console.log(config, "first log");
  const {memories, systemMessage} = await retrieveMemories(messages, config);
  const systemPrompt = [getBaseSystemPrompt(), SYSTEM_HIGHLIGHT_PROMPT, systemMessage].filter(Boolean).join("\n");
  // console.log(memories);
  // console.log(memories, systemMessage);

  // Uložíme user zprávu PŘED streamText - zajistí správné pořadí
  const userMessage = messages[0];
  createMessage({
    chatId: chat.id,
    userId: userId!,
    data: userMessage,
    role: 'user',
  }); // DONE dokazu replikovat pozdeji

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    maxSteps: 5,
    // forward system prompt and tools from the frontend
    toolCallStreaming: true,
    system: systemPrompt,
    tools: {
      generateChatTitle: generateChatTitleTool(writerRef, chat.id, userId!), // dodelat aby se nerunovalo pokud uz existuje
      searchWeb: searchWebTool(),
    },
    onError: console.log,
    onFinish: (finishData) => {
      console.log("finishData");

      // {
      //   "id": "msg-g1rMMi2oj2JaHzmgdUiT0bjr",
      //   "createdAt": "2025-07-13T20:36:41.564Z",
      //   "role": "assistant",
      //   "content": "Jednou v malém městečku žil mladý muž jménem Tomáš, který měl velkou vášeň pro hudbu. Jeho nejoblíbenějším společníkem byla jeho sluchátka, která ho provázela na každém kroku. Ať už šel do školy, na procházku nebo jen relaxoval doma, jeho sluchátka byla vždy s ním.\n\nJednoho dne se Tomáš rozhodl, že si pořídí nová sluchátka, která by mu poskytla ještě lepší zvukový zážitek. Po dlouhém hledání a zkoumání se rozhodl pro bezdrátová sluchátka, která mu umožnila volnost pohybu bez omezení kabely. Jakmile je poprvé nasadil, byl ohromen čistotou zvuku a pohodlím, které mu poskytovala.\n\nTomáš si uvědomil, že sluchátka nejsou jen nástrojem pro poslech hudby, ale také prostředkem, jak se ponořit do svého vlastního světa, kde mohl snít a tvořit. Díky nim objevil nové žánry hudby a začal se zajímat o skládání vlastních melodií. Sluchátka se stala jeho inspirací a pomohla mu najít svou cestu v životě.\n\nPokud hledáte dobrá sluchátka, zde jsou některé z nejlepších možností pro rok 2025:\n\n1. **HyperX Cloud Alpha Wireless** - Bezdrátová herní sluchátka, která se vyrovnají drátovým kolegům a překvapí svou kvalitou.\n2. **Apple AirPods PRO** - Propracovanější verze sluchátek od Apple, známá pro svou kvalitu zvuku a pohodlí.\n3. **Koss Porta Pro** - Legendární sluchátka s jednoduchým a kvalitním systémem úchytu.\n4. **JBL Tune 235NC TWS** - Skvělá volba pro ty, kteří hledají kvalitní zvuk za rozumnou cenu.\n5. **JLab Go Air Pop** - Cenově dostupná sluchátka s parádní výdrží.\n\nPokud byste chtěli vědět více o těchto sluchátkách nebo o něčem jiném, dejte mi vědět!",
      //   "parts": [
      //     {
      //       "type": "step-start"
      //     },
      //     {
      //       "type": "tool-invocation",
      //       "toolInvocation": {
      //         "state": "result",
      //         "step": 0,
      //         "toolCallId": "call_gYIgo7Cflx9haA8MYRikKRj6",
      //         "toolName": "generateChatTitle",
      //         "args": {
      //           "title": "Příběh a recenze sluchátek"
      //         },
      //         "result": {
      //           "success": true,
      //           "title": "Příběh a recenze sluchátek"
      //         }
      //       }
      //     },
      //     {
      //       "type": "tool-invocation",
      //       "toolInvocation": {
      //         "state": "result",
      //         "step": 0,
      //         "toolCallId": "call_ZU8TJ3Hk5ww1ab8FTqhy9XtP",
      //         "toolName": "searchWeb",
      //         "args": {
      //           "query": "nejlepší sluchátka 2025 recenze"
      //         },
      //         "result": {
      //           "success": true,
      //           "result": {
      //             "query": "nejlepší sluchátka 2025 recenze",
      //             "results": [
      //               {
      //                 "url": "https://www.alza.cz/nejlepsi-sluchatka",
      //                 "title": "Nejlepší sluchátka 2025 (AKTUALIZOVÁNO) | Alza.cz",
      //                 "content": "Bezdrátová herní sluchátka HyperX Cloud Alpha Wireless se svým drátovým kolegům spolehlivě vyrovnají a navíc dokážou i překvapit. Například těžko uvěřitelnou ...",
      //                 "score": 14,
      //                 "image": "https://www.google.com/s2/favicons?domain=www.alza.cz&sz=64"
      //               },
      //               {
      //                 "url": "https://www.vseumel.cz/bezdratova-sluchatka-recenze/",
      //                 "title": "▷ TEST 11+ nejlepších bezdrátových sluchátek 2025 RECENZE + Jak vybrat",
      //                 "content": "Rozhodli jsme se vám proto přinést test těch neoblíbenějších bezdrátových sluchátek do uší a přes uši a řekneme si také něco o jejich výběru. Bezdrátová sluchátka Apple AirPods PRO jsou propracovanější verze sluchátek, které firma Apple poprvé uvedla jako AirPods.",
      //                 "score": 3.7727272727272725,
      //                 "image": "https://www.vseumel.cz/wp-content/uploads/2020/10/bezdratova-sluchatka.jpg"
      //               },
      //               {
      //                 "url": "https://www.testado.cz/nejlepsi-sluchatka/",
      //                 "title": "Nejlepší sluchátka v roce 2024 - Rady a tipy pro správný výběr",
      //                 "content": "26. března 2025 - Mezi největší hudební legendy právem patří sluchátka Koss Porta Pro (recenze). Řeč je o skutečné hvězdě, kterou znají v mnoha koutech světa. Sluchátka vlastní jednoduchý a kvalitní systém úchytu, jehož služby uvítá kdejaký hudební nadšenec.",
      //                 "score": 3.085470085470085,
      //                 "image": "https://www.testado.cz/wp-content/uploads/2024/03/nejlepsi-sluchatka-uvodni-obrazek-testado.jpg"
      //               },
      //               {
      //                 "url": "https://www.cena-vykon.cz/sluchatka/nejlepsi-do/10000/",
      //                 "title": "TOP 20 sluchátek do 10 000 Kč - červenec 2025 - Cena-Vykon.cz",
      //                 "content": "TOP 20 sluchátek do 10 000 Kč - červenec 2025 · Dyson Ontrac WP02 · JBL Tune 235NC TWS · Shokz OpenRun USB-C · Anker Soundcore Space A40 · Realme Buds Air 6 Green.",
      //                 "score": 2.6785714285714284,
      //                 "image": "https://www.cena-vykon.cz/porovnavac/www/assets/cena-vykon-cz-ogimage.png"
      //               },
      //               {
      //                 "url": "https://avmania.zive.cz/nejlepsi-bezdratova-sluchatka-true-wireless",
      //                 "title": "Vybrali jsme nejlepší sluchátka True Wireless. Jsou malá, úplně bez ...",
      //                 "content": "4. 5. 2025 — Vybrali jsme nejlepší sluchátka True Wireless. Jsou malá, úplně bez drátů a levnější než dřív · JLab Go Air Pop: Nejlevnější a s parádní výdrží.",
      //                 "score": 2.55,
      //                 "image": "https://avmania.zive.cz/getthumbnail.aspx?w=20000&h=20000&q=100&id_file=132530620"
      //               }
      //             ]
      //           }
      //         }
      //       }
      //     },
      //     {
      //       "type": "step-start"
      //     },
      //     {
      //       "type": "text",
      //       "text": "Jednou v malém městečku žil mladý muž jménem Tomáš, který měl velkou vášeň pro hudbu. Jeho nejoblíbenějším společníkem byla jeho sluchátka, která ho provázela na každém kroku. Ať už šel do školy, na procházku nebo jen relaxoval doma, jeho sluchátka byla vždy s ním.\n\nJednoho dne se Tomáš rozhodl, že si pořídí nová sluchátka, která by mu poskytla ještě lepší zvukový zážitek. Po dlouhém hledání a zkoumání se rozhodl pro bezdrátová sluchátka, která mu umožnila volnost pohybu bez omezení kabely. Jakmile je poprvé nasadil, byl ohromen čistotou zvuku a pohodlím, které mu poskytovala.\n\nTomáš si uvědomil, že sluchátka nejsou jen nástrojem pro poslech hudby, ale také prostředkem, jak se ponořit do svého vlastního světa, kde mohl snít a tvořit. Díky nim objevil nové žánry hudby a začal se zajímat o skládání vlastních melodií. Sluchátka se stala jeho inspirací a pomohla mu najít svou cestu v životě.\n\nPokud hledáte dobrá sluchátka, zde jsou některé z nejlepších možností pro rok 2025:\n\n1. **HyperX Cloud Alpha Wireless** - Bezdrátová herní sluchátka, která se vyrovnají drátovým kolegům a překvapí svou kvalitou.\n2. **Apple AirPods PRO** - Propracovanější verze sluchátek od Apple, známá pro svou kvalitu zvuku a pohodlí.\n3. **Koss Porta Pro** - Legendární sluchátka s jednoduchým a kvalitním systémem úchytu.\n4. **JBL Tune 235NC TWS** - Skvělá volba pro ty, kteří hledají kvalitní zvuk za rozumnou cenu.\n5. **JLab Go Air Pop** - Cenově dostupná sluchátka s parádní výdrží.\n\nPokud byste chtěli vědět více o těchto sluchátkách nebo o něčem jiném, dejte mi vědět!"
      //     }
      //   ],
      //   "toolInvocations": [
      //     {
      //       "state": "result",
      //       "step": 0,
      //       "toolCallId": "call_gYIgo7Cflx9haA8MYRikKRj6",
      //       "toolName": "generateChatTitle",
      //       "args": {
      //         "title": "Příběh a recenze sluchátek"
      //       },
      //       "result": {
      //         "success": true,
      //         "title": "Příběh a recenze sluchátek"
      //       }
      //     },
      //     {
      //       "state": "result",
      //       "step": 0,
      //       "toolCallId": "call_ZU8TJ3Hk5ww1ab8FTqhy9XtP",
      //       "toolName": "searchWeb",
      //       "args": {
      //         "query": "nejlepší sluchátka 2025 recenze"
      //       },
      //       "result": {
      //         "success": true,
      //         "result": {
      //           "query": "nejlepší sluchátka 2025 recenze",
      //           "results": [
      //             {
      //               "url": "https://www.alza.cz/nejlepsi-sluchatka",
      //               "title": "Nejlepší sluchátka 2025 (AKTUALIZOVÁNO) | Alza.cz",
      //               "content": "Bezdrátová herní sluchátka HyperX Cloud Alpha Wireless se svým drátovým kolegům spolehlivě vyrovnají a navíc dokážou i překvapit. Například těžko uvěřitelnou ...",
      //               "score": 14,
      //               "image": "https://www.google.com/s2/favicons?domain=www.alza.cz&sz=64"
      //             },
      //             {
      //               "url": "https://www.vseumel.cz/bezdratova-sluchatka-recenze/",
      //               "title": "▷ TEST 11+ nejlepších bezdrátových sluchátek 2025 RECENZE + Jak vybrat",
      //               "content": "Rozhodli jsme se vám proto přinést test těch neoblíbenějších bezdrátových sluchátek do uší a přes uši a řekneme si také něco o jejich výběru. Bezdrátová sluchátka Apple AirPods PRO jsou propracovanější verze sluchátek, které firma Apple poprvé uvedla jako AirPods.",
      //               "score": 3.7727272727272725,
      //               "image": "https://www.vseumel.cz/wp-content/uploads/2020/10/bezdratova-sluchatka.jpg"
      //             },
      //             {
      //               "url": "https://www.testado.cz/nejlepsi-sluchatka/",
      //               "title": "Nejlepší sluchátka v roce 2024 - Rady a tipy pro správný výběr",
      //               "content": "26. března 2025 - Mezi největší hudební legendy právem patří sluchátka Koss Porta Pro (recenze). Řeč je o skutečné hvězdě, kterou znají v mnoha koutech světa. Sluchátka vlastní jednoduchý a kvalitní systém úchytu, jehož služby uvítá kdejaký hudební nadšenec.",
      //               "score": 3.085470085470085,
      //               "image": "https://www.testado.cz/wp-content/uploads/2024/03/nejlepsi-sluchatka-uvodni-obrazek-testado.jpg"
      //             },
      //             {
      //               "url": "https://www.cena-vykon.cz/sluchatka/nejlepsi-do/10000/",
      //               "title": "TOP 20 sluchátek do 10 000 Kč - červenec 2025 - Cena-Vykon.cz",
      //               "content": "TOP 20 sluchátek do 10 000 Kč - červenec 2025 · Dyson Ontrac WP02 · JBL Tune 235NC TWS · Shokz OpenRun USB-C · Anker Soundcore Space A40 · Realme Buds Air 6 Green.",
      //               "score": 2.6785714285714284,
      //               "image": "https://www.cena-vykon.cz/porovnavac/www/assets/cena-vykon-cz-ogimage.png"
      //             },
      //             {
      //               "url": "https://avmania.zive.cz/nejlepsi-bezdratova-sluchatka-true-wireless",
      //               "title": "Vybrali jsme nejlepší sluchátka True Wireless. Jsou malá, úplně bez ...",
      //               "content": "4. 5. 2025 — Vybrali jsme nejlepší sluchátka True Wireless. Jsou malá, úplně bez drátů a levnější než dřív · JLab Go Air Pop: Nejlevnější a s parádní výdrží.",
      //               "score": 2.55,
      //               "image": "https://avmania.zive.cz/getthumbnail.aspx?w=20000&h=20000&q=100&id_file=132530620"
      //             }
      //           ]
      //         }
      //       }
      //     }
      //   ],
      //   "revisionId": "67ClW43CntAi8zSb"
      // }

      const parts = []
      let textContent = ""

      for (const [stepIndex, step] of finishData.steps.entries()) {
        if (step.toolResults && step.toolResults.length > 0 && step.finishReason === "tool-calls") {
          parts.push({ type: "step-start" })

          for (const toolResult of step.toolResults) {
            if (toolResult.type === "tool-result") {
              parts.push({
                type: "tool-invocation",
                toolInvocation: {
                  state: "result",
                  step: stepIndex,
                  toolName: toolResult.toolName,
                  args: toolResult.args,
                  result: toolResult.result,
                }
              })
            }
          }
        } else if (step.text.length > 0) {
          parts.push({ type: "step-start" })
          textContent += step.text

          parts.push({
            type: "text",
            text: step.text,
          })
        }
      }
      
      const aiMessage = {
        role: "assistant",
        content: textContent,
        parts,
      }

      
      // console.log(JSON.stringify(finishData, null, 2), "aiMessage");
      // fs.writeFileSync('finishData.json', JSON.stringify(finishData, null, 2));

      // Uložíme jen assistant zprávu - user zpráva už je uložená
      createMessage({
        chatId: chat.id,
        userId: userId!,
        data: aiMessage,
        role: 'assistant',
      });

      console.log("DONE STREAMING");
    }
  });

  const addMemoriesTask = addMemories(messages, { user_id: userId! });

  return createDataStreamResponse({
    execute: async (writer) => {
      writerRef.value = writer;

      // writer.writeMessageAnnotation({
      //   type: "chat-id",
      //   chatId: chat.id,
      // });

      writer.writeData({
        type: "chat-id",
        chatId: chat.id,
      })
      
      if (memories.length > 0) {
        writer.writeMessageAnnotation({
          type: "mem0-get",
          memories,
        });
      }

      result.mergeIntoDataStream(writer);

      console.log("MERGED INTO DATA STREAM");

      const newMemories = await addMemoriesTask; // TODO: Check if needed, it takes a lot of time
      if (newMemories.length > 0) {
        writer.writeMessageAnnotation({
          type: "mem0-update",
          memories: newMemories,
        });
      }

      console.log("ADDED MEMORIES");
    },
  });
}