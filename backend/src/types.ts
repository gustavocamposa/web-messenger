export interface User {
  id: string;
  email: string;
  passwordHash: string;
}

export type PublicUser = Pick<User, "id" | "email">;

export interface Message {
  id: string;
  from: string;
  to: string;
  text: string;
  createdAt: string;
}

export interface MessageWithSender extends Message {
  fromEmail: string;
}

export interface NewMessageEvent {
  type: "message:new";
  message: MessageWithSender;
}

export type ServerEvent = NewMessageEvent;

export interface DatabaseSchema {
  users: User[];
  messages: Message[];
}
