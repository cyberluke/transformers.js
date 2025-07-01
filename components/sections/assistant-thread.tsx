"use client";

import { ComposerPrimitive, MessagePrimitive, ThreadPrimitive } from "@assistant-ui/react";
import type { FC } from "react";
import { ArrowRightIcon, PaperclipIcon, SparkleIcon, ZapIcon, LightbulbIcon } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { ComposerAttachments, UserMessageAttachments } from "@/components/assistant-ui/attachment";
import { ThreadScrollToBottom, ComposerAction, AssistantActionBar, BranchPicker, CircleStopIcon } from "@/components/sections";

export const AssistantThread: FC = () => {
  return (
    <ThreadPrimitive.Root
      className="box-border h-full"
      style={{
        ["--thread-max-width" as string]: "42rem",
      }}
    >
      <ThreadPrimitive.Empty>
        <ThreadWelcome />
      </ThreadPrimitive.Empty>
      <ThreadPrimitive.If empty={false}>
        <ThreadPrimitive.Viewport className="flex h-full flex-col items-center overflow-y-scroll scroll-smooth bg-inherit px-4 pt-8">
          <ThreadPrimitive.Messages
            components={{
              UserMessage: UserMessage,
              AssistantMessage: AssistantMessage,
            }}
          />

          <div className="min-h-8 flex-grow" />

          <div className="sticky bottom-0 mt-3 flex w-full max-w-[var(--thread-max-width)] flex-col items-center justify-end rounded-t-lg bg-inherit pb-4">
            <ThreadScrollToBottom />
            <Composer />
          </div>
        </ThreadPrimitive.Viewport>
      </ThreadPrimitive.If>
    </ThreadPrimitive.Root>
  );
};

const ThreadWelcome: FC = () => {
  const [isDetailed, setIsDetailed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    setIsDetailed((v) => !v);
    // Reset animačního stavu po dokončení animace
    setTimeout(() => setIsAnimating(false), 200);
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col gap-12">
        <div className="flex w-full flex-grow flex-col items-center justify-center">
          <p className="font-regular font-display text-4xl md:text-5xl">Co se chcete dozvědět?</p>
        </div>
        <ComposerPrimitive.Root className="focus-within:border-ring/20 w-full flex flex-col rounded-3xl bg-white backdrop-blur-lg shadow-lg hover:shadow-xl transition-all duration-200 px-2.5 ease-in min-h-[64px] max-w-full overflow-hidden">
          <ComposerAttachments />
          <ComposerPrimitive.Input rows={1} autoFocus placeholder="Ask anything..." className="placeholder:text-muted-foreground max-h-40 w-full flex-grow resize-none border-none bg-transparent px-2 py-4 text-lg outline-none focus:ring-0 disabled:cursor-not-allowed min-w-0 cursor-pointer" style={{ wordBreak: "break-word", overflowWrap: "break-word" }} />
          <div className="flex w-full items-center justify-between pt-1 pb-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" aria-label={isDetailed ? "Složitější odpověď" : "Rychlá odpověď"} onClick={handleToggle} className={`relative flex items-center w-13 h-7 rounded-full border border-gray-100 bg-white shadow-sm transition-colors duration-200 overflow-hidden cursor-pointer`}>
                  {/* Ikona vlevo (blesk) */}
                  <span className="flex items-center justify-center w-1/2 h-full">
                    <ZapIcon className={`size-4 transition-colors duration-200 ${!isDetailed ? "text-yellow-400" : "text-gray-300"}`} />
                  </span>
                  {/* Ikona vpravo (žárovka) */}
                  <span className="flex items-center justify-center w-1/2 h-full">
                    <LightbulbIcon className={`size-4 transition-colors duration-200 ${isDetailed ? "text-blue-400" : "text-gray-300"}`} />
                  </span>
                  {/* Posuvný knoflík */}
                  <span
                    className={`absolute top-1/2 left-[1px] w-6 h-6 rounded-full border border-gray-200 shadow-sm transition-transform duration-300 -translate-y-1/2
                      ${isAnimating ? "backdrop-blur-[1px]" : ""}
                      ${isDetailed ? "translate-x-6" : "translate-x-0"}`}
                    style={{ pointerEvents: "none" }}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>{isDetailed ? "Složitější odpověď" : "Rychlá jednoduchá odpověď"}</TooltipContent>
            </Tooltip>
            <div className="mx-1.5 flex gap-2">
              <ComposerPrimitive.AddAttachment asChild>
                <TooltipIconButton className="rounded-max text-muted-foreground my-2.5 size-8 p-2 transition-opacity ease-in cursor-pointer" tooltip="Add Attachment" variant="ghost">
                  <PaperclipIcon className="!size-4.5" />
                </TooltipIconButton>
              </ComposerPrimitive.AddAttachment>
              <ComposerPrimitive.Send asChild>
                <TooltipIconButton className="my-2.5 size-8 rounded-full p-2 transition-opacity cursor-pointer" tooltip="Send" variant="default">
                  <ArrowRightIcon />
                </TooltipIconButton>
              </ComposerPrimitive.Send>
            </div>
          </div>
        </ComposerPrimitive.Root>
      </div>
    </div>
  );
};

const Composer: FC = () => {
  return (
    <ComposerPrimitive.Root className="focus-within:border-ring/20 w-full flex flex-col rounded-3xl bg-white backdrop-blur-lg shadow-lg hover:shadow-xl transition-all duration-200 px-2.5 ease-in min-h-[64px] max-w-full overflow-hidden">
      <ComposerAttachments />
      <ComposerPrimitive.Input rows={1} autoFocus placeholder="Ask follow-up" className="placeholder:text-muted-foreground max-h-40 w-full flex-grow resize-none border-none bg-transparent px-2 py-4 text-lg outline-none focus:ring-0 disabled:cursor-not-allowed min-w-0 cursor-pointer" style={{ wordBreak: "break-word", overflowWrap: "break-word" }} />
      <div className="flex w-full items-center justify-between pt-1 pb-0">
        <div className="mx-1.5 flex gap-2 ml-auto">
          <ComposerPrimitive.AddAttachment asChild>
            <TooltipIconButton className="rounded-max text-muted-foreground my-2.5 size-8 p-2 transition-opacity ease-in cursor-pointer" tooltip="Add Attachment" variant="ghost">
              <PaperclipIcon className="!size-4.5" />
            </TooltipIconButton>
          </ComposerPrimitive.AddAttachment>
          <ComposerAction />
        </div>
      </div>
    </ComposerPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="relative w-full max-w-[var(--thread-max-width)] gap-y-2 py-4">
      <UserMessageAttachments />

      <div className="text-foreground break-words rounded-3xl py-2.5 text-3xl">
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="relative grid w-full max-w-[var(--thread-max-width)] grid-cols-[auto_auto_1fr] grid-rows-[auto_1fr] py-4">
      <div className="text-foreground col-span-2 col-start-2 row-start-1 my-1.5 max-w-[calc(var(--thread-max-width)*0.8)] break-words leading-7">
        <h1 className="mb-4 inline-flex items-center gap-2 text-2xl">
          <SparkleIcon /> Answer
        </h1>

        <MessagePrimitive.Content components={{ Text: MarkdownText }} />
      </div>

      <AssistantActionBar />

      <BranchPicker className="col-start-2 row-start-2 -ml-2 mr-2" />
    </MessagePrimitive.Root>
  );
};
