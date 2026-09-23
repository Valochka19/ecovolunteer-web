'use client';

{/* Live indicator */}
<div className="flex items-center gap-3 self-start md:self-auto">
  <span className="text-xs text-white/20 font-mono">
    {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
  </span>
</div>

import React, { useState, useEffect, useCallback, useMemo } from 'react';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
interface MetricCard {
  id: string;
  title: string;
  value: number;
  prefix: string;
  suffix: string;
  icon: string;
  badge: string;
  badgeColor: string;
  glowColor: string;
  accentColor: string;
}

interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
}

interface CategorySlice {
  id: string;
  label: string;
  value: number;
  color: string;
  icon: string;
}

interface LogEntry {
  id: number;
  user: string;
  action: string;
  amount: number;
  currency: string;
  reason: string;
  time: string;
  type: 'credit' | 'debit';
}

// ──────────────────────────────────────────────────────────
// Demo Data
// ──────────────────────────────────────────────────────────

const DAY_DATA: ChartDataPoint[] = [
  { label: '00:00', value: 12, color: '#a855f7' },
  { label: '04:00', value: 5, color: '#a855f7' },
  { label: '08:00', value: 28, color: '#a855f7' },
  { label: '12:00', value: 55, color: '#a855f7' },
  { label: '16:00', value: 72, color: '#a855f7' },
  { label: '20:00', value: 48, color: '#a855f7' },
  { label: '23:59', value: 19, color: '#a855f7' },
];

const WEEK_DATA: ChartDataPoint[] = [
  { label: 'Пн', value: 145, color: '#00aaff' },
  { label: 'Вт', value: 210, color: '#00aaff' },
  { label: 'Ср', value: 188, color: '#00aaff' },
  { label: 'Чт', value: 260, color: '#00aaff' },
  { label: 'Пт', value: 320, color: '#00aaff' },
  { label: 'Сб', value: 175, color: '#00aaff' },
  { label: 'Вс', value: 98, color: '#00aaff' },
];

const MONTH_DATA: ChartDataPoint[] = [
  { label: '1 нед', value: 890, color: '#00ff88' },
  { label: '2 нед', value: 1020, color: '#00ff88' },
  { label: '3 нед', value: 1150, color: '#00ff88' },
  { label: '4 нед', value: 1280, color: '#00ff88' },
];

const CATEGORY_SLICES: CategorySlice[] = [
  { id: 'eco', label: 'Экология', value: 35, color: '#00ff88', icon: '🌿' },
  { id: 'media', label: 'Медиа', value: 25, color: '#00aaff', icon: '📱' },
  { id: 'social', label: 'Социалка', value: 22, color: '#f59e0b', icon: '🤝' },
  { id: 'rescue', label: 'Спасение', value: 18, color: '#ff3366', icon: '🛡️' },
];

const LOG_ENTRIES: LogEntry[] = [
  { id: 1, user: 'Роман И.', action: 'получил', amount: 20, currency: 'ST', reason: 'Верификация телефона', time: '2 мин назад', type: 'credit' },
  { id: 2, user: 'Влад М.', action: 'обменял', amount: 80, currency: 'ST', reason: 'Худи "Эко-патруль"', time: '7 мин назад', type: 'debit' },
  { id: 3, user: 'Анна К.', action: 'получила', amount: 50, currency: 'ST', reason: 'Участие в субботнике', time: '12 мин назад', type: 'credit' },
  { id: 4, user: 'Дмитрий С.', action: 'перевел', amount: 100, currency: 'ST', reason: 'Благотворительность', time: '18 мин назад', type: 'debit' },
  { id: 5, user: 'Елена В.', action: 'получила', amount: 30, currency: 'ST', reason: 'Запись на ивент', time: '24 мин назад', type: 'credit' },
  { id: 6, user: 'Максим П.', action: 'заработал', amount: 200, currency: 'ST', reason: 'Организация эко-рейда', time: '31 мин назад', type: 'credit' },
  { id: 7, user: 'Ольга Т.', action: 'обменяла', amount: 45, currency: 'ST', reason: 'Скидка на мерч', time: '38 мин назад', type: 'debit' },
  { id: 8, user: 'Сергей Л.', action: 'получил', amount: 15, currency: 'ST', reason: 'Реферал друга', time: '45 мин назад', type: 'credit' },
  { id: 9, user: 'Кира Н.', action: 'обменяла', amount: 120, currency: 'ST', reason: 'Эко-бутылка', time: '52 мин назад', type: 'debit' },
  { id: 10, user: 'Игорь З.', action: 'получил', amount: 75, currency: 'ST', reason: 'Донорство крови', time: '1 час назад', type: 'credit' },
];

// ──────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────

/** Animated counter that counts up to target */
function AnimatedCounter({
  value,
  duration = 1200,
  prefix = '',
  suffix = '',
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }
    const startTime = performance.now();
    let rafId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {prefix}
      {display.toLocaleString('ru-RU')}
      {suffix}
    </span>
  );
}

/** Single metric card */
function MetricCardEl({ card }: { card: MetricCard }) {
  return (
    <div
      className="group relative rounded-2xl p-5 md:p-6 transition-all duration-500 hover:scale-[1.02] overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(20,20,35,0.9), rgba(12,12,24,0.95))',
        border: `1px solid ${card.accentColor}20`,
        boxShadow: `0 0 25px ${card.glowColor}08, 0 8px 32px rgba(0,0,0,0.4)`,
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${card.glowColor}10 0%, transparent 60%)`,
        }}
      />

      {/* Corner glow dot */}
      <div
        className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${card.glowColor}40, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.2em] text-white/35 font-medium">
            {card.title}
          </span>
          <span className="text-xl">{card.icon}</span>
        </div>

        {/* Value */}
        <div className="text-3xl md:text-4xl font-black text-white tracking-tight">
          <AnimatedCounter
            value={card.value}
            prefix={card.prefix}
            suffix={card.suffix}
          />
        </div>

        {/* Badge */}
        <div
          className={`inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-xs font-semibold border ${card.badgeColor}`}
          style={{
            backgroundColor: `${card.accentColor}10`,
            borderColor: `${card.accentColor}30`,
          }}
        >
          {card.badgeColor.includes('green') && (
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                style={{ backgroundColor: card.accentColor }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ backgroundColor: card.accentColor }}
              />
            </span>
          )}
          {card.badgeColor.includes('orange') && (
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full rounded-full animate-pulse"
                style={{
                  backgroundColor: card.accentColor,
                  animationDuration: '1.2s',
                }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ backgroundColor: card.accentColor }}
              />
            </span>
          )}
          <span>{card.badge}</span>
        </div>
      </div>
    </div>
  );
}

/** Bar chart with animated column heights */
function BarChart({
  data,
  maxValue,
  barColor,
}: {
  data: ChartDataPoint[];
  maxValue: number;
  barColor: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, [data]);

  return (
    <div className="flex items-end justify-between gap-1 md:gap-2 h-52 md:h-64 px-1">
      {data.map((point, idx) => {
        const heightPercent = (point.value / maxValue) * 100;
        return (
          <div
            key={idx}
            className="flex-1 flex flex-col items-center gap-2 min-w-0"
          >
            {/* Value label */}
            <span className="text-[10px] md:text-xs text-white/40 font-mono tabular-nums">
              {point.value}
            </span>

            {/* Bar */}
            <div className="w-full flex-1 flex items-end rounded-lg overflow-hidden bg-white/[0.02] relative">
              <div
                className="w-full rounded-lg transition-all duration-700 ease-out relative"
                style={{
                  height: mounted ? `${heightPercent}%` : '0%',
                  background: `linear-gradient(180deg, ${barColor}dd 0%, ${barColor}44 100%)`,
                  boxShadow: `0 0 20px ${barColor}30, 0 0 40px ${barColor}10, inset 0 0 15px ${barColor}15`,
                  transitionDelay: `${idx * 60}ms`,
                }}
              >
                {/* Shine on top of bar */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1 rounded-full"
                  style={{ backgroundColor: `${barColor}cc`, filter: 'blur(2px)' }}
                />
                {/* Inner gradient shimmer */}
                <div
                  className="absolute inset-0 rounded-lg opacity-40"
                  style={{
                    background: `linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.1) 40%, transparent 100%)`,
                  }}
                />
              </div>
            </div>

            {/* Label */}
            <span className="text-[10px] md:text-xs text-white/25 font-medium whitespace-nowrap">
              {point.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Donut / Ring chart for categories */
function DonutChart({
  slices,
  size = 200,
}: {
  slices: CategorySlice[];
  size?: number;
}) {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const total = useMemo(() => slices.reduce((sum, s) => sum + s.value, 0), [slices]);
  const radius = size * 0.35;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativeOffset = 0;

  const arcData = slices.map((slice) => {
    const dashLength = (slice.value / total) * circumference;
    const startOffset = cumulativeOffset;
    cumulativeOffset += dashLength;
    return {
      ...slice,
      dashLength: mounted ? dashLength : 0,
      dashOffset: circumference - startOffset,
      percent: Math.round((slice.value / total) * 100),
    };
  });

  return (
    <div className="relative flex flex-col items-center gap-4">
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3">
        {slices.map((slice) => (
          <button
            key={slice.id}
            onMouseEnter={() => setHoveredSlice(slice.id)}
            onMouseLeave={() => setHoveredSlice(null)}
            className="flex items-center gap-2 text-xs font-medium transition-all duration-300 px-3 py-1.5 rounded-full border border-white/5 hover:bg-white/5"
            style={{
              color:
                hoveredSlice === slice.id
                  ? slice.color
                  : hoveredSlice === null
                    ? 'rgba(255,255,255,0.6)'
                    : 'rgba(255,255,255,0.25)',
              borderColor:
                hoveredSlice === slice.id
                  ? `${slice.color}40`
                  : 'rgba(255,255,255,0.06)',
              boxShadow:
                hoveredSlice === slice.id
                  ? `0 0 15px ${slice.color}25`
                  : 'none',
            }}
          >
            <span>{slice.icon}</span>
            <span>{slice.label}</span>
            <span className="text-white/30 font-mono">
              {arcData.find((a) => a.id === slice.id)?.percent}%
            </span>
          </button>
        ))}
      </div>

      {/* SVG Chart */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 drop-shadow-[0_0_30px_rgba(168,85,247,0.15)]"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth={size * 0.12}
          />

          {/* Data arcs */}
          {arcData.map((arc) => {
            const isHovered = hoveredSlice === arc.id;
            const isDimmed = hoveredSlice !== null && hoveredSlice !== arc.id;
            return (
              <circle
                key={arc.id}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={isHovered ? size * 0.16 : size * 0.12}
                strokeLinecap="round"
                strokeDasharray={`${arc.dashLength} ${circumference - arc.dashLength}`}
                strokeDashoffset={arc.dashOffset}
                style={{
                  transition:
                    'stroke-width 0.4s ease, stroke-dasharray 0.9s ease-out, opacity 0.4s ease',
                  opacity: isDimmed ? 0.25 : 1,
                  filter: isHovered
                    ? `drop-shadow(0 0 12px ${arc.color}80) drop-shadow(0 0 24px ${arc.color}40)`
                    : 'none',
                }}
              />
            );
          })}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl md:text-4xl font-black text-white">
            {total}
          </span>
          <span className="text-[10px] text-white/30 uppercase tracking-widest">
            ивентов
          </span>
        </div>

        {/* Tooltip on hover */}
        {hoveredSlice && (
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full mt-2 pointer-events-none"
            style={{ color: slices.find((s) => s.id === hoveredSlice)?.color }}
          >
            <span className="text-sm font-bold whitespace-nowrap">
              {slices.find((s) => s.id === hoveredSlice)?.icon}{' '}
              {slices.find((s) => s.id === hoveredSlice)?.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Token log table row */
function LogRow({ entry }: { entry: LogEntry }) {
  return (
    <div
      className="group flex items-center gap-3 px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors duration-200 rounded-lg"
    >
      {/* Avatar placeholder */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
        style={{
          background: entry.type === 'credit' ? 'rgba(0,255,136,0.1)' : 'rgba(255,51,102,0.1)',
          color: entry.type === 'credit' ? '#00ff88' : '#ff3366',
          border: `1px solid ${entry.type === 'credit' ? '#00ff8840' : '#ff336640'}`,
        }}
      >
        {entry.user.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-semibold text-white/90 truncate">{entry.user}</span>
          <span className="text-white/35 text-xs">{entry.action}</span>
        </div>
        <p className="text-xs text-white/25 truncate">{entry.reason}</p>
      </div>

      {/* Amount */}
      <div className="flex-shrink-0 text-right">
        <span
          className={`text-sm font-black tabular-nums ${
            entry.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {entry.type === 'credit' ? '+' : '-'}
          {entry.amount} {entry.currency}
        </span>
        <p className="text-[10px] text-white/20 text-right">{entry.time}</p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Main Page Component
// ──────────────────────────────────────────────────────────
export default function AdminStatsPage() {
  const [chartMode, setChartMode] = useState<'day' | 'week' | 'month'>('week');
  const [animateCharts, setAnimateCharts] = useState(true);

  // Re-trigger bar animation on mode switch
  useEffect(() => {
    setAnimateCharts(false);
    const timer = setTimeout(() => setAnimateCharts(true), 50);
    return () => clearTimeout(timer);
  }, [chartMode]);

  const chartData =
    chartMode === 'day'
      ? DAY_DATA
      : chartMode === 'week'
        ? WEEK_DATA
        : MONTH_DATA;

  const chartBarColor =
    chartMode === 'day'
      ? '#a855f7'
      : chartMode === 'week'
        ? '#00aaff'
        : '#00ff88';

  const chartMaxValue = Math.max(...chartData.map((d) => d.value)) * 1.2;

  const metrics: MetricCard[] = [
    {
      id: 'total-events',
      title: 'Всего мероприятий',
      value: 142,
      prefix: '',
      suffix: '',
      icon: '📅',
      badge: '+12% за неделю',
      badgeColor: 'text-emerald-400',
      glowColor: 'rgba(0,255,136,0.3)',
      accentColor: '#00ff88',
    },
    {
      id: 'active-volunteers',
      title: 'Активные волонтёры',
      value: 1280,
      prefix: '',
      suffix: '',
      icon: '👥',
      badge: 'Online',
      badgeColor: 'text-emerald-400 border-emerald-500/40',
      glowColor: 'rgba(0,255,136,0.3)',
      accentColor: '#00ff88',
    },
    {
      id: 'tokens-circulation',
      title: 'Токенов в обороте',
      value: 45200,
      prefix: '',
      suffix: ' ST',
      icon: '💎',
      badge: 'Эмиссия стабильна',
      badgeColor: 'text-sky-400',
      glowColor: 'rgba(0,170,255,0.3)',
      accentColor: '#00aaff',
    },
    {
      id: 'moderation',
      title: 'На модерации',
      value: 7,
      prefix: '',
      suffix: '',
      icon: '📋',
      badge: 'Требуют проверки',
      badgeColor: 'text-amber-400 border-amber-500/40',
      glowColor: 'rgba(245,158,11,0.3)',
      accentColor: '#f59e0b',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#06060e] text-white overflow-hidden selection:bg-amber-500/25">
      {/* ── Background Effects ── */}
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.018]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient orbs */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(0,170,255,0.4) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'orbFloatA 10s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-8"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'orbFloatB 12s ease-in-out infinite alternate',
        }}
      />

      {/* ── Header ── */}
      <header className="relative z-30 px-6 pt-8 pb-4 md:px-10 md:pt-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.45em] text-white/25 font-light mb-1">
              Панель управления
            </p>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-sky-300 via-blue-400 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(0,170,255,0.3)]">
              Аналитика
            </h1>
            <p className="text-xs md:text-sm text-white/30 mt-1">
              Статистика платформы в реальном времени
            </p>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex items-center gap-2 rounded-full bg-white/[0.03] border border-white/[0.06] px-4 py-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40 animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs text-emerald-400/80 font-medium tracking-wider uppercase">
                Live
              </span>
            </div>
            <span className="text-xs text-white/20 font-mono">
              {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </header>

      {/* ── Metric Cards Row ── */}
      <section className="relative z-20 px-4 sm:px-6 md:px-10 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((card, idx) => (
            <div
              key={card.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <MetricCardEl card={card} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Charts Section ── */}
      <section className="relative z-20 px-4 sm:px-6 md:px-10 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Bar Chart: takes 3 columns */}
          <div
            className="lg:col-span-3 rounded-2xl p-5 md:p-6 border border-white/[0.05]"
            style={{
              background: 'linear-gradient(160deg, rgba(18,18,30,0.9), rgba(10,10,20,0.95))',
              boxShadow: '0 0 30px rgba(0,0,0,0.3), 0 4px 24px rgba(0,0,0,0.4)',
            }}
          >
            {/* Chart header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white/90">Активность платформы</h2>
                <p className="text-xs text-white/30">Взаимодействия волонтёров</p>
              </div>

              {/* Toggle buttons */}
              <div className="flex items-center gap-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] p-1">
                {(['day', 'week', 'month'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setChartMode(mode)}
                    className={`relative px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                      chartMode === mode
                        ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                        : 'text-white/30 hover:text-white/60'
                    }`}
                  >
                    {mode === 'day' ? 'День' : mode === 'week' ? 'Неделя' : 'Месяц'}
                    {chartMode === mode && (
                      <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-2/3 rounded-full"
                        style={{ backgroundColor: chartBarColor }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            {animateCharts && (
              <BarChart
                data={chartData}
                maxValue={chartMaxValue}
                barColor={chartBarColor}
              />
            )}
          </div>

          {/* Donut Chart: takes 2 columns */}
          <div
            className="lg:col-span-2 rounded-2xl p-5 md:p-6 border border-white/[0.05] flex flex-col items-center"
            style={{
              background: 'linear-gradient(160deg, rgba(18,18,30,0.9), rgba(10,10,20,0.95))',
              boxShadow: '0 0 30px rgba(0,0,0,0.3), 0 4px 24px rgba(0,0,0,0.4)',
            }}
          >
            <div className="self-start mb-4">
              <h2 className="text-lg font-bold text-white/90">Категории</h2>
              <p className="text-xs text-white/30">Распределение ивентов</p>
            </div>
            <DonutChart slices={CATEGORY_SLICES} size={200} />
          </div>
        </div>
      </section>

      {/* ── Token Operations Log ── */}
      <section className="relative z-20 px-4 sm:px-6 md:px-10 py-4 pb-10">
        <div
          className="rounded-2xl border border-white/[0.05] overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(18,18,30,0.9), rgba(10,10,20,0.95))',
            boxShadow: '0 0 30px rgba(0,0,0,0.3), 0 4px 24px rgba(0,0,0,0.4)',
          }}
        >
          {/* Log header */}
          <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-white/[0.04]">
            <div>
              <h2 className="text-lg font-bold text-white/90">
                📡 Живой журнал операций токенов
              </h2>
              <p className="text-xs text-white/25">Последние транзакции в системе</p>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs text-white/20">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400/60" />
                Зачисление
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400/60" />
                Списание
              </span>
            </div>
          </div>

          {/* Log entries */}
          <div className="divide-y divide-white/[0.02]">
            {LOG_ENTRIES.map((entry, idx) => (
              <div
                key={entry.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <LogRow entry={entry} />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 md:px-6 py-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-white/15">
            <span>Показано последние {LOG_ENTRIES.length} операций</span>
            <button className="text-sky-400/50 hover:text-sky-400/80 transition-colors font-medium">
              Смотреть все →
            </button>
          </div>
        </div>
      </section>

      {/* ── Bottom gradient fade ── */}
      <div
        className="fixed bottom-0 left-0 right-0 h-24 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(0deg, #06060e 0%, transparent 100%)',
        }}
      />

      {/* ── Global Animations ── */}
      <style jsx global>{`
        @keyframes orbFloatA {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-30px, 20px) scale(1.1);
          }
          66% {
            transform: translate(15px, -25px) scale(0.9);
          }
        }
        @keyframes orbFloatB {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(25px, -15px) scale(1.15);
          }
          66% {
            transform: translate(-20px, 10px) scale(0.85);
          }
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        /* Custom scrollbar for log */
        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}