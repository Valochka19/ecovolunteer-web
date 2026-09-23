"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { EventDataUI } from "@/lib/supabase/types";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  moderation: { label: "⏳ На модерации", color: "bg-amber-900/40 text-amber-300" },
  open: { label: "✅ Одобрено", color: "bg-emerald-900/40 text-emerald-300" },
  rejected: { label: "❌ Отклонено", color: "bg-red-900/40 text-red-300" },
  full: { label: "🟡 Заполнено", color: "bg-yellow-900/40 text-yellow-300" },
  closed: { label: "🔒 Закрыто", color: "bg-zinc-800 text-zinc-400" },
};

function MyEventCard({
  event,
  onClick,
  onDelete,
  isDeleting,
}: {
  event: EventDataUI;
  onClick: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}) {
    const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.open;

  return (
    <div className="group relative w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-zinc-700 hover:shadow-violet-900/20">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        disabled={isDeleting}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-600/80 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-700 disabled:opacity-50"
        aria-label="Удалить мероприятие"
      >
        {isDeleting ? "⏳" : "🗑️"}
      </button>

      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left"
      >
        {/* ИСПРАВЛЕННЫЙ БЛОК КАРТИНКИ */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-800">
          {typeof event.image === 'string' && event.image.trim() !== '' ? (
            <Image
              src={event.image}
              alt={event.title || "Мероприятие"}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 500px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 border-b border-zinc-800">
              <span className="text-5xl opacity-50">📅</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">{event.title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
              <span>📅 {event.date}</span>
              <span>📍 {event.city}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>🎯 {event.reward} токенов</span>
            <span className="text-zinc-700">•</span>
            <span>👥 {event.participants}/{event.maxParticipants}</span>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
        </div>
      </button>

      {event.status === "rejected" && event.moderationMessage && (
        <div className="border-t border-red-900/40 bg-red-900/10 px-5 py-3">
          <p className="text-xs text-red-400">
            <span className="font-medium">Причина отклонения:</span> {event.moderationMessage}
          </p>
        </div>
      )}
    </div>
  );
}

function EventDetailModal({ event, onClose }: { event: EventDataUI; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-8 sm:items-center sm:pt-4">
      <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-label="Закрыть" />
      <div className="relative w-full max-w-2xl animate-[fadeIn_0.2s_ease-out] rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        
        {/* ИСПРАВЛЕННЫЙ БЛОК КАРТИНКИ В МОДАЛКЕ */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-2xl bg-zinc-800">
          {typeof event.image === 'string' && event.image.trim() !== '' ? (
            <Image src={event.image} alt={event.title || "Мероприятие"} fill className="object-cover" sizes="(max-width: 768px) 100vw, 700px" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
              <span className="text-6xl opacity-50">📅</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
          <button type="button" onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/70 transition-colors hover:bg-black/70 hover:text-white" aria-label="Закрыть">✕</button>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-3xl font-bold text-white drop-shadow-lg">{event.title}</h2>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-800/50 px-3 py-1.5">📅 {event.date} в {event.time}</div>
            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-800/50 px-3 py-1.5">📍 {event.location}</div>
            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-800/50 px-3 py-1.5">🎯 {event.reward} токенов</div>
            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-800/50 px-3 py-1.5">👥 {event.participants}/{event.maxParticipants} участников</div>
          </div>
          <div>
            <h3 className="mb-3 text-lg font-semibold text-zinc-100">О мероприятии</h3>
            <div className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">{event.fullDescription}</div>
          </div>
          <div className="flex gap-2">
            <span className="rounded-full bg-violet-900/30 px-3 py-1 text-xs font-medium text-violet-300">#{event.category}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  status: "moderation" | "open" | "closed" | "full" | "rejected";
  moderation_message?: string | null;
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
    moderationMessage: (row as any).moderation_message || undefined,
  };
}

export default function MyEventsPage() {
 const { user } = useAuth();
 const [events, setEvents] = useState<EventDataUI[]>([]);
 const [loading, setLoading] = useState(true);
 const [selectedEvent, setSelectedEvent] = useState<EventDataUI | null>(null);
 const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMyEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const supabase = createClient();

      const eventsQuery = await supabase
        .from("events")
        .select()
        .eq("organizer_id", user.id)
        .order("date", { ascending: true });

      if (eventsQuery.error) {
        console.error("Error fetching my events:", eventsQuery.error);
        setEvents([]);
        return;
      }

      const eventsData = (eventsQuery.data ?? []) as EventDbRow[];

      if (eventsData.length === 0) {
        setEvents([]);
        return;
      }

      const eventIds = eventsData.map((e) => e.id);
      const participantQuery = await supabase
        .from("event_participants")
        .select("event_id")
        .in("event_id", eventIds)
        .eq("status", "registered");

      const participantRows = (participantQuery.data ?? []) as { event_id: string }[];
      const participantCounts = new Map<string, number>();
      for (const p of participantRows) {
        participantCounts.set(p.event_id, (participantCounts.get(p.event_id) ?? 0) + 1);
      }

      const mapped = eventsData.map((row) =>
        rowToEventUI({
          ...row,
          participants: participantCounts.get(row.id) ?? 0,
          organizer_name: user.name || "Организатор",
          organizer_avatar: user.avatar || "https://api.dicebear.com/9.x/identicon/svg?seed=default",
        })
      );

      setEvents(mapped);
    } catch (err) {
      console.error("Failed to load my events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

    useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  const handleDelete = async (eventId: string, imageUrl: string) => {
    if (!confirm("Вы уверены, что хотите удалить это мероприятие? Все записи участников будут потеряны.")) return;

    setDeletingId(eventId);
    try {
      const supabase = createClient();

      // 1. Удаляем файл из Storage
      const urlParts = imageUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      if (fileName) {
        await supabase.storage.from("event-covers").remove([fileName]);
      }

      // 2. Удаляем запись из БД
      const { error } = await supabase.from("events").delete().eq("id", eventId);
      if (error) throw new Error(error.message);

      // 3. Удаляем из локального состояния
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setSelectedEvent((prev) => (prev?.id === eventId ? null : prev));
    } catch (err: any) {
      alert("Ошибка при удалении: " + (err.message || "Неизвестная ошибка"));
    } finally {
      setDeletingId(null);
    }
  };

  if (!user || (user.role !== "organization" && user.role !== "admin")) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-zinc-500">
        Только организации могут просматривать эту страницу.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full md:max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100 sm:text-3xl">📅 Мои мероприятия</h1>
        <p className="mt-1 text-sm text-zinc-500">Управление созданными вами мероприятиями</p>
      </div>

      {loading ? (
        <Card glow="violet">
          <div className="flex flex-col items-center py-12 text-center">
            <div className="text-5xl animate-pulse">⏳</div>
            <h3 className="mt-4 text-lg font-semibold text-zinc-300">Загрузка мероприятий...</h3>
          </div>
        </Card>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <MyEventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} onDelete={() => handleDelete(event.id, event.image)} isDeleting={deletingId === event.id} />
          ))}
        </div>
      ) : (
        <Card glow="violet">
          <div className="flex flex-col items-center py-12 text-center">
            <span className="text-5xl">📭</span>
            <h3 className="mt-4 text-lg font-semibold text-zinc-300">У вас пока нет мероприятий</h3>
            <p className="mt-1 text-sm text-zinc-500">Создайте своё первое мероприятие, чтобы оно появилось здесь</p>
            <Button variant="primary" className="mt-4" onClick={() => (window.location.href = "/dashboard/create-event")}>
              ➕ Создать мероприятие
            </Button>
          </div>
        </Card>
      )}

      {selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}