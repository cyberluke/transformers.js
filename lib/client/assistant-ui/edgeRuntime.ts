"use client";

import { EdgeModelAdapterOptions, EdgeModelAdapter } from "@/lib/client/assistant-ui/edgeModelAdapter";
import {
  AssistantRuntime,
  INTERNAL,
  LocalRuntimeOptions,
  useLocalRuntime,
} from "@assistant-ui/react";

const { splitLocalRuntimeOptions } = INTERNAL;

export type EdgeRuntimeOptions = EdgeModelAdapterOptions & LocalRuntimeOptions;

export const useEdgeRuntime = (
  options: EdgeRuntimeOptions,
): AssistantRuntime => {
  const { localRuntimeOptions, otherOptions } =
    splitLocalRuntimeOptions(options);

  return useLocalRuntime(
    new EdgeModelAdapter(otherOptions),
    localRuntimeOptions,
  );
};
