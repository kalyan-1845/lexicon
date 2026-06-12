export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
}

export interface WorkspaceData {
  documents: any[];
  messages: Message[];
  collectionId: string | null;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data: T;
}
