export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          avatar: string;
          email: string;
          city: string;
          interests: string[] | null;
          role: "volunteer" | "organization" | "admin" | "partner";
          token_balance: number;
          verification_status: "pending" | "verified" | "rejected" | "none";
          bio: string;
          social_links: Json;
          privacy_hide_contacts: boolean;
          privacy_hide_feed: boolean;
          level: number;
          xp: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          avatar?: string;
          email?: string;
          city?: string;
          interests?: string[];
          role?: "volunteer" | "organization" | "admin" | "partner";
          token_balance?: number;
          verification_status?: "pending" | "verified" | "rejected" | "none";
          bio?: string;
          social_links?: Json;
          privacy_hide_contacts?: boolean;
          privacy_hide_feed?: boolean;
          level?: number;
          xp?: number;
        };
        Update: {
          id?: string;
          name?: string;
          avatar?: string;
          email?: string;
          city?: string;
          interests?: string[];
          role?: "volunteer" | "organization" | "admin" | "partner";
          token_balance?: number;
          verification_status?: "pending" | "verified" | "rejected" | "none";
          bio?: string;
          social_links?: Json;
          privacy_hide_contacts?: boolean;
          privacy_hide_feed?: boolean;
          level?: number;
          xp?: number;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          full_description: string;
          image: string;
          date: string;
          time: string;
          location: string;
          city: string;
          category: string;
          max_participants: number;
          reward: number;
          organizer_id: string;
          status: "open" | "closed" | "full";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          full_description?: string;
          image?: string;
          date: string;
          time?: string;
          location?: string;
          city?: string;
          category?: string;
          max_participants?: number;
          reward?: number;
          organizer_id: string;
          status?: "open" | "closed" | "full";
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          full_description?: string;
          image?: string;
          date?: string;
          time?: string;
          location?: string;
          city?: string;
          category?: string;
          max_participants?: number;
          reward?: number;
          organizer_id?: string;
          status?: "open" | "closed" | "full";
        };
      };
      posts: {
        Row: {
          id: string;
          content: string;
          image_url: string | null;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          content: string;
          image_url?: string | null;
          user_id: string;
        };
        Update: {
          id?: string;
          content?: string;
          image_url?: string | null;
          user_id?: string;
        };
      };
      friendships: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          status: "pending" | "accepted" | "rejected";
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          status?: "pending" | "accepted" | "rejected";
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          status?: "pending" | "accepted" | "rejected";
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          text: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          text?: string;
        };
      };
      event_participants: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          status: "registered" | "attended" | "cancelled";
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          status?: "registered" | "attended" | "cancelled";
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          status?: "registered" | "attended" | "cancelled";
        };
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          volunteer_id: string;
          status: "pending" | "accepted" | "rejected";
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          volunteer_id: string;
          status?: "pending" | "accepted" | "rejected";
        };
        Update: {
          id?: string;
          organization_id?: string;
          volunteer_id?: string;
          status?: "pending" | "accepted" | "rejected";
        };
      };
    };
    Views: {};
    Functions: {
      get_event_participant_count: {
        Args: { event_id: string };
        Returns: number;
      };
      cleanup_demo_data: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
    Enums: {};
  };
}

/** Structured social links stored in profile JSONB column */
export interface SocialLinks {
  website?: string;
  vk?: string;
  telegram?: string;
  whatsapp?: string;
  instagram?: string;
}

/** Full profile type synchronized with database schema */
export interface ProfileRow {
  id: string;
  name: string;
  avatar: string;
  email: string;
  city: string;
  interests: string[] | null;
  role: "volunteer" | "organization" | "admin" | "partner";
  token_balance: number;
  verification_status: "pending" | "verified" | "rejected" | "none";
  bio: string;
  social_links: SocialLinks;
  privacy_hide_contacts: boolean;
  privacy_hide_feed: boolean;
  level: number;
  xp: number;
  created_at: string;
  updated_at: string;
}

/** Flattened event type used in the UI after fetching from DB */
export interface EventDataUI {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  date: string;
  time: string;
  location: string;
  city: string;
  category: string;
  participants: number;
  maxParticipants: number;
  reward: number;
  organizerId: string;
  organizer: string;
  organizerAvatar: string;
  moderationMessage?: string;
  status: "moderation" | "open" | "closed" | "full" | "rejected";
}
