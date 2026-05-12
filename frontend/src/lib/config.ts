export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const ENDPOINTS = {
  CHAT: `${API_BASE_URL}/api/chat/message`,
  UPLOAD: `${API_BASE_URL}/api/upload/pdf`,
  SUMMARIZE: `${API_BASE_URL}/api/chat/summarize`,
  SHARE: (id: string) => `${API_BASE_URL}/api/chat/share/${id}`,
};
