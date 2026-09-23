export type Role = "volunteer" | "organization" | "admin" | "partner";

export type VerificationStatus = "pending" | "verified" | "rejected" | "none";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  city: string;
  interests: string[];
  role: Role;
  tokenBalance: number;
  verificationStatus: VerificationStatus;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type RegisterRole = Extract<Role, "volunteer" | "organization">;

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: RegisterRole;
  city?: string;
}

export type RewardCategory =
  | "discount"
  | "item"
  | "service"
  | "event"
  | "education";

export type RewardStatus = "available" | "out_of_stock";

export interface Reward {
  id: string;
  title: string;
  description: string;
  tokenCost: number;
  category: RewardCategory;
  itemsLeft: number;
  expirationDate: string;
  partnerName: string;
  requiresApproval: boolean;
  imageSrc: string;
  status: RewardStatus;
}
