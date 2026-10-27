import type { messages, users } from "../data/schema.js";

export type User = typeof users.$inferSelect;

export type PublicUser = Pick<User, "id" | "email">;

export type Message = typeof messages.$inferSelect;

export interface MessageWithSender extends Message {
  fromEmail: string;
}

export interface NewMessageEvent {
  type: "message:new";
  message: MessageWithSender;
}

export type ServerEvent = NewMessageEvent;
