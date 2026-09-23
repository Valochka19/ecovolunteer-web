import type { Database } from "@/lib/supabase/types";

/** Raw row from the posts table (snake_case, Supabase-native). */
export type DbPostRow = Database["public"]["Tables"]["posts"]["Row"];

/** Returned shape when joining profiles: { profiles: { name, avatar, role } }. */
export interface DbPostWithProfile extends DbPostRow {
  profiles: {
    name: string;
    avatar: string;
    role: string;
  };
}

/**
 * Flattened post used in the UI after the Supabase query
 * has been mapped (camelCase, enriched with author info).
 */
export interface PostWithAuthor {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  authorName: string;
  authorAvatar: string | null;
  authorRole: string;
  // Local client-only state (not persisted to DB)
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
}
