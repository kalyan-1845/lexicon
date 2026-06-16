"use client";
import { PresenceUser } from "@/hooks/useWorkspacePresence";

type Props = {
  users: PresenceUser[];
  isConnected: boolean;
};

const MAX_AVATARS = 3;

export default function PresencePill({ users, isConnected }: Props) {
  const visible = users.slice(0, MAX_AVATARS);
  const overflow = users.length - MAX_AVATARS;

  if (!isConnected && users.length === 0) {
    return (
      <div className="flex items-center gap-1.5 ml-1.5 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
        <span className="text-[10px] font-semibold text-gray-500">Offline</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 ml-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
      <div className="flex items-center">
        {visible.map((user, i) => (
          <div
            key={user.id}
            title={user.name}
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: user.color,
              border: "1.5px solid #09090b",
              marginLeft: i === 0 ? 0 : -5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 8,
              fontWeight: 700,
              color: "#fff",
              zIndex: visible.length - i,
              position: "relative",
            }}
          >
            {user.name.slice(0, 2).toUpperCase()}
          </div>
        ))}
        {overflow > 0 && (
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#3f3f46",
              border: "1.5px solid #09090b",
              marginLeft: -5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 8,
              fontWeight: 700,
              color: "#a1a1aa",
              position: "relative",
              zIndex: 0,
            }}
          >
            +{overflow}
          </div>
        )}
      </div>
      <span className="text-[10px] font-bold text-indigo-400">
        {users.length} online
      </span>
    </div>
  );
}