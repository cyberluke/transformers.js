"use client";

import { ActionBarPrimitive, BranchPickerPrimitive, ComposerPrimitive, MessagePrimitive, ThreadPrimitive } from "@assistant-ui/react";
import type { FC } from "react";
import { ArrowDownIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, CopyIcon, RefreshCwIcon, SendHorizontalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";

export const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton tooltip="Scroll to bottom" variant="outline" className="absolute -top-8 rounded-full disabled:invisible cursor-pointer">
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

export const ComposerAction: FC = () => {
  return (
    <>
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton tooltip="Send" variant="default" className="my-2.5 size-8 p-2 transition-opacity ease-in cursor-pointer">
            <ArrowUpIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <TooltipIconButton tooltip="Cancel" variant="default" className="my-2.5 size-8 p-2 transition-opacity ease-in cursor-pointer">
            <CircleStopIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </>
  );
};

export const ComposerActionAssistant: FC = () => {
  return (
    <>
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton tooltip="Send" variant="default" className="my-2.5 size-8 p-2 transition-opacity ease-in cursor-pointer">
            <SendHorizontalIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <TooltipIconButton tooltip="Cancel" variant="default" className="my-2.5 size-8 p-2 transition-opacity ease-in cursor-pointer">
            <CircleStopIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </>
  );
};

export const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root hideWhenRunning autohide="not-last" autohideFloat="single-branch" className="text-muted-foreground col-start-3 row-start-2 -ml-1 flex gap-1">
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy" className="cursor-pointer">
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh" className="cursor-pointer">
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
};

export const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({ className, ...rest }) => {
  return (
    <BranchPickerPrimitive.Root hideWhenSingleBranch className={cn("text-muted-foreground inline-flex items-center text-xs cursor-pointer", className)} {...rest}>
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous" className="cursor-pointer">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next" className="cursor-pointer">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};

export const CircleStopIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
      <rect width="10" height="10" x="3" y="3" rx="2" />
    </svg>
  );
};

// ArrowUpIcon pro ComposerAction
const ArrowUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="m5 12 7-7 7 7" />
    <path d="M12 19V5" />
  </svg>
);
