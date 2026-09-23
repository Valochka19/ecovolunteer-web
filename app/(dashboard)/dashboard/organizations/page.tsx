'use client';

import React, { useState } from 'react';
import { X, Users, MapPin, Sparkles, Zap } from 'lucide-react';

// ========================
// Демо-данные сообществ
// ========================
interface Organization {
  id: number;
  emoji: string;
  title: string;
  description: string;
  city: string;
  members: number;
  online: number;
  mission: string;
  achievements: string[];
  gradient: string;
}

const organizations: Organization[] = [
  {
    id: 1,
    emoji: '🐾',
    title: 'ПРИЮТ "НАДЕЖДА"',
    description: 'Свет в конце тоннеля для бездомных хвостиков.',
    city: 'г. Омск',
    members: 2847,
    online: 142,
    gradient: 'from-pink-600/20 to-rose-600/20',
    mission:
      'Мы верим, что каждое животное заслуживает тёплый дом и любящую семью. Наш приют — это не просто передержка, а настоящий реабилитационный центр, где кошки и собаки получают медицинскую помощь, социализацию и шанс на новую жизнь.',
    achievements: [
      '🏠 500+ животных нашли новый дом в 2024 году',
      '💉 Проведено 1200 вакцинаций',
      '🤝 Запущена программа "Куратор-друг"',
    ],
  },
  {
    id: 2,
    emoji: '🌿',
    title: 'ЭКО-ПАТРУЛЬ',
    description: 'Мы очищаем берега Иртыша.',
    city: 'г. Омск',
    members: 1563,
    online: 87,
    gradient: 'from-emerald-600/20 to-green-600/20',
    mission:
      'Экологическая безопасность — наш приоритет. Мы организуем регулярные рейды по очистке береговых линий, высаживаем деревья и проводим образовательные лекции для школьников. Наша цель — чистый Иртыш и экосознательное поколение.',
    achievements: [
      '🗑️ Вывезено 8 тонн мусора с берегов',
      '🌳 Высажено 350 саженцев',
      '📚 40+ лекций в школах города',
    ],
  },
  {
    id: 3,
    emoji: '🤝',
    title: 'ДОБРЫЕ РУКИ',
    description: 'Социальная поддержка пожилых людей.',
    city: 'г. Омск',
    members: 4120,
    online: 203,
    gradient: 'from-amber-600/20 to-orange-600/20',
    mission:
      'Одинокие пожилые люди не должны чувствовать себя брошенными. Мы доставляем горячее питание, помогаем по хозяйству и просто разговариваем — порой душевная беседа лечит лучше любых лекарств. Наши волонтёры дарят тепло тем, кто в нём нуждается больше всего.',
    achievements: [
      '🍲 Доставлено 15 000 горячих обедов',
      '👴 200+ подопечных на постоянном патронаже',
      '🎉 Организовано 12 праздничных мероприятий',
    ],
  },
  {
    id: 4,
    emoji: '💻',
    title: 'ТЕХНО-ВОЛОНТЕРЫ',
    description: 'Бесплатные курсы программирования.',
    city: 'г. Омск',
    members: 3215,
    online: 178,
    gradient: 'from-violet-600/20 to-purple-600/20',
    mission:
      'Цифровое неравенство — барьер, который мы разрушаем. Мы бесплатно обучаем детей из малообеспеченных семей основам программирования, веб-разработки и кибербезопасности. Технологии должны быть доступны каждому, независимо от финансовых возможностей.',
    achievements: [
      '🎓 120 выпускников курса Frontend Basic',
      '💼 45 учеников устроились на IT-стажировки',
      '🏆 Победа в номинации "Лучший соцпроект 2024"',
    ],
  },
];

// ============================
// Переиспользуемые компоненты
// ============================

/** Неоновая точка — живой индикатор */
const LiveDot: React.FC = () => (
  <span className="relative flex h-2.5 w-2.5">
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
  </span>
);

/** Карточка сообщества */
const OrgCard: React.FC<{
  org: Organization;
  onClick: () => void;
}> = ({ org, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        group relative cursor-pointer overflow-hidden rounded-2xl
        border border-white/5 bg-gradient-to-br ${org.gradient} 
        bg-[#0c0c18] p-6 transition-all duration-500
        hover:scale-[1.03] hover:border-violet-500/60
        hover:shadow-[0_0_30px_rgba(124,58,237,0.5),0_0_60px_rgba(124,58,237,0.15)]
      `}
    >
      {/* Фоновый неоновый блик */}
      <div className="pointer-events-none absolute -inset-1 z-0 rounded-2xl bg-gradient-to-br from-violet-600/0 via-violet-600/0 to-violet-600/0 opacity-0 blur-xl transition-all duration-500 group-hover:from-violet-600/10 group-hover:to-fuchsia-600/10 group-hover:opacity-100" />

      {/* Мерцающие частицы на фоне */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHJhZGlhbEdyYWRpZW50IGlkPSJnIiBjeD0iNTAlIiBjeT0iNTAlIiByPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSJ0cmFuc3BhcmVudCIvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjEuNSIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==')] opacity-30" />

      <div className="relative z-10 flex flex-col gap-5">
        {/* ---- Верх: иконка + заголовок ---- */}
        <div className="flex items-start gap-4">
          {/* 3D пульсирующая иконка */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 animate-pulse rounded-xl bg-violet-500/20 blur-lg" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-[#13132a]/80 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:scale-110">
              <span className="text-3xl drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                {org.emoji}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 pt-1">
            <h3 className="text-lg font-extrabold tracking-wider text-white transition-all duration-300 group-hover:text-violet-300 group-hover:drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]">
              {org.title}
            </h3>
            <p className="text-sm leading-relaxed text-slate-400 transition-colors group-hover:text-slate-300">
              {org.description}
            </p>
          </div>
        </div>

        {/* ---- Низ: микро-статистика ---- */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-2">
            <LiveDot />
            <span className="text-xs font-semibold text-emerald-400">
              {org.online} online
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users className="h-3.5 w-3.5 text-violet-400" />
            <span className="font-mono font-semibold text-violet-300">
              {org.members.toLocaleString()}
            </span>
            <span className="text-slate-600">участников</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Модальное окно */
const Modal: React.FC<{
  org: Organization;
  onClose: () => void;
}> = ({ org, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Размытый затемнённый фон */}
      <div className="absolute inset-0 bg-[#06060e]/85 backdrop-blur-md transition-all duration-300" />

      {/* Контейнер модалки */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          relative z-10 flex w-full max-w-lg animate-modal-in flex-col gap-6
          rounded-2xl border border-white/10 bg-[#0c0c1a]/95 p-8
          shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_80px_rgba(124,58,237,0.25)]
          backdrop-blur-xl
        "
      >
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 transition-all hover:bg-white/5 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ---- Шапка модалки ---- */}
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#13132a] shadow-[0_12px_40px_rgba(124,58,237,0.3)]">
            <span className="text-4xl drop-shadow-[0_0_16px_rgba(255,255,255,0.4)]">
              {org.emoji}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(167,139,250,0.5)]">
              {org.title}
            </h2>
            <div className="flex items-center gap-1.5 text-sm text-slate-400">
              <MapPin className="h-4 w-4 text-violet-400" />
              <span>{org.city}</span>
              <span className="mx-1 text-slate-600">•</span>
              <Users className="h-4 w-4 text-violet-400" />
              <span className="font-mono text-violet-300">
                {org.members.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* ---- Миссия ---- */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-violet-400">
            <Sparkles className="h-4 w-4" />
            Наша Миссия
          </div>
          <p className="leading-relaxed text-slate-300">{org.mission}</p>
        </div>

        {/* ---- Достижения ---- */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-amber-400">
            <Zap className="h-4 w-4" />
            Последние достижения
          </div>
          <ul className="flex flex-col gap-2">
            {org.achievements.map((ach, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-sm text-slate-300"
              >
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-500 shadow-[0_0_6px_rgba(124,58,237,0.8)]" />
                {ach}
              </li>
            ))}
          </ul>
        </div>

        {/* ---- Кнопка ---- */}
        <button
          className="
            group relative w-full overflow-hidden rounded-xl
            bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3.5
            text-base font-bold tracking-wide text-white
            shadow-[0_8px_30px_rgba(124,58,237,0.5)]
            transition-all duration-300 hover:shadow-[0_12px_40px_rgba(124,58,237,0.7)]
            active:scale-[0.98]
          "
        >
          <span className="relative z-10">Присоединиться</span>
          <div className="absolute inset-0 -z-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
        </button>
      </div>
    </div>
  );
};

// ============================
// СТРАНИЦА
// ============================
export default function OrganizationsPage() {
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  return (
    <div className="min-h-screen bg-[#06060e] px-6 py-10 lg:px-12">
      {/* ========== Глобальные стили для анимации модалки ========== */}
      <style jsx global>{`
        @keyframes modal-in {
          0% {
            opacity: 0;
            transform: scale(0.85) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-in {
          animation: modal-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {/* ========== Заголовок страницы ========== */}
      <div className="mb-12 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-1.5 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500 shadow-[0_0_12px_rgba(124,58,237,0.7)]" />
          <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
            Витрина{' '}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              неоновых сообществ
            </span>
          </h1>
        </div>
        <p className="ml-13 max-w-xl text-base text-slate-500">
          Выбирайте направление по душе и присоединяйтесь к тысячам волонтёров
          прямо сейчас. Каждая карточка — живой организм, пульсирующий энергией
          добрых дел.
        </p>
      </div>

      {/* ========== Сетка карточек 2x2 ========== */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
        {organizations.map((org) => (
          <OrgCard
            key={org.id}
            org={org}
            onClick={() => setSelectedOrg(org)}
          />
        ))}
      </div>

      {/* ========== Модальное окно ========== */}
      {selectedOrg && (
        <Modal org={selectedOrg} onClose={() => setSelectedOrg(null)} />
      )}
    </div>
  );
}