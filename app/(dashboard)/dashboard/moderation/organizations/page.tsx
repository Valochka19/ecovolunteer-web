"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface PendingOrganization {
  id: string;
  name: string;
  avatar: string;
  email: string;
  city: string;
  bio: string;
  interests: string[];
  verification_status: "pending" | "verified" | "rejected" | "none";
  created_at: string;
  social_links: Record<string, string> | null;
}

export default function ModerationOrganizationsPage() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<PendingOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{
    orgId: string;
    name: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailModal, setDetailModal] =
    useState<PendingOrganization | null>(null);

  const fetchPendingOrganizations = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data, error: orgsErr } = await supabase
        .from("profiles")
        .select(
          "id, name, avatar, email, city, bio, interests, verification_status, created_at, social_links"
        )
        .eq("role", "organization")
        .eq("verification_status", "pending")
        .order("created_at", { ascending: false });

      if (orgsErr) throw orgsErr;

      setOrganizations((data || []) as PendingOrganization[]);
    } catch (err: any) {
      console.error("Failed to load pending organizations:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingOrganizations();
  }, [fetchPendingOrganizations]);

  const handleVerify = async (orgId: string) => {
    setActionLoading(orgId);
    setMessage(null);
    setError(null);
    try {
      const supabase = createClient();

      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ verification_status: "verified" } as unknown as { verification_status: "verified" | "rejected" | "pending" | "none" })
        .eq("id", orgId);

      if (updateErr) throw updateErr;

      setOrganizations((prev) => prev.filter((o) => o.id !== orgId));
      setMessage("Организация верифицирована!");
    } catch (err: any) {
      setError(err.message || "Ошибка при верификации");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return;

    setActionLoading(rejectModal.orgId);
    setMessage(null);
    setError(null);
    try {
      const supabase = createClient();

      const { error: updateErr } = await supabase
        .from("profiles")
        .update({
          verification_status: "rejected" as const,
        })
        .eq("id", rejectModal.orgId);

      if (updateErr) throw updateErr;

      setOrganizations((prev) => prev.filter((o) => o.id !== rejectModal.orgId));
      setMessage(`Организация "${rejectModal.name}" отклонена.`);
      setRejectModal(null);
      setRejectReason("");
    } catch (err: any) {
      setError(err.message || "Ошибка при отклонении");
    } finally {
      setActionLoading(null);
    }
  };

  const openSocials = (social_links: Record<string, string> | null) => {
    if (!social_links) return [];
    return Object.entries(social_links).filter(
      ([, value]) => value && value.trim()
    );
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-zinc-500">
        Только администратор может модерировать организации.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100 sm:text-3xl">
          🏢 Модерация организаций
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Верификация и проверка организаций-организаторов
        </p>
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
            <div className="animate-pulse text-5xl">⏳</div>
            <h3 className="mt-4 text-lg font-semibold text-zinc-300">
              Загрузка...
            </h3>
          </div>
        </Card>
      ) : organizations.length === 0 ? (
        <Card glow="violet">
          <div className="flex flex-col items-center py-12 text-center">
            <span className="text-5xl">✅</span>
            <h3 className="mt-4 text-lg font-semibold text-zinc-300">
              Нет организаций на модерации
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Все организации проверены
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {organizations.map((org) => {
            const socials = openSocials(org.social_links);

            return (
              <Card key={org.id} glow="violet">
                <div className="flex flex-col gap-4 sm:flex-row">
                  {/* Avatar */}
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-800 sm:h-28 sm:w-28">
                    <Image
                      src={
                        org.avatar ||
                        "https://api.dicebear.com/9.x/identicon/svg?seed=org"
                      }
                      alt={org.name}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-100">
                        {org.name}
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-400">
                        <span>📧 {org.email}</span>
                        {org.city && <span>📍 {org.city}</span>}
                        <span className="rounded-full bg-amber-900/30 border border-amber-800/50 px-2 py-0.5 text-amber-400">
                          Ожидает проверки
                        </span>
                      </div>

                      {org.bio && (
                        <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
                          {org.bio}
                        </p>
                      )}

                      {org.interests && org.interests.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {org.interests.map((tag: string) => (
                            <span
                              key={tag}
                              className="rounded-full bg-violet-900/30 border border-violet-800/50 px-2 py-0.5 text-xs text-violet-300"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {socials.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-400">
                          {socials.map(([label, url]) => (
                            <span
                              key={label}
                              className="rounded bg-zinc-800/70 px-2 py-0.5"
                            >
                              {label}: {url}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setDetailModal(org)}
                      className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors self-start"
                    >
                      Подробнее →
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row gap-2 sm:flex-col sm:justify-center">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleVerify(org.id)}
                      disabled={actionLoading === org.id}
                    >
                      {actionLoading === org.id ? "⏳" : "✅"} Верифицировать
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        setRejectModal({ orgId: org.id, name: org.name })
                      }
                      disabled={actionLoading === org.id}
                    >
                      ❌ Отклонить
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reject modal */}
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
            <h3 className="text-lg font-semibold text-zinc-100">
              Отклонить организацию
            </h3>
            <p className="mt-1 text-sm text-zinc-400">{rejectModal.name}</p>
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
                disabled={
                  !rejectReason.trim() || actionLoading === rejectModal.orgId
                }
              >
                {actionLoading === rejectModal.orgId ? "⏳" : "❌"} Отклонить
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDetailModal(null)}
            aria-label="Закрыть"
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-800">
                <Image
                  src={
                    detailModal.avatar ||
                    "https://api.dicebear.com/9.x/identicon/svg?seed=org"
                  }
                  alt={detailModal.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">
                  {detailModal.name}
                </h3>
                <p className="text-sm text-zinc-400">{detailModal.email}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              {detailModal.city && (
                <div>
                  <span className="font-medium text-zinc-500">Город:</span>{" "}
                  {detailModal.city}
                </div>
              )}
              {detailModal.bio && (
                <div>
                  <span className="font-medium text-zinc-500">Описание:</span>
                  <p className="mt-1">{detailModal.bio}</p>
                </div>
              )}
              {detailModal.interests && detailModal.interests.length > 0 && (
                <div>
                  <span className="font-medium text-zinc-500">Интересы:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {detailModal.interests.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full bg-violet-900/30 border border-violet-800/50 px-2 py-0.5 text-xs text-violet-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {openSocials(detailModal.social_links).length > 0 && (
                <div>
                  <span className="font-medium text-zinc-500">
                    Социальные сети:
                  </span>
                  <div className="mt-1 flex flex-col gap-1">
                    {openSocials(detailModal.social_links).map(
                      ([label, url]) => (
                        <span key={label} className="text-zinc-400">
                          {label}:{" "}
                          <a
                            href={
                              url.startsWith("http") ? url : `https://${url}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-400 hover:underline"
                          >
                            {url}
                          </a>
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
              <div>
                <span className="font-medium text-zinc-500">
                  Дата регистрации:
                </span>{" "}
                {new Date(detailModal.created_at).toLocaleDateString("ru-RU")}
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setDetailModal(null)}
              >
                Закрыть
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  handleVerify(detailModal.id);
                  setDetailModal(null);
                }}
                disabled={actionLoading === detailModal.id}
              >
                {actionLoading === detailModal.id ? "⏳" : "✅"} Верифицировать
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
