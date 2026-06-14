"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { showToast } from "@/components/Toast";

export type PresenceUser = {
  id: string;
  name: string;
  color: string;
};

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export function useWorkspacePresence(workspaceId: string | null) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const myId = useRef(`user-${Math.random().toString(36).slice(2, 7)}`);

  const connect = useCallback(() => {
    if (!workspaceId) return;

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const wsUrl = backendUrl.replace(/^http/, "ws") + `/ws/${encodeURIComponent(workspaceId)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({ type: "join", userId: myId.current, name: "You" }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === "user_joined") {
          setUsers((prev) => {
            if (prev.find((u) => u.id === msg.userId)) return prev;
            const color = COLORS[prev.length % COLORS.length];
            showToast(`${msg.name} joined ${workspaceId}`, "success");
            return [...prev, { id: msg.userId, name: msg.name, color }];
          });
        }

        if (msg.type === "user_left") {
          setUsers((prev) => {
            showToast(`${msg.name} left ${workspaceId}`, "info");
            return prev.filter((u) => u.id !== msg.userId);
          });
        }

        if (msg.type === "presence_sync") {
          // Full user list sent on initial connect
          setUsers(
            msg.users.map((u: { userId: string; name: string }, i: number) => ({
              id: u.userId,
              name: u.name,
              color: COLORS[i % COLORS.length],
            }))
          );
        }
      } catch {
        // Non-JSON messages (legacy backend strings) — ignore
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      showToast("Connection lost. Reconnecting…", "warning");
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [workspaceId]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { users, isConnected };
}