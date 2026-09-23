"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { EventDataUI } from "@/lib/supabase/types";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

// ─── Component: EventCard ────────────────────────────────────────

function EventCard({
  event,
  onClick,
}: {
  event: EventDataUI;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 text-left shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-zinc-700 hover:shadow-violet-900/20"
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-800">
        {event.image && typeof event.image === 'string' && event.image.trim() !== '' ? (
          <Image
            src={event.image}
            alt={event.title || 'Мероприятие'}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 500px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 text-5xl">
            🌿
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Title overlay at the bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">
            {event.title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
            <span className="flex items-center gap-1">
              📅 {event.date}
            </span>
            <span className="flex items-center gap-1">
              📍 {event.city}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span>🎯 {event.reward} токенов</span>
          <span className="text-zinc-700">•</span>
          <span>
            👥 {event.participants}/{event.maxParticipants}
          </span>
        </div>
        <span className="rounded-full bg-emerald-900/40 px-3 py-1 text-xs font-medium text-emerald-300">
          Открыто
        </span>
      </div>
    </button>
  );
}

// ─── Component: EventDetailModal ─────────────────────────────────

function EventDetailModal({
  event,
  onClose,
  onSignUp,
  isSignedUp,
  isSigningUp,
  signUpError,
}: {
  event: EventDataUI;
  onClose: () => void;
  onSignUp: () => void;
  isSignedUp: boolean;
  isSigningUp?: boolean;
  signUpError?: string | null;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-8 sm:items-center sm:pt-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Закрыть"
      />

      {/* Modal content */}
      <div className="relative w-full max-w-2xl animate-[fadeIn_0.2s_ease-out] rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        {/* Image header */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-2xl">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 700px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/70 transition-colors hover:bg-black/70 hover:text-white"
            aria-label="Закрыть"
          >
            ✕
          </button>

          {/* Title on image */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-3xl font-bold text-white drop-shadow-lg">
              {event.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-800/50 px-3 py-1.5">
              📅 {event.date} в {event.time}
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-800/50 px-3 py-1.5">
              📍 {event.location}
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-800/50 px-3 py-1.5">
              🎯 {event.reward} токенов
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-800/50 px-3 py-1.5">
              👥 {event.participants}/{event.maxParticipants} участников
            </div>
          </div>

          {/* Organizer */}
          <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
            <Image
              src={event.organizerAvatar}
              alt={event.organizer}
              width={40}
              height={40}
              className="rounded-full bg-zinc-800"
            />
            <div>
              <p className="text-sm font-medium text-zinc-200">
                {event.organizer}
              </p>
              <p className="text-xs text-zinc-500">Организатор</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-zinc-100">
              О мероприятии
            </h3>
            <div className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">
              {event.fullDescription}
            </div>
          </div>

          {/* Category tag */}
          <div className="flex gap-2">
            <span className="rounded-full bg-violet-900/30 px-3 py-1 text-xs font-medium text-violet-300">
              #{event.category}
            </span>
          </div>

                    {/* Action button */}
          <div className="border-t border-zinc-800 pt-4">
            {isSignedUp ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-900/20 px-4 py-3 text-emerald-300">
                ✅ Вы записаны на это мероприятие
              </div>
            ) : (
              <Button
                size="lg"
                className="w-full"
                onClick={onSignUp}
                isLoading={isSigningUp}
              >
                ✋ Записаться на мероприятие
              </Button>
            )}
            {signUpError && (
              <p className="mt-2 text-center text-sm text-red-400">
                {signUpError}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers for transforming DB rows to UI objects ──────────────

interface EventDbRow {
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
}

interface EventRow extends EventDbRow {
  participants: number;
  organizer_name: string;
  organizer_avatar: string;
}

function rowToEventUI(row: EventRow): EventDataUI {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    fullDescription: row.full_description,
    image: row.image,
    date: row.date,
    time: row.time,
    location: row.location,
    city: row.city,
    category: row.category,
    participants: row.participants,
    maxParticipants: row.max_participants,
    reward: row.reward,
    organizerId: row.organizer_id,
    organizer: row.organizer_name,
    organizerAvatar: row.organizer_avatar,
    status: row.status,
  };
}

// ─── Main page ───────────────────────────────────────────────────

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventDataUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventDataUI | null>(null);
  const [signedUpEvents, setSignedUpEvents] = useState<Set<string>>(new Set());
  const [signingUp, setSigningUp] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  // Seed state
  const [seeding, setSeeding] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);

  // ── Fetch events from Supabase ─────────────────────────────────
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

            // 1. Fetch events
            const eventsQuery = await supabase
              .from("events")
              .select()
              .order("date", { ascending: true });
        
            const eventsError = eventsQuery.error;
            const eventsData = eventsQuery.data as EventDbRow[] | null;

            if (eventsError) {
              console.error("Error fetching events:", eventsError);
              setEvents([]);
              return;
            }

            if (!eventsData || eventsData.length === 0) {
              setEvents([]);
              return;
            }

            // 2. Fetch participant counts
            const participantQuery = await supabase
              .from("event_participants")
              .select()
              .eq("status", "registered");
            const participantRows = (participantQuery.data ?? []) as { event_id: string }[];

            const participantCounts = new Map<string, number>();
            for (const p of participantRows) {
              participantCounts.set(
                p.event_id,
                (participantCounts.get(p.event_id) ?? 0) + 1
              );
            }

            // 3. Fetch organizer profiles
            const organizerIds = [
              ...new Set(eventsData.map((e) => e.organizer_id)),
            ];
            const profilesQuery = await supabase
              .from("profiles")
              .select("id, name, avatar")
              .in("id", organizerIds);
            const profilesData = (profilesQuery.data ?? []) as { id: string; name: string; avatar: string }[];

            const profileMap = new Map(
              profilesData.map((p) => [
                p.id,
                { name: p.name, avatar: p.avatar },
              ])
            );

      // 4. Map to UI format
      const mapped = eventsData.map((row) => {
        const org = profileMap.get(row.organizer_id) ?? {
          name: "Организатор",
          avatar:
            "https://api.dicebear.com/9.x/identicon/svg?seed=default",
        };
        return rowToEventUI({
          ...row,
          participants: participantCounts.get(row.id) ?? 0,
          organizer_name: org.name,
          organizer_avatar: org.avatar,
        });
      });

      setEvents(mapped);

            // 5. Если пользователь авторизован — проверяем его записи
            if (user) {
              const myRegQuery = await supabase
                .from("event_participants")
                .select()
                .eq("user_id", user.id)
                .eq("status", "registered");

              const myRegs = (myRegQuery.data ?? []) as { event_id: string }[];
              if (myRegs.length > 0) {
                setSignedUpEvents(new Set(myRegs.map((r) => r.event_id)));
              }
            }
    } catch (err) {
      console.error("Failed to load events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ── Handle seed button ─────────────────────────────────────────
  const handleSeed = async () => {
    setSeeding(true);
    setSeedMessage(null);
    setSeedError(null);

    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();

      if (data.ok) {
        setSeedMessage(data.message ?? "✅ Данные загружены!");
        await fetchEvents();
      } else {
        setSeedError(data.error ?? "❌ Ошибка при загрузке");
      }
    } catch {
      setSeedError("❌ Не удалось соединиться с сервером");
    } finally {
      setSeeding(false);
    }
  };

  // ── Handle cleanup button ──────────────────────────────────────
  const handleCleanup = async () => {
    if (!confirm("Удалить все демо-данные? Это действие нельзя отменить.")) return;

    setCleaning(true);
    setSeedMessage(null);
    setSeedError(null);

    try {
      const res = await fetch("/api/cleanup", { method: "POST" });
      const data = await res.json();

      if (data.ok) {
        setSeedMessage(data.message ?? "✅ Данные удалены");
        setEvents([]);
        setSignedUpEvents(new Set());
      } else {
        setSeedError(data.error ?? "❌ Ошибка при очистке");
      }
    } catch {
      setSeedError("❌ Не удалось соединиться с сервером");
    } finally {
      setCleaning(false);
    }
  };

  // ── Sign-up handler (реальная запись в БД) ────────────────────
  const handleSignUp = async () => {
    if (!selectedEvent || !user) return;

    setSigningUp(true);
    setSignUpError(null);

    try {
            const supabase = createClient();

      const insertResult = await supabase
        .from("event_participants")
        .insert({
          event_id: selectedEvent.id,
          user_id: user.id,
          status: "registered",
        } as any);
      const insertError = insertResult.error;

      if (insertError) {
        // Если дубликат (уже записан) — не ошибка
        if (insertError.code === "23505") {
          setSignedUpEvents((prev) => new Set(prev).add(selectedEvent.id));
          setSignUpError(null);
          return;
        }
        setSignUpError(insertError.message);
        return;
      }

      setSignedUpEvents((prev) => new Set(prev).add(selectedEvent.id));

      // Обновляем счётчик участников
      setEvents((prev) =>
        prev.map((e) =>
          e.id === selectedEvent.id
            ? { ...e, participants: e.participants + 1 }
            : e
        )
      );

      setSelectedEvent((prev) =>
        prev ? { ...prev, participants: prev.participants + 1 } : null
      );
    } catch (err) {
      setSignUpError("Ошибка при записи на мероприятие");
      console.error("Sign-up error:", err);
    } finally {
      setSigningUp(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full md:max-w-5xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100 sm:text-3xl">
          🌿 Мероприятия
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Выберите волонтёрское мероприятие и присоединяйтесь
        </p>
      </div>

            {/* DB controls */}
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-zinc-400">
              База данных подключена{" "}
              <span className="text-emerald-400">✓</span>
            </p>
            <p className="text-xs text-zinc-600">
              {events.length > 0
                ? `Загружено ${events.length} мероприятий`
                : "Нет данных — нажмите «Загрузить демо-данные»"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={handleSeed}
              disabled={seeding || cleaning}
            >
              {seeding ? "⏳ Загрузка..." : "📦 Загрузить демо-данные"}
            </Button>
            {events.length > 0 && (
              <Button
                variant="danger"
                onClick={handleCleanup}
                disabled={cleaning || seeding}
              >
                {cleaning ? "⏳ Очистка..." : "🗑️ Очистить"}
              </Button>
            )}
          </div>
        </div>

        {/* Feedback messages */}
        {seedMessage && (
          <p className="mt-3 text-sm text-emerald-400">{seedMessage}</p>
        )}
        {seedError && (
          <p className="mt-3 text-sm text-red-400">{seedError}</p>
        )}
      </div>

      {/* Events grid */}
      {loading ? (
        <Card glow="violet">
          <div className="flex flex-col items-center py-12 text-center">
            <div className="text-5xl animate-pulse">⏳</div>
            <h3 className="mt-4 text-lg font-semibold text-zinc-300">
              Загрузка мероприятий...
            </h3>
          </div>
        </Card>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => setSelectedEvent(event)}
            />
          ))}
        </div>
      ) : (
        <Card glow="violet">
          <div className="flex flex-col items-center py-12 text-center">
            <span className="text-5xl">📭</span>
            <h3 className="mt-4 text-lg font-semibold text-zinc-300">
              Пока нет мероприятий
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Нажмите «Загрузить демо-данные» чтобы заполнить базу
            </p>
          </div>
        </Card>
      )}

            {/* Detail modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => {
            setSelectedEvent(null);
            setSignUpError(null);
          }}
          onSignUp={handleSignUp}
          isSignedUp={signedUpEvents.has(selectedEvent.id)}
          isSigningUp={signingUp}
          signUpError={signUpError}
        />
      )}
    </div>
  );
}

