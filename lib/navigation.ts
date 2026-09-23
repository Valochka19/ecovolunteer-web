import type { Role } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export const ROLE_NAVIGATION: Record<Role, NavItem[]> = {
  volunteer: [
    { label: "Мероприятия", href: "/dashboard/events", icon: "🌿" },
    { label: "Древо Навыков", href: "/dashboard/skills", icon: "⚡" },
    { label: "Достижения", href: "/dashboard/achievements", icon: "🏆" }, // ДОБАВИЛИ СЮДА
    { label: "Организации", href: "/dashboard/organizations", icon: "🏢" },
    { label: "Общая лента", href: "/dashboard/global-feed", icon: "🌐" },
    { label: "Лента профиля", href: "/dashboard/feed", icon: "📰" },
    { label: "Магазин наград", href: "/dashboard/rewards-shop", icon: "🎁" },
    { label: "Задания", href: "/dashboard/tasks", icon: "✅" },
    { label: "Друзья", href: "/dashboard/friends", icon: "👥" },
  ],
  organization: [
    { label: "Мои мероприятия", href: "/dashboard/my-events", icon: "📅" },
    { label: "Общая лента", href: "/dashboard/global-feed", icon: "🌐" },
    { label: "Создать мероприятие", href: "/dashboard/create-event", icon: "➕" },
    { label: "Участники", href: "/dashboard/participants", icon: "👤" },
    { label: "Статистика", href: "/dashboard/stats", icon: "📊" },
  ],
  admin: [
    { label: "Модерация мероприятий", href: "/dashboard/moderation/events", icon: "🛡️" },
    { label: "Модерация организаций", href: "/dashboard/moderation/organizations", icon: "🏢" },
    { label: "Статистика платформы", href: "/dashboard/admin-stats", icon: "📊" },
    { label: "Настройка правил", href: "/dashboard/rules", icon: "⚙️" },
    { label: "Журнал операций ST", href: "/dashboard/st-ledger", icon: "📒" },
    { label: "Жалобы", href: "/dashboard/complaints", icon: "🚨" },
  ],
  partner: [
    { label: "Общая лента", href: "/dashboard/global-feed", icon: "🌐" },
    { label: "Мои предложения", href: "/dashboard/offers", icon: "🏷️" },
    { label: "Создать награду", href: "/dashboard/create-reward", icon: "✨" },
    { label: "Статистика выдачи", href: "/dashboard/distribution-stats", icon: "📈" },
  ],
};

export const ROLE_LABELS: Record<Role, string> = {
  volunteer: "Волонтёр",
  organization: "Организация",
  admin: "Администратор",
  partner: "Партнёр",
};