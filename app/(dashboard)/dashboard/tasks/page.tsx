'use client';

import React, { useState } from 'react';

// ========================
// Типы данных
// ========================
type TaskStatus = 'Доступно' | 'Принято' | 'Ожидает проверки' | 'Выполнено';

interface Task {
  id: number;
  emoji: string;
  title: string;
  description: string;
  reward: number;
  deadline: string;
  verificationMethod: string;
  status: TaskStatus;
  instructions: string[];
}

// ========================
// Конфигурация цветов статусов
// ========================
const statusConfig: Record<
  TaskStatus,
  { bg: string; text: string; border: string; dot: string; label: string; glow: string }
> = {
  Доступно: {
    bg: 'bg-violet-500/15',
    text: 'text-violet-300',
    border: 'border-violet-500/40',
    dot: 'bg-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.9)]',
    label: 'Доступно',
    glow: 'shadow-[0_0_15px_rgba(139,92,246,0.3)]',
  },
  Принято: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/40',
    dot: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]',
    label: 'Принято',
    glow: 'shadow-[0_0_15px_rgba(251,191,36,0.3)]',
  },
  'Ожидает проверки': {
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-300',
    border: 'border-cyan-500/40',
    dot: 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)] animate-pulse',
    label: 'Ожидает проверки',
    glow: 'shadow-[0_0_15px_rgba(34,211,238,0.3)]',
  },
  Выполнено: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    border: 'border-emerald-500/40',
    dot: 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)]',
    label: 'Выполнено',
    glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]',
  },
};

// ========================
// Демо-данные заданий
// ========================
const initialTasks: Task[] = [
  {
    id: 1,
    emoji: '🛠️',
    title: 'Первичная кастомизация',
    description:
      'Добавь фото профиля, пройди техническую проверку.',
    reward: 10,
    deadline: 'Бессрочно',
    verificationMethod: 'Автоматически',
    status: 'Доступно',
    instructions: [
      'Перейди в раздел «Профиль» в личном кабинете.',
      'Загрузи качественное фото (чёткое лицо, нейтральный фон).',
      'Нажми кнопку «Пройти проверку» — система сама сверит изображение.',
      'Дождись автоматического подтверждения (обычно до 30 секунд).',
      'После успешной верификации +10 ST зачислятся на твой баланс.',
    ],
  },
  {
    id: 2,
    emoji: '📢',
    title: 'Информационная волна',
    description:
      'Зайди на официальный канал, поставь лайк и подпишись на уведомления.',
    reward: 20,
    deadline: '7 дней',
    verificationMethod: 'Скриншот + модерация',
    status: 'Доступно',
    instructions: [
      'Открой официальный Telegram-канал платформы.',
      'Поставь лайк на последние 3 поста.',
      'Включи уведомления (колокольчик → «Все уведомления»).',
      'Сделай скриншот, где видно твой лайк и подписку.',
      'Загрузи скриншот в форму ниже и отправь на модерацию.',
    ],
  },
  {
    id: 3,
    emoji: '🔗',
    title: 'Цифровой след',
    description:
      'Привяжи социальные сети в личном кабинете волонтера для верификации аккаунта.',
    reward: 5,
    deadline: 'Бессрочно',
    verificationMethod: 'OAuth / привязка',
    status: 'Принято',
    instructions: [
      'Открой личный кабинет → вкладка «Интеграции».',
      'Нажми «Привязать» рядом с иконкой нужной соцсети.',
      'Авторизуйся через OAuth-окно (откроется автоматически).',
      'Дождись зелёной галочки — привязка выполнена.',
      'Отправь отчёт, нажав кнопку ниже.',
    ],
  },
  {
    id: 4,
    emoji: '🌿',
    title: 'Эко-Патруль: Общий Сбор',
    description:
      'Офлайн-миссия. Прибудь на точку очистки берега Иртыша и отсканируй QR-код у организатора.',
    reward: 50,
    deadline: '14 дней',
    verificationMethod: 'Промокод / QR-код',
    status: 'Ожидает проверки',
    instructions: [
      'Запишись на ближайшую точку сбора в разделе «Карта активностей».',
      'Прибудь на место в указанное время.',
      'Найди организатора с планшетом и отсканируй его QR-код.',
      'После сканирования статус автоматически сменится на «Ожидает проверки».',
      'Организатор подтвердит твоё участие — и +50 ST упадут на счёт.',
    ],
  },
  {
    id: 5,
    emoji: '⭐',
    title: 'Заполнение профиля на 100%',
    description:
      'Укажи город, вуз/организацию и выбери свои волонтерские интересы.',
    reward: 20,
    deadline: 'Бессрочно',
    verificationMethod: 'Автоматически',
    status: 'Выполнено',
    instructions: [
      'Зайди в раздел «Профиль» → «Редактировать».',
      'Заполни поля: Город, Учебное заведение / Организация.',
      'Выбери минимум 3 волонтёрских интереса из списка.',
      'Нажми «Сохранить» — прогресс-бар покажет 100%.',
      'Поздравляем! Бонусные +20 ST уже на твоём балансе.',
    ],
  },
];

// ========================
// Компонент: Панель прогресса
// ========================
const ProgressPanel: React.FC<{ balance: number; completedCount: number; totalCount: number }> = ({
  balance,
  completedCount,
  totalCount,
}) => (
  <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0c0c1a]/70 p-6 backdrop-blur-xl md:p-8">
    {/* Фоновый градиентный блик */}
    <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-600/15 blur-[80px]" />
    <div className="pointer-events-none absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-emerald-500/10 blur-[60px]" />

    <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
      {/* Левая часть: баланс */}
      <div className="flex items-center gap-5">
        {/* Иконка ST */}
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
          <span className="text-3xl drop-shadow-[0_0_10px_rgba(245,158,11,0.7)]">
            💎
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/70">
            Текущий баланс
          </p>
          <p className="text-4xl font-black tabular-nums tracking-tighter text-white drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            {balance} <span className="text-xl text-amber-400">ST</span>
          </p>
        </div>
      </div>

      {/* Правая часть: прогресс-бар */}
      <div className="flex flex-col gap-2 md:min-w-[220px]">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Прогресс миссий</span>
          <span className="font-mono font-bold text-violet-300">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_10px_rgba(139,92,246,0.6)] transition-all duration-700"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
        <p className="text-xs text-zinc-600">
          Ежедневные и специальные задания для получения социальных токенов (ST).
          Выполняйте миссии, повышайте уровень и обменивайте ST на награды в Маркетплейсе.
        </p>
      </div>
    </div>
  </div>
);

// ========================
// Компонент: Индикатор статуса
// ========================
const StatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${cfg.border} ${cfg.bg} px-3 py-1 text-xs font-semibold ${cfg.text}`}
    >
      <span className={`inline-block h-2 w-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ========================
// Компонент: Карточка задания
// ========================
const TaskCard: React.FC<{
  task: Task;
  onClick: () => void;
}> = ({ task, onClick }) => {
  const cfg = statusConfig[task.status];

  return (
    <div
      onClick={onClick}
      className={`
        group relative cursor-pointer overflow-hidden rounded-2xl
        border border-[#2a1f3d] bg-[#0c0c1a]/70 p-5
        backdrop-blur-sm transition-all duration-500
        hover:z-10 hover:scale-[1.03]
        hover:border-violet-500/50
        hover:shadow-[0_0_30px_rgba(124,58,237,0.5),0_0_60px_rgba(124,58,237,0.1)]
        ${cfg.glow}
      `}
    >
      {/* Неоновый блик при наведении */}
      <div className="pointer-events-none absolute -inset-1 z-0 rounded-2xl bg-gradient-to-br from-violet-600/0 via-fuchsia-600/0 to-violet-600/0 opacity-0 blur-xl transition-all duration-500 group-hover:from-violet-600/8 group-hover:to-fuchsia-600/8 group-hover:opacity-100" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Верхняя строка: эмодзи + награда */}
        <div className="flex items-start justify-between">
          {/* Пульсирующая иконка */}
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-xl bg-violet-500/10 blur-lg" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-[#13132a]/90 shadow-[0_6px_24px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110">
              <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                {task.emoji}
              </span>
            </div>
          </div>

          {/* Плашка награды ST */}
          <div className="flex flex-shrink-0 items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 shadow-[0_0_12px_rgba(52,211,153,0.15)]">
            <span className="text-xs text-emerald-300">+</span>
            <span className="text-base font-black tabular-nums text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]">
              {task.reward}
            </span>
            <span className="text-xs font-semibold text-emerald-500">ST</span>
          </div>
        </div>

        {/* Заголовок */}
        <div>
          <h3 className="text-lg font-extrabold tracking-tight text-white transition-colors duration-300 group-hover:text-violet-200 group-hover:drop-shadow-[0_0_8px_rgba(167,139,250,0.4)]">
            {task.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-zinc-400 transition-colors group-hover:text-zinc-300">
            {task.description}
          </p>
        </div>

        {/* Нижняя строка: статус + метод проверки */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <StatusBadge status={task.status} />
          <span className="text-xs text-zinc-600">
            {task.verificationMethod}
          </span>
        </div>
      </div>
    </div>
  );
};

// ========================
// Компонент: Модальное окно
// ========================
const TaskModal: React.FC<{
  task: Task;
  onClose: () => void;
  onUpdateStatus: (id: number, newStatus: TaskStatus) => void;
}> = ({ task, onClose, onUpdateStatus }) => {
  const cfg = statusConfig[task.status];
  const [dragActive, setDragActive] = useState(false);
  const [fileSimulated, setFileSimulated] = useState(false);

  const handleTakeTask = () => {
    onUpdateStatus(task.id, 'Принято');
    onClose();
  };

  const handleSubmitReport = () => {
    onUpdateStatus(task.id, 'Ожидает проверки');
    setFileSimulated(false);
    onClose();
  };

  const handleSimulateUpload = () => {
    setFileSimulated(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Размытый задний фон */}
      <div className="absolute inset-0 bg-[#06060e]/85 backdrop-blur-md transition-all duration-300" />

      {/* Контейнер модалки */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          relative z-10 flex w-full max-w-xl animate-modal-in flex-col gap-6
          rounded-3xl border border-white/10 bg-[#0c0c1a]/95 p-8
          shadow-[0_30px_80px_rgba(0,0,0,0.8),0_0_60px_rgba(124,58,237,0.2)]
          backdrop-blur-xl
        "
      >
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-xl p-2 text-zinc-500 transition-all hover:bg-white/5 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* === Шапка модалки === */}
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#13132a] shadow-[0_12px_40px_rgba(124,58,237,0.25)]">
            <span className="text-4xl drop-shadow-[0_0_16px_rgba(255,255,255,0.35)]">
              {task.emoji}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-[0_0_8px_rgba(167,139,250,0.3)]">
              {task.title}
            </h2>
            <StatusBadge status={task.status} />
          </div>
        </div>

        {/* === Блок награды и срока === */}
        <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Награда:</span>
            <span className="text-lg font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
              +{task.reward} ST
            </span>
          </div>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Срок:</span>
            <span className="text-sm font-semibold text-zinc-300">{task.deadline}</span>
          </div>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Проверка:</span>
            <span className="text-sm font-semibold text-zinc-400">{task.verificationMethod}</span>
          </div>
        </div>

        {/* === Пошаговая инструкция === */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-violet-400">
            📋 Инструкция для волонтёра
          </p>
          <ol className="flex flex-col gap-3">
            {task.instructions.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-xs font-bold text-violet-300">
                  {idx + 1}
                </span>
                <span className="text-sm leading-relaxed text-zinc-300">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* === Интерактивная зона в зависимости от статуса === */}

        {/* ДОСТУПНО: кнопка «Взять в работу» */}
        {task.status === 'Доступно' && (
          <button
            onClick={handleTakeTask}
            className="
              group relative w-full overflow-hidden rounded-xl
              bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-4
              text-base font-bold tracking-wide text-white
              shadow-[0_8px_30px_rgba(124,58,237,0.45)]
              transition-all duration-300
              hover:shadow-[0_12px_45px_rgba(124,58,237,0.7)]
              active:scale-[0.98]
            "
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              🤝 Взять в работу
            </span>
            <div className="absolute inset-0 -z-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-90" />
          </button>
        )}

        {/* ПРИНЯТО: зона загрузки скриншота + кнопка «Отправить отчёт» */}
        {task.status === 'Принято' && (
          <div className="flex flex-col gap-4">
            {/* Drag-and-drop зона */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                handleSimulateUpload();
              }}
              onClick={handleSimulateUpload}
              className={`
                flex cursor-pointer flex-col items-center justify-center gap-3
                rounded-xl border-2 border-dashed p-8 text-center
                transition-all duration-300
                ${
                  dragActive
                    ? 'border-violet-400 bg-violet-500/10 shadow-[0_0_20px_rgba(124,58,237,0.3)]'
                    : fileSimulated
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-zinc-700 bg-white/[0.01] hover:border-violet-500/40 hover:bg-violet-500/5'
                }
              `}
            >
              {fileSimulated ? (
                <>
                  <span className="text-3xl">✅</span>
                  <span className="text-sm font-semibold text-emerald-400">
                    screenshot_отчёт_2024.png
                  </span>
                  <span className="text-xs text-zinc-500">Файл загружен (симуляция)</span>
                </>
              ) : (
                <>
                  <span className="text-3xl opacity-60">📁</span>
                  <span className="text-sm text-zinc-400">
                    Перетащите скриншот сюда или{' '}
                    <span className="text-violet-400 underline">нажмите для выбора</span>
                  </span>
                  <span className="text-xs text-zinc-600">PNG, JPG до 5 МБ</span>
                </>
              )}
            </div>

            {/* Кнопка отправки */}
            <button
              onClick={handleSubmitReport}
              disabled={!fileSimulated}
              className={`
                w-full rounded-xl px-6 py-4 text-base font-bold tracking-wide
                transition-all duration-300
                ${
                  fileSimulated
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_8px_30px_rgba(34,211,238,0.4)] hover:shadow-[0_12px_45px_rgba(34,211,238,0.7)] active:scale-[0.98] cursor-pointer'
                    : 'cursor-not-allowed bg-zinc-800 text-zinc-600'
                }
              `}
            >
              📤 Отправить отчёт
            </button>
          </div>
        )}

        {/* ОЖИДАЕТ ПРОВЕРКИ: информационное сообщение */}
        {task.status === 'Ожидает проверки' && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-6 text-center">
            <span className="text-3xl animate-pulse">⏳</span>
            <p className="text-sm font-semibold text-cyan-300">
              Отчёт отправлен и ожидает проверки модератором
            </p>
            <p className="text-xs text-zinc-500">
              Обычно проверка занимает до 24 часов. Мы уведомим вас о результате.
            </p>
          </div>
        )}

        {/* ВЫПОЛНЕНО: заблокированная кнопка */}
        {task.status === 'Выполнено' && (
          <button
            disabled
            className="
              w-full cursor-not-allowed rounded-xl
              bg-emerald-500/20 px-6 py-4
              text-base font-bold tracking-wide text-emerald-400
              border border-emerald-500/30
              shadow-[0_0_20px_rgba(52,211,153,0.3)]
            "
          >
            ✅ Миссия завершена
          </button>
        )}
      </div>
    </div>
  );
};

// ========================
// ГЛАВНАЯ СТРАНИЦА
// ========================
export default function OrganizationsPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const completedCount = tasks.filter((t) => t.status === 'Выполнено').length;
  const balance = 135; // Симулированный баланс

  const handleUpdateStatus = (id: number, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  return (
    <div className="relative min-h-screen bg-[#06060e] px-4 py-8 md:px-8 lg:px-12">
      {/* ===== Глобальные стили для анимации модалки ===== */}
      <style jsx global>{`
        @keyframes modal-in {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(30px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-in {
          animation: modal-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {/* ===== Декоративные фоновые элементы ===== */}
      {/* Верхний фиолетовый блик */}
      <div className="pointer-events-none fixed -top-40 left-1/3 h-96 w-96 rounded-full bg-violet-600/8 blur-[150px]" />
      {/* Нижний зелёный блик */}
      <div className="pointer-events-none fixed -bottom-32 right-1/4 h-80 w-80 rounded-full bg-emerald-500/6 blur-[120px]" />
      {/* Сетка на фоне */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl space-y-10">
        {/* ===== Прогресс-панель ===== */}
        <ProgressPanel
          balance={balance}
          completedCount={completedCount}
          totalCount={tasks.length}
        />

        {/* ===== Заголовок секции заданий ===== */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-b from-violet-500 via-fuchsia-500 to-violet-500 shadow-[0_0_14px_rgba(139,92,246,0.7)]" />
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.1)]">
              Активные{' '}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                миссии
              </span>
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Выполняйте задания, зарабатывайте ST и открывайте новые возможности
            </p>
          </div>
        </div>

        {/* ===== Сетка карточек заданий ===== */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => setSelectedTask(task)}
            />
          ))}
        </div>

        {/* ===== Слоган внизу ===== */}
        <p className="pb-6 text-center text-xs text-zinc-700">
          Ежедневные и специальные задания для получения социальных токенов (ST).
          Выполняйте миссии, повышайте уровень и обменивайте ST на награды в Маркетплейсе.
        </p>
      </div>

      {/* ===== Модальное окно ===== */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}