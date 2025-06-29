import { createDataStreamResponse } from "ai";

type DataStreamExecuteFn = Parameters<typeof createDataStreamResponse>[0]["execute"];
type Writer = Parameters<DataStreamExecuteFn>[0];

export type { DataStreamExecuteFn, Writer };