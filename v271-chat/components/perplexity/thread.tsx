"use client";

import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import type { FC } from "react";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  PaperclipIcon,
  RefreshCwIcon,
  SparkleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import {
  ComposerAttachments,
  UserMessageAttachments,
} from "@/components/assistant-ui/attachment";

export const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root
      className="box-border h-full relative overflow-hidden"
      style={{
        ["--thread-max-width" as string]: "42rem",
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900" />
      
      <ThreadPrimitive.Empty>
        <ThreadWelcome />
      </ThreadPrimitive.Empty>
      <ThreadPrimitive.If empty={false}>
        <ThreadPrimitive.Viewport className="relative z-10 flex h-full flex-col items-center overflow-y-scroll scroll-smooth px-4 pt-8">
          <ThreadPrimitive.Messages
            components={{
              UserMessage: UserMessage,
              AssistantMessage: AssistantMessage,
            }}
          />

          <div className="min-h-8 flex-grow" />

          <div className="sticky bottom-0 mt-3 flex w-full max-w-[var(--thread-max-width)] flex-col items-center justify-end rounded-t-lg pb-4">
            <ThreadScrollToBottom />
            <Composer />
          </div>
        </ThreadPrimitive.Viewport>
      </ThreadPrimitive.If>
    </ThreadPrimitive.Root>
  );
};

const ThreadWelcome: FC = () => {
  return (
    <div className="relative z-10 flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col gap-12">
        <div className="flex w-full flex-grow flex-col items-center justify-center">
          {/* Title */}
          <div className="relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl p-8">
            <p className="relative font-regular font-display text-4xl md:text-5xl text-white/90">
              What do you want to know?
            </p>
          </div>
        </div>
        
        {/* Enhanced Composer */}
        <div className="relative">
          <ComposerPrimitive.Root className="relative focus-within:ring-white/20 w-full rounded-lg border border-white/10 backdrop-blur-sm bg-white/5 px-2 shadow-xl outline-none transition-all duration-300 focus-within:ring-1 focus-within:border-white/20 focus:outline-none">
            <ComposerPrimitive.Input
              rows={1}
              autoFocus
              placeholder="Ask anything..."
              className="placeholder:text-white/50 max-h-40 w-full flex-grow resize-none border-none bg-transparent px-2 py-4 text-lg text-white outline-none focus:ring-0 disabled:cursor-not-allowed"
            />
            <div className="mx-1.5 flex gap-2">
              <div className="flex-grow" />
              <ComposerPrimitive.AddAttachment asChild>
                <TooltipIconButton
                  className="rounded-max text-white/60 hover:text-white/90 my-2.5 size-8 p-2 transition-all ease-in hover:bg-white/10"
                  tooltip="Add Attachment"
                  variant="ghost"
                >
                  <PaperclipIcon className="!size-4.5" />
                </TooltipIconButton>
              </ComposerPrimitive.AddAttachment>
              <ComposerPrimitive.Send asChild>
                <TooltipIconButton
                  className="my-2.5 size-8 rounded-full p-2 bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                  tooltip="Send"
                  variant="default"
                >
                  <ArrowRightIcon />
                </TooltipIconButton>
              </ComposerPrimitive.Send>
            </div>
          </ComposerPrimitive.Root>
        </div>
      </div>
    </div>
  );
};

const Composer: FC = () => {
  return (
    <div className="relative w-full">
      <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 w-full rounded-full p-2">
        <ComposerPrimitive.Root className="focus-within:border-white/30 flex w-full flex-wrap items-end rounded-full border border-white/10 bg-transparent px-2.5 shadow-sm transition-colors ease-in">
          <ComposerAttachments />
          <ComposerPrimitive.Input
            rows={1}
            autoFocus
            placeholder="Ask follow-up"
            className="placeholder:text-white/50 max-h-40 flex-grow resize-none border-none bg-transparent px-4 py-4 text-lg text-white outline-none focus:ring-0 disabled:cursor-not-allowed"
          />
          <div className="flex gap-3">
            <ComposerPrimitive.AddAttachment asChild>
              <TooltipIconButton
                className="text-white/60 hover:text-white/90 my-2.5 size-10 p-1 transition-all ease-in hover:bg-white/10"
                tooltip="Add Attachment"
                variant="ghost"
              >
                <PaperclipIcon className="!size-6" />
              </TooltipIconButton>
            </ComposerPrimitive.AddAttachment>
            <ComposerAction />
          </div>
        </ComposerPrimitive.Root>
      </div>
    </div>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="relative grid w-full max-w-[var(--thread-max-width)] grid-cols-[auto_auto_1fr] grid-rows-[auto_1fr] py-4">
      {/* Message background */}
      <div className="col-span-3 row-span-2 relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl" />
      
      <div className="relative z-10 text-white/90 col-span-2 col-start-2 row-start-1 my-1.5 max-w-[calc(var(--thread-max-width)*0.8)] break-words leading-7">
        <h1 className="mb-4 inline-flex items-center gap-2 text-2xl">
          <SparkleIcon className="text-purple-400" /> Answer
        </h1>

        <MessagePrimitive.Content components={{ Text: MarkdownText }} />
      </div>

      <AssistantActionBar />
      <BranchPicker className="col-start-2 row-start-2 -ml-2 mr-2" />
    </MessagePrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="relative w-full max-w-[var(--thread-max-width)] gap-y-2 py-4">
      <UserMessageAttachments />
      
      <div className="relative text-white/95 backdrop-blur-sm bg-white/5 border border-white/10 break-words rounded-3xl py-2.5 px-4 text-3xl">
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="relative z-10 text-white/60 col-start-3 row-start-2 -ml-1 flex gap-1"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton 
          tooltip="Copy"
          className="hover:bg-white/10 hover:text-white/90 transition-all"
        >
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton 
          tooltip="Refresh"
          className="hover:bg-white/10 hover:text-white/90 transition-all"
        >
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
};

const ComposerAction: FC = () => {
  return (
    <>
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip="Send"
            variant="default"
            className="my-2.5 size-10 rounded-full p-2 bg-white/10 hover:bg-white/20 border border-white/20 transition-all ease-in"
          >
            <ArrowUpIcon className="!size-5" />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <TooltipIconButton
            tooltip="Cancel"
            variant="default"
            className="my-2.5 size-10 rounded-full p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all ease-in"
          >
            <CircleStopIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <div className="relative">
        <TooltipIconButton
          tooltip="Scroll to bottom"
          variant="outline"
          className="relative -top-8 rounded-full bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:text-white disabled:invisible backdrop-blur-sm"
        >
          <ArrowDownIcon />
        </TooltipIconButton>
      </div>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "relative z-10 text-white/60 inline-flex items-center text-xs",
        className,
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton 
          tooltip="Previous"
          className="hover:bg-white/10 hover:text-white/90 transition-all"
        >
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton 
          tooltip="Next"
          className="hover:bg-white/10 hover:text-white/90 transition-all"
        >
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};

const CircleStopIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      width="16"
      height="16"
    >
      <rect width="10" height="10" x="3" y="3" rx="2" />
    </svg>
  );
};