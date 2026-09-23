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
import type { PostWithAuthor } from "./types";

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

function getFirstLetter(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

function formatTimestamp(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Только что";
  if (mins < 60) return `${mins} мин. назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} д. назад`;
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
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

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    Волонтёр:
      "bg-emerald-900/50 text-emerald-300 border-emerald-700/30",
    Организация:
      "bg-violet-900/50 text-violet-300 border-violet-700/30",
    Партнёр: "bg-amber-900/50 text-amber-300 border-amber-700/30",
    Администратор:
      "bg-red-900/50 text-red-300 border-red-700/30",
  };
  const cls = colors[role] ?? "bg-zinc-800 text-zinc-300 border-zinc-700";
  return (
    <span
      className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls}`}
    >
      {role}
    </span>
  );
}

function LikeButton({
  count,
  active,
  onToggle,
}: {
  count: number;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group flex items-center gap-1.5 text-xs font-medium transition-all ${
        active
          ? "text-pink-400"
          : "text-zinc-500 hover:text-pink-400"
      }`}
    >
      <span
        className={`text-base transition-transform duration-200 ${
          active ? "scale-110" : "group-hover:scale-110"
        }`}
      >
        {active ? "❤️" : "🤍"}
      </span>
      <span>{count}</span>
    </button>
  );
}

// ────────────────────────────────────────────────────────────────
// Post Card  (VK-style: text ABOVE image)
// ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  currentUserId,
  onLike,
  onDelete,
}: {
  post: PostWithAuthor;
  currentUserId: string | null;
  onLike: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur transition-all duration-200 hover:border-zinc-700">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start gap-3 p-4 pb-0 md:p-5 md:pb-0">
        <UserAvatar
          name={post.authorName}
          avatarSrc={post.authorAvatar}
        />
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-200">
              {post.authorName}
            </span>
            <RoleBadge role={post.authorRole} />
          </div>
          <span className="text-[11px] text-zinc-600">
            {formatTimestamp(post.created_at)}
          </span>
        </div>

        {/* Delete button — only for the author */}
        {currentUserId === post.user_id && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Удалить этот пост?")) onDelete();
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm text-zinc-600 transition-all hover:bg-red-900/40 hover:text-red-400"
            title="Удалить пост"
          >
            🗑️
          </button>
        )}
      </div>

      {/* ── Content text (VK: ABOVE image) ─────────────────── */}
      {post.content && (
        <div className="px-4 pt-3 md:px-5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
            {post.content}
          </p>
        </div>
      )}

      {/* ── Attached image (VK: BELOW text, no warping) ────── */}
      {post.image_url && (
        <div className="mt-3 overflow-hidden border-y border-zinc-800">
          <img
            src={post.image_url}
            alt=""
            className="mx-auto w-full h-auto object-contain max-h-[600px]"
          />
        </div>
      )}

      {/* ── Interactions ───────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 py-3 md:px-5">
        <LikeButton
          count={post.likesCount}
          active={post.isLikedByMe}
          onToggle={onLike}
        />
        <button
          type="button"
          className="group flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-all hover:text-sky-400"
        >
          <span className="text-base transition-transform duration-200 group-hover:scale-110">
            💬
          </span>
          <span>{post.commentsCount}</span>
        </button>
        <button
          type="button"
          className="group flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-all hover:text-emerald-400"
        >
          <span className="text-base transition-transform duration-200 group-hover:scale-110">
            🔗
          </span>
          <span className="hidden sm:inline">Поделиться</span>
        </button>
      </div>
    </article>
  );
}

// ────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────

export default function GlobalFeedPage() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  // ── State ────────────────────────────────────────────────────
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch posts + profiles (two queries, avoids RLS recursion) ─
  useEffect(() => {
    let cancelled = false;

    async function fetchPosts() {
      setLoading(true);

      // 1. Fetch posts
      const { data: postsData, error: postsError } = await (supabase as any)
        .from("posts")
        .select("id, content, image_url, created_at, user_id")
        .order("created_at", { ascending: false });

      if (postsError) {
        console.warn("Error fetching posts:", postsError.message);
        if (!cancelled) setPosts([]);
        if (!cancelled) setLoading(false);
        return;
      }

      if (!postsData || postsData.length === 0) {
        if (!cancelled) setPosts([]);
        if (!cancelled) setLoading(false);
        return;
      }

      // 2. Collect unique author IDs
      const authorIds: string[] = [
        ...new Set((postsData as Array<Record<string, unknown>>).map((r) => r.user_id as string)),
      ];

      // 3. Fetch profiles for those IDs
      const { data: profilesData } = await (supabase as any)
        .from("profiles")
        .select("id, name, avatar, role")
        .in("id", authorIds);

      const profileMap = new Map<string, { name: string; avatar: string; role: string }>();
      if (profilesData) {
        for (const p of profilesData) {
          profileMap.set(p.id, p);
        }
      }

      // 4. Merge
      const mapped: PostWithAuthor[] = postsData.map((row: Record<string, unknown>) => {
        const userId = row.user_id as string;
        const profile = profileMap.get(userId);
        return {
          id: row.id as string,
          content: row.content as string,
          image_url: (row.image_url as string) ?? null,
          created_at: row.created_at as string,
          user_id: userId,
          authorName: profile?.name ?? "Неизвестно",
          authorAvatar: profile?.avatar ?? null,
          authorRole: profile ? roleLabel(profile.role) : "Пользователь",
          likesCount: 0,
          commentsCount: 0,
          isLikedByMe: false,
        };
      });

      if (!cancelled) setPosts(mapped);
      if (!cancelled) setLoading(false);
    }

    fetchPosts();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // ── File selection ──────────────────────────────────────────
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      if (!file) return;

      // Validate type
      if (!["image/png", "image/jpeg"].includes(file.type)) {
        alert("Пожалуйста, выберите файл в формате PNG или JPG.");
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    },
    []
  );

  const handleAddPhoto = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemovePhoto = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl]);

  // ── Publish post ────────────────────────────────────────────
  const handlePublish = useCallback(async () => {
    const trimmed = newPostContent.trim();

    // Allow publishing with just text or just an image
    if (!trimmed && !selectedFile) return;
    if (!user) return;

    setPublishing(true);

    try {
      let imageUrl: string | null = null;

      // 1. Upload image if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

        const { error: uploadError } = await (supabase.storage as any)
          .from("post-images")
          .upload(filePath, selectedFile);

        if (uploadError) {
          console.error("Upload error:", uploadError.message);
          alert("Ошибка загрузки изображения. Попробуйте ещё раз.");
          setPublishing(false);
          return;
        }

        const { data: urlData } = (supabase.storage as any)
          .from("post-images")
          .getPublicUrl(filePath);

        imageUrl = urlData?.publicUrl ?? null;
      }

      // 2. Insert post into DB (no join — we build the author from local user)
      const { data: insertedArr, error: insertError } = await (supabase as any)
        .from("posts")
        .insert({
          content: trimmed,
          image_url: imageUrl,
          user_id: user.id,
        })
        .select("id, content, image_url, created_at, user_id");

      if (insertError) {
        console.error("Insert error:", insertError.message);
        alert("Ошибка при публикации. Попробуйте ещё раз.");
        setPublishing(false);
        return;
      }

      const insertedRow = insertedArr?.[0];
      if (!insertedRow) {
        console.error("No row returned after insert");
        setPublishing(false);
        return;
      }

      // 3. Append new post to local state (author from current user)
      const newPost: PostWithAuthor = {
        id: insertedRow.id as string,
        content: insertedRow.content as string,
        image_url: (insertedRow.image_url as string) ?? null,
        created_at: insertedRow.created_at as string,
        user_id: insertedRow.user_id as string,
        authorName: user.name,
        authorAvatar: user.avatar || null,
        authorRole: roleLabel(user.role),
        likesCount: 0,
        commentsCount: 0,
        isLikedByMe: false,
      };

      setPosts((prev) => [newPost, ...prev]);

      // 4. Reset form
      setNewPostContent("");
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setPublishing(false);
    }
  }, [
    newPostContent,
    selectedFile,
    previewUrl,
    user,
    supabase,
  ]);

  // ── Delete post ────────────────────────────────────────────
  const handleDelete = useCallback(
    async (postId: string) => {
      const { error } = await (supabase as any)
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user?.id); // safety: only own posts

      if (error) {
        console.error("Delete error:", error.message);
        alert("Не удалось удалить пост.");
        return;
      }

      setPosts((prev) => prev.filter((p) => p.id !== postId));
    },
    [supabase, user?.id]
  );

  // ── Like toggle (local) ─────────────────────────────────────
  const handleLike = useCallback(
    (postId: string) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLikedByMe: !p.isLikedByMe,
                likesCount: p.isLikedByMe
                  ? p.likesCount - 1
                  : p.likesCount + 1,
              }
            : p
        )
      );
    },
    []
  );

  return (
    <div className="mx-auto w-full md:max-w-2xl">
      {/* ── Page header ───────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          🌐 Общая лента
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Будьте в курсе событий, делитесь опытом и вдохновляйте
          сообщество
        </p>
      </div>

      {/* ── Creation block ────────────────────────────────────── */}
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur">
        <textarea
          placeholder="Что у вас нового?"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-sm text-zinc-200 placeholder-zinc-600 backdrop-blur transition-colors focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
        />

        {/* ── Image preview ──────────────────────────────────── */}
        {previewUrl && (
          <div className="relative mt-3 overflow-hidden rounded-lg border border-zinc-800">
            <img
              src={previewUrl}
              alt="Предпросмотр"
              className="mx-auto max-h-[300px] w-full object-contain"
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900/80 text-xs text-zinc-400 backdrop-blur transition-colors hover:bg-red-900/60 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Controls ───────────────────────────────────────── */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Add photo button */}
            <button
              type="button"
              onClick={handleAddPhoto}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-[11px] font-medium text-zinc-400 transition-all hover:border-zinc-700 hover:text-zinc-200"
            >
              <span>📷</span>
              {selectedFile ? "Изменить фото" : "Добавить фото"}
            </button>

            {selectedFile && (
              <span className="text-[10px] text-zinc-600">
                {selectedFile.name}
              </span>
            )}
          </div>

          {/* Publish button */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={
              (!newPostContent.trim() && !selectedFile) ||
              publishing
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-900/30 transition-all hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {publishing ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Публикация...
              </>
            ) : (
              <>
                <span>🚀</span>
                Опубликовать
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Feed ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
            <p className="text-sm text-zinc-500">
              Загружаем ленту...
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <span className="text-5xl opacity-30">📭</span>
            <p className="text-sm text-zinc-500">
              В ленте пока нет записей. Будьте первым!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id ?? null}
              onLike={() => handleLike(post.id)}
              onDelete={() => handleDelete(post.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
