"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface PendingEvent {
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
  organizer_name: string;
  organizer_avatar: string;
  tags: string[];
  status: string;
  created_at: string;
}

export default function ModerationEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ eventId: string; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingEvents = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data: eventsData, error: eventsErr } = await supabase
        .from("events")
        .select()
        .eq("status", "moderation")
        .order("created_at", { ascending: false });

      if (eventsErr) throw eventsErr;

      if (!eventsData || eventsData.length === 0) {
        setEvents([]);
        return;
      }

      const organizerIds = [...new Set(eventsData.map((e: any) => e.organizer_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, avatar")
        .in("id", organizerIds);

      const profileMap = new Map(
        (profiles || []).map((p: any) => [p.id, { name: p.name, avatar: p.avatar }])
      );

      const mapped = eventsData.map((e: any) => ({
        ...e,
        organizer_name: profileMap.get(e.organizer_id)?.name || "Неизвестный",
        organizer_avatar: profileMap.get(e.organizer_id)?.avatar || "https://api.dicebear.com/9.x/identicon/svg?seed=default",
      }));

      setEvents(mapped);
    } catch (err: any) {
      console.error("Failed to load moderation events:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingEvents();
  }, [fetchPendingEvents]);

  const handleApprove = async (eventId: string) => {
    setActionLoading(eventId);
    setMessage(null);
    setError(null);
    try {
      const supabase = createClient();

      const { error: updateErr } = await supabase
        .from("events")
        .update({ status: "open" })
        .eq("id", eventId);

      if (updateErr) throw updateErr;

      await supabase.from("event_moderation").insert({
        event_id: eventId,
        admin_id: user!.id,
        decision: "approved",
      });

      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setMessage("Мероприятие одобрено!");
    } catch (err: any) {
      setError(err.message || "Ошибка при одобрении");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return;

    setActionLoading(rejectModal.eventId);
    setMessage(null);
    setError(null);
    try {
      const supabase = createClient();

      const { error: updateErr } = await supabase
        .from("events")
        .update({
          status: "rejected",
          moderation_message: rejectReason.trim(),
        })
        .eq("id", rejectModal.eventId);

      if (updateErr) throw updateErr;

      await supabase.from("event_moderation").insert({
        event_id: rejectModal.eventId,
        admin_id: user!.id,
        decision: "rejected",
        reason: rejectReason.trim(),
      });

      setEvents((prev) => prev.filter((e) => e.id !== rejectModal.eventId));
      setMessage("Мероприятие отклонено.");
      setRejectModal(null);
      setRejectReason("");
    } catch (err: any) {
      setError(err.message || "Ошибка при отклонении");
    } finally {
      setActionLoading(null);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-zinc-500">
        Только администратор может модерировать мероприятия.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100 sm:text-3xl">🛡️ Модерация мероприятий</h1>
        <p className="mt-1 text-sm text-zinc-500">Проверка и одобрение новых мероприятий на платформе</p>
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-emerald-800/50 bg-emerald-900/20 px-4 py-3 text-sm text-emerald-300">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <Card glow="violet">
          <div className="flex flex-col items-center py-12 text-center">
            <div className="text-5xl animate-pulse">⏳</div>
            <h3 className="mt-4 text-lg font-semibold text-zinc-300">Загрузка...</h3>
          </div>
        </Card>
      ) : events.length === 0 ? (
        <Card glow="violet">
          <div className="flex flex-col items-center py-12 text-center">
            <span className="text-5xl">✅</span>
            <h3 className="mt-4 text-lg font-semibold text-zinc-300">Нет мероприятий на модерации</h3>
            <p className="mt-1 text-sm text-zinc-500">Все мероприятия проверены</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} glow="violet">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative h-40 w-full flex-shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-48">
                  <Image
                    src={event.image || "https://api.dicebear.com/9.x/identicon/svg?seed=event"}
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-100">{event.title}</h3>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-400">
                      <span>📅 {event.date} в {event.time}</span>
                      <span>📍 {event.location}</span>
                      <span>👥 макс. {event.max_participants}</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-500">{event.description}</p>

                    {event.tags && event.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {event.tags.map((tag: string) => (
                          <span key={tag} className="rounded-full bg-violet-900/30 border border-violet-800/50 px-2 py-0.5 text-xs text-violet-300">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-2">
                      <Image
                        src={event.organizer_avatar}
                        alt={event.organizer_name}
                        width={24}
                        height={24}
                        className="rounded-full bg-zinc-800"
                      />
                      <span className="text-xs text-zinc-500">{event.organizer_name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row gap-2 sm:flex-col sm:justify-center">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(event.id)}
                    disabled={actionLoading === event.id}
                  >
                    {actionLoading === event.id ? "⏳" : "✅"} Одобрить
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setRejectModal({ eventId: event.id, title: event.title })}
                    disabled={actionLoading === event.id}
                  >
                    ❌ Отклонить
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setRejectModal(null);
              setRejectReason("");
            }}
            aria-label="Закрыть"
          />
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-zinc-100">Отклонить мероприятие</h3>
            <p className="mt-1 text-sm text-zinc-400">
              {rejectModal.title}
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Укажите причину отклонения..."
              rows={3}
              className="mt-4 w-full rounded-lg border border-zinc-700/80 bg-zinc-900/60 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500/60 focus:outline-none resize-none"
            />
            <div className="mt-4 flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason("");
                }}
              >
                Отмена
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading === rejectModal.eventId}
              >
                {actionLoading === rejectModal.eventId ? "⏳" : "❌"} Отклонить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
