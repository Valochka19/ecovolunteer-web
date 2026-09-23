'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';

// ───────────────────────────────────────
// Types
// ───────────────────────────────────────
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'events' | 'eco' | 'rescue' | 'shop';
  tokenReward: number;
  // Glow color config
  glowColor: string;
  borderColor: string;
  bgGradient: string;
  badgeColor: string;
}

interface ToastMessage {
  id: number;
  achievementName: string;
  icon: string;
  tokenReward: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  emoji: string;
}

// ───────────────────────────────────────
// Data: Achievements
// ───────────────────────────────────────
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-blood',
    name: 'Первая Кровь',
    description: 'За первую запись на ивент',
    icon: '🩸',
    rarity: 'common',
    category: 'events',
    tokenReward: 50,
    glowColor: 'rgba(255, 51, 51, 0.8)',
    borderColor: '#ff4444',
    bgGradient: 'from-red-950/60 via-red-900/30 to-red-950/60',
    badgeColor: 'text-red-400',
  },
  {
    id: 'five-events',
    name: 'Завсегдатай',
    description: 'Посетил 5 мероприятий',
    icon: '🎫',
    rarity: 'rare',
    category: 'events',
    tokenReward: 100,
    glowColor: 'rgba(168, 85, 247, 0.8)',
    borderColor: '#a855f7',
    bgGradient: 'from-purple-950/60 via-purple-900/30 to-purple-950/60',
    badgeColor: 'text-purple-400',
  },
  {
    id: 'eco-ranger',
    name: 'Эко-Рейнджер',
    description: 'За участие в субботниках',
    icon: '🌳',
    rarity: 'rare',
    category: 'eco',
    tokenReward: 120,
    glowColor: 'rgba(0, 255, 136, 0.8)',
    borderColor: '#00ff88',
    bgGradient: 'from-emerald-950/60 via-emerald-900/30 to-emerald-950/60',
    badgeColor: 'text-emerald-400',
  },
  {
    id: 'forest-guardian',
    name: 'Хранитель Леса',
    description: 'Организовал эко-акцию',
    icon: '🌍',
    rarity: 'epic',
    category: 'eco',
    tokenReward: 250,
    glowColor: 'rgba(52, 211, 153, 0.9)',
    borderColor: '#34d399',
    bgGradient: 'from-teal-950/60 via-teal-900/30 to-teal-950/60',
    badgeColor: 'text-teal-300',
  },
  {
    id: 'absolute-savior',
    name: 'Абсолютный Спаситель',
    description: 'Сверх-редкое достижение',
    icon: '👑',
    rarity: 'legendary',
    category: 'rescue',
    tokenReward: 500,
    glowColor: 'rgba(255, 200, 0, 1)',
    borderColor: '#ffc800',
    bgGradient: 'from-amber-950/60 via-amber-900/40 to-amber-950/60',
    badgeColor: 'text-amber-300',
  },
  {
    id: 'life-saver',
    name: 'Спасатель Жизней',
    description: 'Помощь в экстренной ситуации',
    icon: '🛟',
    rarity: 'epic',
    category: 'rescue',
    tokenReward: 300,
    glowColor: 'rgba(255, 99, 132, 0.9)',
    borderColor: '#ff6384',
    bgGradient: 'from-rose-950/60 via-rose-900/30 to-rose-950/60',
    badgeColor: 'text-rose-400',
  },
  {
    id: 'token-patron',
    name: 'Меценат Токенов',
    description: 'За траты в магазине',
    icon: '💎',
    rarity: 'rare',
    category: 'shop',
    tokenReward: 150,
    glowColor: 'rgba(0, 170, 255, 0.8)',
    borderColor: '#00aaff',
    bgGradient: 'from-sky-950/60 via-sky-900/30 to-sky-950/60',
    badgeColor: 'text-sky-400',
  },
  {
    id: 'whale',
    name: 'Кит Платформы',
    description: 'Топ-1 покупатель месяца',
    icon: '🐋',
    rarity: 'legendary',
    category: 'shop',
    tokenReward: 750,
    glowColor: 'rgba(0, 255, 255, 1)',
    borderColor: '#00ffff',
    bgGradient: 'from-cyan-950/60 via-cyan-900/40 to-cyan-950/60',
    badgeColor: 'text-cyan-300',
  },
  {
    id: 'mentor',
    name: 'Наставник',
    description: 'Обучил 3 новичков',
    icon: '🎓',
    rarity: 'epic',
    category: 'events',
    tokenReward: 200,
    glowColor: 'rgba(245, 158, 11, 0.9)',
    borderColor: '#f59e0b',
    bgGradient: 'from-orange-950/60 via-orange-900/30 to-orange-950/60',
    badgeColor: 'text-orange-400',
  },
  {
    id: 'veteran',
    name: 'Ветеран',
    description: 'Активен более 365 дней',
    icon: '⏳',
    rarity: 'epic',
    category: 'events',
    tokenReward: 350,
    glowColor: 'rgba(163, 163, 163, 0.9)',
    borderColor: '#a3a3a3',
    bgGradient: 'from-neutral-950/60 via-neutral-900/30 to-neutral-950/60',
    badgeColor: 'text-neutral-300',
  },
  {
    id: 'blood-donor',
    name: 'Донор Крови',
    description: 'Сдал кровь 3 раза',
    icon: '💉',
    rarity: 'rare',
    category: 'rescue',
    tokenReward: 180,
    glowColor: 'rgba(255, 82, 82, 0.85)',
    borderColor: '#ff5252',
    bgGradient: 'from-red-950/50 via-red-900/25 to-red-950/50',
    badgeColor: 'text-red-300',
  },
  {
    id: 'night-owl',
    name: 'Ночная Сова',
    description: 'Участвовал в ночном рейде',
    icon: '🦉',
    rarity: 'common',
    category: 'events',
    tokenReward: 60,
    glowColor: 'rgba(99, 102, 241, 0.7)',
    borderColor: '#6366f1',
    bgGradient: 'from-indigo-950/60 via-indigo-900/30 to-indigo-950/60',
    badgeColor: 'text-indigo-400',
  },
];

// ───────────────────────────────────────
// Rarity config for visual flair
// ───────────────────────────────────────
const RARITY_LABELS: Record<string, { label: string; textColor: string; bgColor: string }> = {
  common: { label: 'Обычный', textColor: 'text-gray-400', bgColor: 'bg-gray-500/20' },
  rare: { label: 'Редкий', textColor: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  epic: { label: 'Эпический', textColor: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  legendary: { label: 'Легендарный', textColor: 'text-amber-400', bgColor: 'bg-amber-500/20' },
};

const CATEGORY_TABS = [
  { key: 'all', label: 'Все', icon: '🏆' },
  { key: 'events', label: 'Ивенты', icon: '🎪' },
  { key: 'eco', label: 'Эко', icon: '🌿' },
  { key: 'rescue', label: 'Спасение', icon: '🛡️' },
  { key: 'shop', label: 'Магазин', icon: '💎' },
] as const;

// ───────────────────────────────────────
// Sub-components
// ───────────────────────────────────────

/** Toast notification that slides in from top */
function ToastItem({
  toast,
  onDone,
}: {
  toast: ToastMessage;
  onDone: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDone(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDone]);

  return (
    <div
      className="animate-toast-in pointer-events-auto flex items-center gap-4 rounded-2xl px-6 py-4 backdrop-blur-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(16,16,30,0.95), rgba(30,30,50,0.9))',
        border: '1px solid rgba(255,200,0,0.4)',
        boxShadow:
          '0 0 30px rgba(255,180,0,0.3), 0 0 80px rgba(255,150,0,0.15), 0 10px 40px rgba(0,0,0,0.6)',
      }}
    >
      {/* Animated icon */}
      <div className="relative flex-shrink-0">
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(255,200,0,0.5), transparent)',
            animationDuration: '1.5s',
          }}
        />
        <span className="relative text-4xl drop-shadow-[0_0_15px_rgba(255,200,0,0.8)]">
          {toast.icon}
        </span>
      </div>

      {/* Text */}
      <div className="flex flex-col min-w-0">
        <span className="text-xs uppercase tracking-[0.3em] text-amber-400/80 font-bold">
          ⚡ Достижение открыто!
        </span>
        <span className="text-lg font-black text-white truncate max-w-[220px]">
          {toast.achievementName}
        </span>
      </div>

      {/* Token reward */}
      <div className="flex-shrink-0 flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1.5 border border-amber-500/30">
        <span className="text-sm">💎</span>
        <span className="text-amber-300 font-black text-lg animate-count-up">
          +{toast.tokenReward}
        </span>
      </div>
    </div>
  );
}

/** Particle burst when unlocking */
function UnlockParticles({
  achievement,
  onDone,
}: {
  achievement: Achievement;
  onDone: () => void;
}) {
  const [particles] = useState<Particle[]>(() => {
    const emojis = ['✨', '💫', '⚡', '🌟', '🔥', '💥', '🎉', achievement.icon];
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 30,
      y: 50 + (Math.random() - 0.5) * 30,
      color: achievement.borderColor,
      size: 0.8 + Math.random() * 1.8,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));
  });

  useEffect(() => {
    const timer = setTimeout(onDone, 800);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden rounded-3xl">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-particle-burst"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}rem`,
            opacity: 0,
            animationDelay: `${Math.random() * 150}ms`,
            animationDuration: `${600 + Math.random() * 400}ms`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}

// ───────────────────────────────────────
// Main Page Component
// ───────────────────────────────────────
export default function AchievementsPage() {
  // State
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [tokenBalance, setTokenBalance] = useState(420);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showBalanceGlow, setShowBalanceGlow] = useState(false);
  const toastIdRef = useRef(0);

  // Filtered achievements
  const filteredAchievements =
    selectedCategory === 'all'
      ? ACHIEVEMENTS
      : ACHIEVEMENTS.filter((a) => a.category === selectedCategory);

  // Counts per category
  const categoryCounts = CATEGORY_TABS.map((tab) => {
    if (tab.key === 'all') return ACHIEVEMENTS.length;
    return ACHIEVEMENTS.filter((a) => a.category === tab.key).length;
  });

  const unlockedCount = unlockedIds.size;
  const totalCount = ACHIEVEMENTS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  // Handle unlock
  const handleUnlock = useCallback(
    (achievement: Achievement) => {
      if (unlockedIds.has(achievement.id)) return;

      // Trigger unlock animation
      setUnlockingId(achievement.id);

      // Add to unlocked set after brief delay
      setTimeout(() => {
        setUnlockedIds((prev) => {
          const next = new Set(prev);
          next.add(achievement.id);
          return next;
        });
      }, 300);

      // Add tokens
      setTokenBalance((prev) => prev + achievement.tokenReward);
      setShowBalanceGlow(true);
      setTimeout(() => setShowBalanceGlow(false), 1200);

      // Add toast
      toastIdRef.current += 1;
      const newToast: ToastMessage = {
        id: toastIdRef.current,
        achievementName: achievement.name,
        icon: achievement.icon,
        tokenReward: achievement.tokenReward,
      };
      setToasts((prev) => [...prev, newToast]);

      // Play unlock sound
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const playTone = (freq: number, delay: number, dur: number, vol = 0.06) => {
          setTimeout(() => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(vol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + dur);
          }, delay);
        };
        playTone(660, 0, 0.12);
        playTone(880, 80, 0.1);
        playTone(1100, 150, 0.15, 0.07);
      } catch {
        // Audio not supported
      }

      // Clear unlocking animation
      setTimeout(() => setUnlockingId(null), 850);
    },
    [unlockedIds],
  );

  // Remove toast
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="relative min-h-screen bg-[#06060e] text-white overflow-hidden selection:bg-amber-500/30">
      {/* ── Animated Background ── */}
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'gridDrift 25s linear infinite',
        }}
      />

      {/* Ambient glow orbs */}
      <div
        className="absolute top-20 -left-20 w-[400px] h-[400px] rounded-full pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'orbFloat 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-10 right-10 w-[350px] h-[350px] rounded-full pointer-events-none opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(0,255,136,0.4) 0%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'orbFloat 10s ease-in-out infinite alternate',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(255,180,0,0.3) 0%, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'orbFloat 12s ease-in-out infinite alternate-reverse',
        }}
      />

      {/* ── Toast Container (top-center) ── */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 pointer-events-none items-center">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDone={removeToast} />
        ))}
      </div>

      {/* ── Header ── */}
      <header className="relative z-30">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 px-6 pt-6 pb-2 md:px-10 md:pt-8">
          {/* Title block */}
          <div>
            <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-white/30 font-light mb-1">
              Галерея Славы
            </p>
            <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,180,0,0.4)]">
              Достижения
            </h1>
            <p className="text-sm text-white/40 mt-1 max-w-md">
              Разблокируйте трофеи за активность на платформе
            </p>
          </div>

          {/* Stats cards */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Progress ring */}
            <div className="hidden sm:flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3 border border-white/5 backdrop-blur-sm">
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke="url(#header-progress-grad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={`${(progressPercent / 100) * 150.8} 150.8`}
                    style={{ transition: 'stroke-dasharray 0.7s ease-out' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-black">
                  {progressPercent}%
                </span>
                <svg width="0" height="0" aria-hidden="true">
                  <defs>
                    <linearGradient id="header-progress-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-white/40 uppercase tracking-wider">Открыто</span>
                <span className="text-xl font-black">
                  <span className="text-amber-400">{unlockedCount}</span>
                  <span className="text-white/30">/{totalCount}</span>
                </span>
              </div>
            </div>

            {/* Token balance */}
            <div
              className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 transition-all duration-500 border ${
                showBalanceGlow
                  ? 'scale-110 border-amber-500/60 bg-amber-500/10 shadow-[0_0_40px_rgba(255,180,0,0.5)]'
                  : 'border-white/10 bg-white/5 shadow-none'
              }`}
            >
              <span className="text-2xl">💎</span>
              <div className="flex flex-col">
                <span className="text-xs text-white/40 uppercase tracking-wider">Токены</span>
                <span
                  className={`text-2xl font-black tabular-nums transition-colors duration-500 ${
                    showBalanceGlow ? 'text-amber-300' : 'text-white'
                  }`}
                >
                  {tokenBalance}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="px-6 md:px-10 mt-4 flex flex-wrap gap-2">
          {CATEGORY_TABS.map((tab, idx) => (
            <button
              key={tab.key}
              onClick={() => setSelectedCategory(tab.key)}
              className={`group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 border ${
                selectedCategory === tab.key
                  ? 'bg-white/10 border-white/20 text-white shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                  : 'bg-transparent border-white/5 text-white/40 hover:text-white/70 hover:border-white/15 hover:bg-white/5'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`text-xs rounded-full px-2 py-0.5 ${
                  selectedCategory === tab.key
                    ? 'bg-white/20 text-white/80'
                    : 'bg-white/5 text-white/30'
                }`}
              >
                {categoryCounts[idx]}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* ── Trophy Grid ── */}
      <main className="relative z-20 px-4 sm:px-6 md:px-10 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5">
          {filteredAchievements.map((achievement) => {
            const isUnlocked = unlockedIds.has(achievement.id);
            const isUnlocking = unlockingId === achievement.id;
            const rarity = RARITY_LABELS[achievement.rarity];

            return (
              <div
                key={achievement.id}
                className={`group relative rounded-3xl transition-all duration-500 ease-out ${
                  isUnlocking ? 'z-40 scale-110' : 'z-10 hover:z-20'
                } ${isUnlocked ? '' : 'opacity-90'}`}
                style={{
                  background: isUnlocked
                    ? `linear-gradient(160deg, rgba(20,20,35,0.95), rgba(10,10,20,0.98))`
                    : `linear-gradient(160deg, rgba(25,25,35,0.7), rgba(15,15,25,0.6))`,
                  border: isUnlocked
                    ? `1.5px solid ${achievement.borderColor}40`
                    : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: isUnlocked
                    ? `0 0 25px ${achievement.glowColor.replace('0.8', '0.3').replace('0.9', '0.35').replace('1', '0.4')}, 0 0 60px ${achievement.glowColor.replace('0.8', '0.12').replace('0.9', '0.15').replace('1', '0.18')}, 0 8px 32px rgba(0,0,0,0.5)`
                    : '0 4px 20px rgba(0,0,0,0.4)',
                }}
              >
                {/* Unlock particles */}
                {isUnlocking && (
                  <UnlockParticles
                    achievement={achievement}
                    onDone={() => setUnlockingId(null)}
                  />
                )}

                {/* Card inner glow for unlocked */}
                {isUnlocked && (
                  <div
                    className="absolute inset-0 rounded-3xl pointer-events-none animate-pulse"
                    style={{
                      background: `radial-gradient(ellipse at 50% 30%, ${achievement.glowColor.replace('0.8', '0.12').replace('0.9', '0.14').replace('1', '0.18')} 0%, transparent 60%)`,
                      animationDuration: '2.5s',
                    }}
                  />
                )}

                {/* Card content */}
                <div className="relative flex flex-col items-center gap-3 p-5 md:p-6">
                  {/* Rarity badge */}
                  <div
                    className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 ${rarity.bgColor} ${rarity.textColor} border border-current/20`}
                  >
                    {rarity.label}
                  </div>

                  {/* Icon container */}
                  <div
                    className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      isUnlocked
                        ? 'scale-100'
                        : isUnlocking
                          ? 'scale-125'
                          : 'scale-90'
                    }`}
                    style={{
                      background: isUnlocked
                        ? `linear-gradient(135deg, ${achievement.borderColor}20, ${achievement.borderColor}08)`
                        : 'rgba(255,255,255,0.03)',
                      border: isUnlocked
                        ? `2px solid ${achievement.borderColor}60`
                        : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: isUnlocked
                        ? `0 0 45px ${achievement.glowColor.replace('0.8', '0.5').replace('0.9', '0.55').replace('1', '0.6')}, inset 0 0 30px ${achievement.borderColor}15`
                        : 'none',
                    }}
                  >
                    {/* Glowing ring for unlocked */}
                    {isUnlocked && (
                      <div
                        className="absolute inset-0 rounded-2xl animate-spin-slow pointer-events-none"
                        style={{
                          background: `conic-gradient(from 0deg, transparent 40%, ${achievement.borderColor}40 50%, transparent 60%)`,
                          mask: 'radial-gradient(circle, transparent 58%, black 60%)',
                          WebkitMask: 'radial-gradient(circle, transparent 58%, black 60%)',
                        }}
                      />
                    )}

                    {/* Icon */}
                    <span
                      className={`relative text-4xl md:text-5xl transition-all duration-500 ${
                        isUnlocked
                          ? 'drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]'
                          : 'grayscale opacity-40'
                      } ${isUnlocking ? 'animate-icon-bounce' : ''}`}
                      style={{
                        filter: isUnlocked ? 'none' : 'grayscale(1) brightness(0.5)',
                      }}
                    >
                      {achievement.icon}
                    </span>

                    {/* Lock overlay for locked */}
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 backdrop-blur-[1px]">
                        <span className="text-2xl opacity-70 drop-shadow-lg">🔒</span>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h3
                    className={`text-sm md:text-base font-bold text-center leading-tight transition-colors duration-500 ${
                      isUnlocked ? achievement.badgeColor : 'text-white/25'
                    }`}
                  >
                    {achievement.name}
                  </h3>

                  {/* Description */}
                  <p className="text-[11px] md:text-xs text-white/25 text-center leading-relaxed max-w-[160px]">
                    {achievement.description}
                  </p>

                  {/* Token reward preview */}
                  <div className="flex items-center gap-1 text-xs text-white/20">
                    <span>💎</span>
                    <span>{achievement.tokenReward}</span>
                  </div>

                  {/* Unlock button (only for locked) */}
                  {!isUnlocked && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnlock(achievement);
                      }}
                      className="mt-1 relative overflow-hidden rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 border border-amber-500/20 text-amber-400/70 hover:text-amber-300 hover:border-amber-500/50 hover:bg-amber-500/10 active:scale-95"
                    >
                      <span className="relative z-10 flex items-center gap-1.5">
                        🔓 Разблокировать
                        <span className="text-[10px] text-amber-500/50">(Демо)</span>
                      </span>
                      {/* Hover shimmer */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />
                    </button>
                  )}

                  {/* Unlocked indicator */}
                  {isUnlocked && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400/80 font-semibold">
                      <span>✅</span>
                      <span>Получено</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredAchievements.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-white/20">
            <span className="text-6xl mb-4">🏆</span>
            <p className="text-lg">Нет достижений в этой категории</p>
          </div>
        )}
      </main>

      {/* Bottom hint */}
      <div className="relative z-20 text-center pb-8 text-white/15 text-xs tracking-wider">
        Нажмите &quot;Разблокировать (Демо)&quot; чтобы увидеть анимацию открытия трофея
      </div>

      {/* ── Global Animations ── */}
      <style jsx global>{`
        @keyframes gridDrift {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }

        @keyframes orbFloat {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(30px, -20px) scale(1.15);
          }
          50% {
            transform: translate(-10px, 15px) scale(0.9);
          }
          75% {
            transform: translate(-25px, -10px) scale(1.1);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }

        @keyframes toast-in {
          0% {
            opacity: 0;
            transform: translateY(-60px) scale(0.85);
          }
          40% {
            transform: translateY(8px) scale(1.03);
          }
          70% {
            transform: translateY(-3px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-toast-in {
          animation: toast-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes particle-burst {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.2) rotate(0deg);
          }
          15% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx, 30px), var(--ty, -60px)) scale(1.8) rotate(var(--rot, 180deg));
          }
        }
        .animate-particle-burst {
          --tx: ${Math.random() > 0.5 ? '' : '-'}${Math.floor(Math.random() * 80 + 20)}px;
          --ty: ${Math.random() > 0.5 ? '' : '-'}${Math.floor(Math.random() * 80 + 20)}px;
          --rot: ${Math.floor(Math.random() * 360)}deg;
          animation: particle-burst 0.8s ease-out forwards;
        }

        @keyframes icon-bounce {
          0%,
          100% {
            transform: scale(1);
          }
          20% {
            transform: scale(1.4) rotate(10deg);
          }
          40% {
            transform: scale(0.9) rotate(-5deg);
          }
          60% {
            transform: scale(1.15) rotate(3deg);
          }
          80% {
            transform: scale(0.95) rotate(-2deg);
          }
        }
        .animate-icon-bounce {
          animation: icon-bounce 0.7s ease-out;
        }

        @keyframes count-up {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-count-up {
          animation: count-up 0.5s ease-out forwards;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }
      `}</style>
    </div>
  );
}