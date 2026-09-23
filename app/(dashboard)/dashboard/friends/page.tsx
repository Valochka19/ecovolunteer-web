"use client";

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

interface FriendUser {
  id: string;
  name: string;
  avatar: string | null;
  city: string;
  role: string;
}

interface FriendshipRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

interface MessageRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  created_at: string;
}

type TabKey = "friends" | "requests" | "search";

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

function getFirstLetter(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    volunteer: "Волонтёр",
    organization: "Организация",
    admin: "Администратор",
    partner: "Партнёр",
  };
  return map[role] ?? role;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return formatTime(iso);
  if (days === 1) return "Вчера " + formatTime(iso);
  if (days < 7) return `${days} д. назад`;
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
}

// ────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────

function UserAvatar({
  name,
  avatarSrc,
  size = "md",
}: {
  name: string;
  avatarSrc: string | null | undefined;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses: Record<string, string> = {
    sm: "h-8 w-8 text-[10px]",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
  };
  const [imgError, setImgError] = useState(false);
  const hasAvatar = Boolean(avatarSrc) && !imgError;

  if (hasAvatar) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-full ${sizeClasses[size]}`}
      >
        <Image
          src={avatarSrc!}
          alt={name}
          fill
          className="object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 font-bold text-white ${sizeClasses[size]}`}
    >
      {getFirstLetter(name)}
    </div>
  );
}

function TabBar({
  tabs,
  activeTab,
  onChange,
  badge,
}: {
  tabs: { key: TabKey; label: string }[];
  activeTab: TabKey;
  onChange: (k: TabKey) => void;
  badge?: number;
}) {
  return (
    <div className="mb-6 flex gap-1 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1 backdrop-blur">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`relative flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
            activeTab === tab.key
              ? "bg-violet-950/60 text-violet-200 shadow-sm shadow-violet-900/20"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {tab.label}{" "}
          {tab.key === "requests" && badge && badge > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500/90 px-1.5 text-[10px] font-bold text-white">
              {badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Friend Row Card
// ────────────────────────────────────────────────────────────────

function FriendRowCard({
  user,
  friendshipId,
  onMessage,
  onRemove,
}: {
  user: FriendUser;
  friendshipId: string;
  onMessage: () => void;
  onRemove: () => void;
}) {
  const [removing, setRemoving] = useState(false);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 backdrop-blur transition-all hover:border-zinc-700">
      <UserAvatar name={user.name} avatarSrc={user.avatar} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-200 truncate">
          {user.name}
        </p>
        <p className="flex items-center gap-1 text-[11px] text-zinc-500">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {user.city || "Город не указан"}
        </p>
      </div>

      <div className="flex shrink-0 gap-1.5">
        <button
          type="button"
          onClick={onMessage}
          className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition-all hover:border-violet-600/50 hover:bg-violet-900/30 hover:text-violet-200"
        >
          💬 Написать
        </button>
        <button
          type="button"
          onClick={async () => {
            setRemoving(true);
            await onRemove();
            setRemoving(false);
          }}
          disabled={removing}
          className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-2 py-1.5 text-[11px] text-zinc-500 transition-all hover:border-red-800/40 hover:bg-red-900/20 hover:text-red-400 disabled:opacity-40"
        >
          {removing ? "..." : "✕"}
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Request Row Card
// ────────────────────────────────────────────────────────────────

function RequestRowCard({
  user,
  requestId,
  direction,
  onAccept,
  onReject,
}: {
  user: FriendUser;
  requestId: string;
  direction: "incoming" | "outgoing";
  onAccept: () => void;
  onReject: () => void;
}) {
  const [busy, setBusy] = useState(false);

  if (direction === "outgoing") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 backdrop-blur">
        <UserAvatar name={user.name} avatarSrc={user.avatar} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-200 truncate">
            {user.name}
          </p>
          <p className="text-[11px] text-amber-400/80">Заявка отправлена</p>
        </div>
        <span className="rounded-md border border-zinc-700 bg-zinc-800/40 px-2 py-1 text-[10px] text-zinc-500">
          Ожидание
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 backdrop-blur transition-all hover:border-zinc-700">
      <UserAvatar name={user.name} avatarSrc={user.avatar} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-200 truncate">
          {user.name}
        </p>
        <p className="text-[11px] text-zinc-500">
          {user.city || "Город не указан"}
        </p>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <button
          type="button"
          onClick={async () => {
            setBusy(true);
            await onAccept();
            setBusy(false);
          }}
          disabled={busy}
          className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 px-3 py-1.5 text-[11px] font-medium text-emerald-300 transition-all hover:bg-emerald-800/40 disabled:opacity-40"
        >
          {busy ? "..." : "✓ Принять"}
        </button>
        <button
          type="button"
          onClick={async () => {
            setBusy(true);
            await onReject();
            setBusy(false);
          }}
          disabled={busy}
          className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-[11px] font-medium text-zinc-400 transition-all hover:border-red-800/40 hover:bg-red-900/20 hover:text-red-400 disabled:opacity-40"
        >
          {busy ? "..." : "✕ Отклонить"}
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Search User Row
// ────────────────────────────────────────────────────────────────

function SearchUserRow({
  user,
  relationStatus,
  onSendRequest,
}: {
  user: FriendUser;
  relationStatus: "none" | "pending" | "accepted" | "self";
  onSendRequest: () => void;
}) {
  const [sending, setSending] = useState(false);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 backdrop-blur transition-all hover:border-zinc-700">
      <UserAvatar name={user.name} avatarSrc={user.avatar} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-200 truncate">
          {user.name}
        </p>
        <p className="text-[11px] text-zinc-500">{user.city || "Город не указан"}</p>
      </div>

      <div className="shrink-0">
        {relationStatus === "none" && (
          <button
            type="button"
            onClick={async () => {
              setSending(true);
              await onSendRequest();
              setSending(false);
            }}
            disabled={sending}
            className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-1.5 text-[11px] font-medium text-white transition-all hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40"
          >
            {sending ? "..." : "Добавить в друзья"}
          </button>
        )}
        {relationStatus === "pending" && (
          <span className="rounded-lg border border-amber-700/30 bg-amber-900/20 px-4 py-1.5 text-[11px] font-medium text-amber-400">
            Заявка отправлена
          </span>
        )}
        {relationStatus === "accepted" && (
          <span className="rounded-lg border border-emerald-700/30 bg-emerald-900/20 px-4 py-1.5 text-[11px] font-medium text-emerald-400">
            ✓ В друзьях
          </span>
        )}
        {relationStatus === "self" && (
          <span className="rounded-lg border border-zinc-700 bg-zinc-800/40 px-4 py-1.5 text-[11px] text-zinc-500">
            — это вы
          </span>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Messenger Chat Overlay
// ────────────────────────────────────────────────────────────────

function MessengerChat({
  friend,
  currentUserId,
  onClose,
}: {
  friend: FriendUser;
  currentUserId: string;
  onClose: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load message history
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data } = await (supabase as any)
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${currentUserId})`
        )
        .order("created_at", { ascending: true });

      if (!cancelled && data) {
        setMessages(data as MessageRow[]);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase, currentUserId, friend.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=in.(${currentUserId},${friend.id})`,
        },
        (payload: { new: MessageRow }) => {
          const msg = payload.new;
          // Only show messages between these two users
          const isRelevant =
            (msg.sender_id === currentUserId && msg.receiver_id === friend.id) ||
            (msg.sender_id === friend.id && msg.receiver_id === currentUserId);
          if (isRelevant) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, currentUserId, friend.id]);

  // Send message
  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setText("");

    await (supabase as any).from("messages").insert({
      sender_id: currentUserId,
      receiver_id: friend.id,
      text: trimmed,
    });
  }, [text, supabase, currentUserId, friend.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm p-4">
      <div className="flex w-full max-w-lg flex-col rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-zinc-950/60 max-h-[80vh]">
        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
          <UserAvatar name={friend.name} avatarSrc={friend.avatar} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-200 truncate">
              {friend.name}
            </p>
            <p className="flex items-center gap-1 text-[10px] text-emerald-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              В сети
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-zinc-500 transition-all hover:bg-zinc-800 hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        {/* ── Messages ───────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-[300px] max-h-[50vh]">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-600">
              <p className="text-sm">Нет сообщений</p>
              <p className="text-[11px]">Напишите первое сообщение</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      isMine
                        ? "bg-gradient-to-r from-violet-600/80 to-indigo-600/80 text-white rounded-br-md"
                        : "bg-zinc-800/80 text-zinc-200 rounded-bl-md"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p
                      className={`text-[10px] mt-0.5 ${
                        isMine ? "text-violet-200/60" : "text-zinc-500"
                      }`}
                    >
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Input ──────────────────────────────────────── */}
        <div className="flex items-center gap-2 border-t border-zinc-800 px-4 py-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите сообщение..."
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 transition-colors focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim()}
            className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40"
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────

export default function FriendsPage() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  // ── Tabs ─────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabKey>("friends");

  // ── Data ─────────────────────────────────────────────────────
  const [allProfiles, setAllProfiles] = useState<FriendUser[]>([]);
  const [friendships, setFriendships] = useState<FriendshipRow[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Chat overlay ─────────────────────────────────────────────
  const [chatFriend, setChatFriend] = useState<FriendUser | null>(null);

  // ── Search ───────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");

  // ── Fetch all data ───────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      // 1. All profiles (for search)
      const { data: profiles } = await (supabase as any)
        .from("profiles")
        .select("id, name, avatar, city, role");

      // 2. Friendships for current user
      const { data: rels } = await (supabase as any)
        .from("friendships")
        .select("*")
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`);

      if (!cancelled) {
        if (profiles) setAllProfiles(profiles as FriendUser[]);
        if (rels) setFriendships(rels as FriendshipRow[]);
        setLoading(false);
      }
    }

    if (user) load();
    return () => {
      cancelled = true;
    };
  }, [supabase, user]);

  // ── Derived data ─────────────────────────────────────────────
  const currentUserId = user?.id ?? "";

  // Accepted friend IDs
  const acceptedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const f of friendships) {
      if (f.status !== "accepted") continue;
      ids.add(f.sender_id === currentUserId ? f.receiver_id : f.sender_id);
    }
    return ids;
  }, [friendships, currentUserId]);

  // Pending incoming (someone sent to me)
  const incomingRequests = useMemo(() => {
    return friendships.filter(
      (f) => f.status === "pending" && f.receiver_id === currentUserId
    );
  }, [friendships, currentUserId]);

  // Pending outgoing (I sent)
  const outgoingIds = useMemo(() => {
    const ids = new Set<string>();
    for (const f of friendships) {
      if (f.status !== "pending") continue;
      if (f.sender_id === currentUserId) ids.add(f.receiver_id);
    }
    return ids;
  }, [friendships, currentUserId]);

  // Friend list (accepted)
  const friendList = useMemo(() => {
    return allProfiles.filter((p) => acceptedIds.has(p.id));
  }, [allProfiles, acceptedIds]);

  // Map profile by id
  const profileMap = useMemo(() => {
    const m = new Map<string, FriendUser>();
    for (const p of allProfiles) m.set(p.id, p);
    return m;
  }, [allProfiles]);

  // Relation status helper
  const getRelationStatus = useCallback(
    (targetId: string): "none" | "pending" | "accepted" | "self" => {
      if (targetId === currentUserId) return "self";
      if (acceptedIds.has(targetId)) return "accepted";
      if (outgoingIds.has(targetId)) return "pending";

      // Also check if THEY sent ME a pending request
      const hasIncoming = friendships.some(
        (f) =>
          f.status === "pending" &&
          f.sender_id === targetId &&
          f.receiver_id === currentUserId
      );
      if (hasIncoming) return "pending";

      return "none";
    },
    [currentUserId, acceptedIds, outgoingIds, friendships]
  );

  // ── Handlers ─────────────────────────────────────────────────

  const handleSendRequest = useCallback(
    async (targetId: string) => {
      if (!user) return;
      const { error } = await (supabase as any).from("friendships").insert({
        sender_id: user.id,
        receiver_id: targetId,
        status: "pending",
      });

      if (error) {
        console.warn("Friend request error:", error.message);
        return;
      }

      // Optimistic update
      const newRow: FriendshipRow = {
        id: "temp_" + Date.now(),
        sender_id: user.id,
        receiver_id: targetId,
        status: "pending",
        created_at: new Date().toISOString(),
      };
      setFriendships((prev) => [...prev, newRow]);
    },
    [supabase, user]
  );

  const handleAcceptRequest = useCallback(
    async (requestId: string) => {
      const { error } = await (supabase as any)
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", requestId);

      if (error) {
        console.warn("Accept error:", error.message);
        return;
      }

      setFriendships((prev) =>
        prev.map((f) =>
          f.id === requestId ? { ...f, status: "accepted" } : f
        )
      );
    },
    [supabase]
  );

  const handleRejectRequest = useCallback(
    async (requestId: string) => {
      const { error } = await (supabase as any)
        .from("friendships")
        .update({ status: "rejected" })
        .eq("id", requestId);

      if (error) {
        console.warn("Reject error:", error.message);
        return;
      }

      setFriendships((prev) =>
        prev.map((f) =>
          f.id === requestId ? { ...f, status: "rejected" } : f
        )
      );
    },
    [supabase]
  );

  const handleRemoveFriend = useCallback(
    async (friendshipId: string) => {
      const { error } = await (supabase as any)
        .from("friendships")
        .delete()
        .eq("id", friendshipId);

      if (error) {
        console.warn("Remove error:", error.message);
        return;
      }

      setFriendships((prev) => prev.filter((f) => f.id !== friendshipId));
    },
    [supabase]
  );

  // ── Find friendship id between current user and friend ───────
  const findFriendshipId = useCallback(
    (friendId: string): string | null => {
      for (const f of friendships) {
        if (f.status !== "accepted") continue;
        if (
          (f.sender_id === currentUserId && f.receiver_id === friendId) ||
          (f.sender_id === friendId && f.receiver_id === currentUserId)
        ) {
          return f.id;
        }
      }
      return null;
    },
    [friendships, currentUserId]
  );

  // ── Search filter ────────────────────────────────────────────
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return allProfiles;
    const q = searchQuery.toLowerCase();
    return allProfiles.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.city && p.city.toLowerCase().includes(q))
    );
  }, [searchQuery, allProfiles]);

  // ── Render views ─────────────────────────────────────────────

  const renderFriendList = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
        </div>
      );
    }

    if (friendList.length === 0) {
      return (
        <div className="flex flex-col items-center gap-4 py-20">
          <span className="text-5xl opacity-30">👥</span>
          <p className="text-sm text-zinc-500">Вы ещё не добавили друзей!</p>
          <button
            type="button"
            onClick={() => setActiveTab("search")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-violet-900/30 transition-all hover:from-violet-500 hover:to-indigo-500"
          >
            🔍 Найти друзей
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <p className="text-[11px] text-zinc-600 mb-1">
          Всего друзей: {friendList.length}
        </p>
        {friendList.map((friend) => {
          const fid = findFriendshipId(friend.id);
          return (
            <FriendRowCard
              key={friend.id}
              user={friend}
              friendshipId={fid ?? ""}
              onMessage={() => setChatFriend(friend)}
              onRemove={() => fid && handleRemoveFriend(fid)}
            />
          );
        })}
      </div>
    );
  };

  const renderRequests = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
        </div>
      );
    }

    // Incoming
    const incoming = incomingRequests
      .map((r) => ({ ...r, friend: profileMap.get(r.sender_id) }))
      .filter((r) => r.friend);

    // Outgoing
    const outgoing = friendships
      .filter((f) => f.status === "pending" && f.sender_id === currentUserId)
      .map((r) => ({ ...r, friend: profileMap.get(r.receiver_id) }))
      .filter((r) => r.friend);

    if (incoming.length === 0 && outgoing.length === 0) {
      return (
        <div className="flex flex-col items-center gap-4 py-20">
          <span className="text-5xl opacity-30">📭</span>
          <p className="text-sm text-zinc-500">Нет заявок</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {incoming.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              Входящие заявки ({incoming.length})
            </p>
            <div className="flex flex-col gap-2">
              {incoming.map((r) => (
                <RequestRowCard
                  key={r.id}
                  user={r.friend!}
                  requestId={r.id}
                  direction="incoming"
                  onAccept={() => handleAcceptRequest(r.id)}
                  onReject={() => handleRejectRequest(r.id)}
                />
              ))}
            </div>
          </div>
        )}

        {outgoing.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              Исходящие заявки ({outgoing.length})
            </p>
            <div className="flex flex-col gap-2">
              {outgoing.map((r) => (
                <RequestRowCard
                  key={r.id}
                  user={r.friend!}
                  requestId={r.id}
                  direction="outgoing"
                  onAccept={() => {}}
                  onReject={() => {}}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSearch = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
        </div>
      );
    }

    return (
      <div>
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-600">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск волонтёров по имени или городу..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-3 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-600 backdrop-blur transition-colors focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
          />
        </div>

        <div className="flex flex-col gap-2">
          {searchResults.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <span className="text-5xl opacity-30">🔍</span>
              <p className="text-sm text-zinc-500">Ничего не найдено</p>
            </div>
          ) : (
            searchResults.map((p) => (
              <SearchUserRow
                key={p.id}
                user={p}
                relationStatus={getRelationStatus(p.id)}
                onSendRequest={() => handleSendRequest(p.id)}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full md:max-w-2xl">
      {/* ── Page header ───────────────────────────────────────── */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          👥 Друзья
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Ваши волонтёрские связи и командные активности
        </p>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <TabBar
        tabs={[
          { key: "friends", label: "👥 Мои друзья" },
          { key: "requests", label: "📩 Заявки" },
          { key: "search", label: "🔍 Поиск волонтёров" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        badge={incomingRequests.length}
      />

      {/* ── Content ───────────────────────────────────────────── */}
      {activeTab === "friends" && renderFriendList()}
      {activeTab === "requests" && renderRequests()}
      {activeTab === "search" && renderSearch()}

      {/* ── Chat overlay ──────────────────────────────────────── */}
      {chatFriend && (
        <MessengerChat
          friend={chatFriend}
          currentUserId={currentUserId}
          onClose={() => setChatFriend(null)}
        />
      )}
    </div>
  );
}
