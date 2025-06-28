import { UseChatRuntimeOptions } from "@assistant-ui/react-ai-sdk";
import { useEdgeRuntime } from "@/lib/client/assistant-ui/edgeRuntime";
import { ThreadMessage } from "@assistant-ui/react";

export type ExperimentalFunction = (data: {
  messages: readonly ThreadMessage[];
}) => object;

export type ObjectExperimentalFunction = {
  experimental_prepareRequestBodyFix?: ExperimentalFunction;
}

export const useChatRuntime = (options: UseChatRuntimeOptions & ObjectExperimentalFunction) => {
  return useEdgeRuntime({
    ...options,
    unstable_AISDKInterop: "v2",
  });
};
