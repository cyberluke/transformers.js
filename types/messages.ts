import { Message } from "ai";

export interface AppMessage extends Message {
  metadata?: any;
}