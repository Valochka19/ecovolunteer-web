"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface SocialLink { platform: string; url: string; }

const ALL_INTERESTS = [
  { id: "eco", label: "🌿 Экология" },
  { id: "zoo", label: "🐾 Зооволонтерство" },
  { id: "sort", label: "♻️ Сортировка отходов" },
  { id: "kids", label: "👶 Помощь детям" },
  { id: "city", label: "🏙️ Благоустройство" },
  { id: "edu", label: "📚 Образование" },
  { id: "med", label: "🩺 Медицина" },
  { id: "sport", label: "⚽ Спорт" },
  { id: "culture", label: "🎭 Культура" },
  { id: "it", label: "💻 IT-волонтерство" },
];

const MOCK_TX = [
  { id: "t1", date: "2024-12-15", title: "Участие: Уборка парка", points: 50, type: "earned" as const },
  { id: "t2", date: "2024-12-10", title: "Бонус за активность", points: 20, type: "earned" as const },
  { id: "t3", date: "2024-12-05", title: "Покупка: Скидка в кафе", points: -30, type: "spent" as const },
  { id: "t4", date: "2024-11-28", title: "Участие: Помощь приюту", points: 75, type: "earned" as const },
  { id: "t5", date: "2024-11-20", title: "Выполнение задания", points: 15, type: "earned" as const },
  { id: "t6", date: "2024-11-15", title: "Покупка: Мерч", points: -50, type: "spent" as const },
  { id: "t7", date: "2024-11-01", title: "Награда за уровень", points: 100, type: "earned" as const },
];

const MOCK_ACTIVITY = [
  { id: "a1", date: "2024-12-15", text: "Принял участие в мероприятии «Уборка парка»", icon: "🌿" },
  { id: "a2", date: "2024-12-10", text: "Выполнил задание «Посади дерево»", icon: "✅" },
  { id: "a3", date: "2024-12-05", text: "Заработал бейдж «Эко-Герой»", icon: "🏅" },
  { id: "a4", date: "2024-11-28", text: "Принял участие в мероприятии «Помощь приюту»", icon: "🐾" },
  { id: "a5", date: "2024-11-20", text: "Достиг 5-го уровня!", icon: "🚀" },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}
function xpForLevel(l: number) { return l * 500; }

function UserIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>; }
function WalletIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" /></svg>; }
function ActivityIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>; }
function LockIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>; }
function ChevronIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>; }
function BackIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>; }

function ProfileAvatar({ name, src, size = "md" }: { name: string; src?: string | null; size?: "sm" | "md" }) {
  const [err, setErr] = useState(false);
  const letter = name.trim().charAt(0).toUpperCase();
  const sizeClass = size === "sm"
    ? "w-16 h-16 sm:w-20 sm:h-20 text-lg sm:text-xl"
    : "w-20 h-20 sm:w-24 sm:h-24 text-xl sm:text-2xl";
  if (src && !err) {
    return <div className={`${sizeClass} rounded-full border-2 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)] overflow-hidden shrink-0`}>
      <Image src={src} alt={name} width={96} height={96} className="w-full h-full object-cover" onError={() => setErr(true)} />
    </div>;
  }
  return <div className={`${sizeClass} rounded-full border-2 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-700 font-bold text-white shrink-0`}>{letter}</div>;
}

function MenuItem({ icon, label, right, onClick }: { icon: React.ReactNode; label: string; right?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between bg-zinc-900/80 backdrop-blur border border-zinc-800 hover:border-zinc-700 active:scale-[0.99] transition-all rounded-xl py-4 px-5 text-left">
      <div className="flex items-center gap-3">
        <span className="text-indigo-400">{icon}</span>
        <span className="text-base font-medium text-zinc-200">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {right && <span className="text-sm text-zinc-500">{right}</span>}
        <span className="text-zinc-500"><ChevronIcon /></span>
      </div>
    </button>
  );
}

// Shared modal shell
function ModalShell({ title, onBack, children, stickyBottom }: { title: string; onBack: () => void; children: React.ReactNode; stickyBottom?: React.ReactNode }) {
  return (
    <div className="w-full max-w-xl mx-auto bg-zinc-950 text-zinc-100 min-h-full flex flex-col">
      <div className="flex items-center gap-3 px-4 h-14 border-b border-zinc-800 shrink-0">
        <button onClick={onBack} className="flex items-center justify-center w-9 h-9 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"><BackIcon /></button>
        <span className="text-base font-semibold text-zinc-100">{title}</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">{children}</div>
      {stickyBottom && (
        <div className="shrink-0 border-t border-zinc-800 bg-zinc-950 px-4 py-3">{stickyBottom}</div>
      )}
    </div>
  );
}

function EditForm({ name, phone, avatarUrl, city, bio, interests, onName, onPhone, onAvatarUrl, onCity, onBio, onInterests, saving, saved, earnedTokens, onSave, onBack }: {
  name: string; phone: string; avatarUrl: string; city: string; bio: string; interests: string[];
  onName: (v: string) => void; onPhone: (v: string) => void; onAvatarUrl: (v: string) => void;
  onCity: (v: string) => void; onBio: (v: string) => void; onInterests: (v: string[]) => void;
  saving: boolean; saved: boolean; earnedTokens: number; onSave: () => void; onBack: () => void;
}) {
  return (
    <ModalShell title="Редактировать профиль" onBack={onBack}
      stickyBottom={
        <>
          {earnedTokens > 0 && (
            <div className="mb-3 px-4 py-3 rounded-xl bg-emerald-900/30 border border-emerald-500/40 text-emerald-300 text-sm text-center animate-in fade-in">
              🎉 Получено <span className="font-bold">+{earnedTokens} ST</span> за заполнение профиля!
            </div>
          )}
          <button onClick={onSave} disabled={saving} className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 active:scale-[0.99]">
            {saving ? <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : saved ? <>✓ Сохранено</> : <>💾 Сохранить</>}
          </button>
        </>
      }>
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5">Имя</label>
        <input type="text" value={name} onChange={e => onName(e.target.value)} className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-lg px-4 text-sm text-zinc-200 placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-colors" />
      </div>
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5">Телефон</label>
        <input type="tel" value={phone} onChange={e => { const v = e.target.value.replace(/[^0-9+]/g, '').slice(0, 12); onPhone(v); }} placeholder="+71234567890" maxLength={12} inputMode="numeric" className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-lg px-4 text-sm text-zinc-200 placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-colors" />
      </div>
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5">Ссылка на аватар</label>
        <input type="url" value={avatarUrl} onChange={e => onAvatarUrl(e.target.value)} placeholder="https://..." className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-lg px-4 text-sm text-zinc-200 placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-colors" />
      </div>
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5">Город</label>
        <input type="text" value={city} onChange={e => onCity(e.target.value)} placeholder="Москва" className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-lg px-4 text-sm text-zinc-200 placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-colors" />
      </div>
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5">О себе</label>
        <textarea value={bio} onChange={e => onBio(e.target.value)} rows={4} placeholder="Расскажите о себе..." className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-colors resize-none" />
      </div>
      <div>
        <label className="block text-xs text-zinc-500 mb-2">Интересы</label>
        <div className="flex flex-wrap gap-2">
          {ALL_INTERESTS.map(tag => {
            const sel = interests.includes(tag.id);
            return (
              <button key={tag.id} type="button" onClick={() => onInterests(sel ? interests.filter(s => s !== tag.id) : [...interests, tag.id])}
                className={`px-4 py-2 rounded-lg border text-xs font-medium transition-all ${sel ? 'border-emerald-500/60 bg-emerald-900/30 text-emerald-300' : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'}`}>
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>
    </ModalShell>
  );
}

function WalletView({ balance, onBack }: { balance: number; onBack: () => void }) {
  return (
    <ModalShell title="ST-Кошелёк" onBack={onBack}>
      <div className="rounded-xl border border-emerald-800/30 bg-gradient-to-br from-emerald-950/50 to-zinc-900/60 px-5 py-6 text-center">
        <p className="text-xs text-zinc-500 mb-1">Ваш баланс</p>
        <p className="text-4xl font-bold text-emerald-400">{balance} <span className="text-base font-medium text-emerald-600">ST</span></p>
      </div>
      <p className="text-xs text-zinc-500 font-medium">История транзакций</p>
      <div className="flex flex-col gap-1.5">
        {MOCK_TX.map(tx => (
          <div key={tx.id} className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm text-zinc-300">{tx.title}</p>
              <p className="text-xs text-zinc-600">{fmtDate(tx.date)}</p>
            </div>
            <span className={`text-base font-bold ${tx.type === 'earned' ? 'text-emerald-400' : 'text-red-400'}`}>{tx.type === 'earned' ? '+' : ''}{tx.points}</span>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

function ActivityView({ onBack }: { onBack: () => void }) {
  return (
    <ModalShell title="Лента активности" onBack={onBack}>
      <div className="space-y-6">
        {MOCK_ACTIVITY.map(act => (
          <div key={act.id} className="flex gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 shrink-0 text-base">{act.icon}</div>
            <div>
              <p className="text-sm text-zinc-300 leading-relaxed">{act.text}</p>
              <p className="text-xs text-zinc-600 mt-0.5">{fmtDate(act.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

function PrivacyView({ links, hideContacts, hideFeed, onLinksChange, onContactsToggle, onFeedToggle, saving, saved, onSave, onBack }: {
  links: SocialLink[]; hideContacts: boolean; hideFeed: boolean;
  onLinksChange: (v: SocialLink[]) => void; onContactsToggle: () => void; onFeedToggle: () => void;
  saving: boolean; saved: boolean; onSave: () => void; onBack: () => void;
}) {
  const platforms = [
    { value: "telegram", label: "Telegram" }, { value: "vk", label: "VK" }, { value: "instagram", label: "Instagram" },
    { value: "youtube", label: "YouTube" }, { value: "github", label: "GitHub" }, { value: "other", label: "Другое" },
  ];
  const addLink = () => onLinksChange([...links, { platform: "telegram", url: "" }]);
  const updateLink = (i: number, v: SocialLink) => onLinksChange(links.map((l, j) => (j === i ? v : l)));
  const removeLink = (i: number) => onLinksChange(links.filter((_, j) => j !== i));

  return (
    <ModalShell title="Приватность и сети" onBack={onBack}
      stickyBottom={
        <button onClick={onSave} disabled={saving} className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 active:scale-[0.99]">
          {saving ? <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : saved ? <>✓ Сохранено</> : <>💾 Сохранить</>}
        </button>
      }>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-zinc-500 font-medium">Социальные сети</p>
          <button onClick={addLink} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">+ Добавить</button>
        </div>
        <div className="flex flex-col gap-2">
          {links.length === 0 && <p className="text-sm text-zinc-600 py-2">Нет добавленных ссылок</p>}
          {links.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <select value={link.platform} onChange={e => updateLink(i, { ...link, platform: e.target.value })} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 h-10 text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30">
                {platforms.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <input type="url" value={link.url} onChange={e => updateLink(i, { ...link, url: e.target.value })} placeholder="https://..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 h-10 text-xs text-zinc-300 placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30" />
              <button onClick={() => removeLink(i)} className="flex items-center justify-center w-10 h-10 rounded-lg text-zinc-500 hover:bg-red-900/20 hover:text-red-400 transition-colors">✕</button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-zinc-500 font-medium mb-2">Приватность</p>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3.5 cursor-pointer hover:border-zinc-700 transition-colors">
            <input type="checkbox" checked={hideContacts} onChange={onContactsToggle} className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-emerald-600 focus:ring-emerald-500/30" />
            <span className="text-sm text-zinc-400">Скрыть контактные данные от публики</span>
          </label>
          <label className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3.5 cursor-pointer hover:border-zinc-700 transition-colors">
            <input type="checkbox" checked={hideFeed} onChange={onFeedToggle} className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-emerald-600 focus:ring-emerald-500/30" />
            <span className="text-sm text-zinc-400">Скрыть ленту активности</span>
          </label>
        </div>
      </div>
    </ModalShell>
  );
}

export default function VolunteerProfilePage() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [view, setView] = useState("");
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>(user?.interests ?? []);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [hideContacts, setHideContacts] = useState(false);
  const [hideFeed, setHideFeed] = useState(false);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [earnedTokens, setEarnedTokens] = useState(0);
  const [localBalance, setLocalBalance] = useState(user?.tokenBalance ?? 0);

  // синхронизируем баланс с user при его изменении
  useEffect(() => {
    if (user?.tokenBalance !== undefined) {
      setLocalBalance(user.tokenBalance);
    }
  }, [user?.tokenBalance]);

  useEffect(() => {
    const uid = user?.id;
    const uname = user?.name ?? "";
    const ucity = user?.city ?? "";
    if (!uid) return;
    let cancel = false;
    (async () => {
      const { data } = await (supabase as any).from("profiles")
        .select("bio, social_links, privacy_hide_contacts, privacy_hide_feed, level, xp, interests, city, name")
        .eq("id", uid).single();
      if (!cancel && data) {
        setName(data.name ?? uname); setPhone(data.phone ?? user?.phone ?? "");
        setAvatarUrl(data.avatar_url ?? user?.avatar ?? "");
        setCity(data.city ?? ucity);
        setBio(data.bio ?? ""); setInterests(data.interests ?? []);
        setLinks(data.social_links ?? []);
        setHideContacts(data.privacy_hide_contacts ?? false);
        setHideFeed(data.privacy_hide_feed ?? false);
        setLevel(data.level ?? 1); setXp(data.xp ?? 0);
      }
    })();
    return () => { cancel = true; };
  }, [supabase, user]);

   const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);

    // 1. Считаем токены за заполненные поля (каждый раз при сохранении — для демонстрации)
    let totalTokens = 0;
    if (phone.trim() !== "") totalTokens += 10;
    if (avatarUrl.trim() !== "") totalTokens += 10;
    if (city.trim() !== "") totalTokens += 5;
    if (interests.length > 0) totalTokens += 5;

    // 2. Начисляем токены (если есть за что)
    if (totalTokens > 0) {
      const { error: rpcError } = await (supabase as any).rpc("add_tokens", {
        p_user_id: user.id,
        p_amount: totalTokens,
      });
      if (rpcError) {
        console.warn("Ошибка начисления токенов:", rpcError.message);
      } else {
        setEarnedTokens(totalTokens);
        setLocalBalance(prev => prev + totalTokens);
        setTimeout(() => setEarnedTokens(0), 5000);
      }
    }

    // 3. Сохраняем профиль
    const { error } = await (supabase as any)
      .from("profiles")
      .update({
        name,
        phone,
        avatar_url: avatarUrl,
        city,
        bio,
        interests,
        social_links: links,
        privacy_hide_contacts: hideContacts,
        privacy_hide_feed: hideFeed,
      })
      .eq("id", user.id);

    if (error) {
      console.warn(error.message);
      alert("Ошибка при сохранении профиля");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }

    setSaving(false);
  }, [supabase, user, phone, avatarUrl, name, city, bio, interests, links, hideContacts, hideFeed]);

  const maxXp = xpForLevel(level);
  const xpPct = Math.min((xp / maxXp) * 100, 100);
  if (!user) return null;

  if (view === "edit") return <EditForm name={name} phone={phone} avatarUrl={avatarUrl} city={city} bio={bio} interests={interests} onName={setName} onPhone={setPhone} onAvatarUrl={setAvatarUrl} onCity={setCity} onBio={setBio} onInterests={setInterests} saving={saving} saved={saved} earnedTokens={earnedTokens} onSave={handleSave} onBack={() => setView("")} />;
  if (view === "wallet") return <WalletView balance={localBalance} onBack={() => setView("")} />;
  if (view === "activity") return <ActivityView onBack={() => setView("")} />;
  if (view === "privacy") return <PrivacyView links={links} hideContacts={hideContacts} hideFeed={hideFeed} onLinksChange={setLinks} onContactsToggle={() => setHideContacts(v => !v)} onFeedToggle={() => setHideFeed(v => !v)} saving={saving} saved={saved} onSave={handleSave} onBack={() => setView("")} />;

  return (
    <div className="w-full max-w-xl mx-auto text-zinc-100 p-4 flex flex-col">
      {/* Горизонтальная шапка */}
      <div className="flex items-center gap-4 pt-4 pb-3 w-full">
        <ProfileAvatar name={name} src={user.avatar} size="sm" />
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-zinc-100 truncate">{name}</h1>
          <p className="text-xs text-zinc-400 truncate">{city || "Город не указан"}</p>
          <div className="mt-1.5">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-0.5">
              <span>Ур. {level}</span>
              <span>{xp} / {maxXp} XP</span>
            </div>
            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-full h-2.5 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-3 pb-2">
        <MenuItem icon={<UserIcon />} label="Редактировать профиль" onClick={() => setView("edit")} />
        <MenuItem icon={<WalletIcon />} label="ST-Кошелёк" right={`${localBalance} ST`} onClick={() => setView("wallet")} />
        <MenuItem icon={<ActivityIcon />} label="Лента активности" onClick={() => setView("activity")} />
        <MenuItem icon={<LockIcon />} label="Приватность" onClick={() => setView("privacy")} />
      </div>
    </div>
  );
}
