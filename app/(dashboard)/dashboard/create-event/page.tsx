"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

// ---------------------------------------------------------------------------
// TagInput
// ---------------------------------------------------------------------------
function TagInput({ tags, onChange }: { tags: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState("");
  const addTag = useCallback(() => {
    const cleaned = text.trim().replace(/#/g, "");
    if (cleaned && !tags.includes(cleaned)) {
      onChange([...tags, cleaned]);
    }
    setText("");
  }, [text, tags, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (t: string) => onChange(tags.filter((tag) => tag !== t));

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-300">Хештеги</label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-violet-900/30 border border-violet-800/50 px-3 py-1 text-xs font-medium text-violet-300">
            #{tag}
            <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-violet-400 hover:text-violet-200">✕</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder="животные, экология..."
          className="w-full rounded-lg border border-zinc-700/80 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
        />
        <Button type="button" variant="secondary" size="sm" onClick={addTag}>Добавить</Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ImageUpload
// ---------------------------------------------------------------------------
function ImageUpload({ file, onChange }: { file: File | null; onChange: (f: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((f: File | undefined) => {
    if (!f) return;
    // Валидация размера (макс 5 МБ)
    if (f.size > 5 * 1024 * 1024) {
      alert("Файл слишком большой. Максимальный размер — 5 МБ.");
      return;
    }
    // Валидация типа
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      alert("Неподдерживаемый формат. Разрешены JPG, PNG и WebP.");
      return;
    }
    onChange(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const removeFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [onChange, preview]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-300">Обложка мероприятия *</label>
      <div
        className={`relative flex aspect-[16/9] w-full items-center justify-center rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${
          dragOver
            ? "border-violet-400 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            : preview
            ? "border-violet-600/50 bg-zinc-900/40"
            : "border-dashed border-zinc-700/60 bg-zinc-900/40 hover:border-zinc-500"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <>
            <Image src={preview} alt="Preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 600px" />
            <button
              type="button"
              onClick={removeFile}
              className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white/80 text-sm backdrop-blur transition hover:bg-black/80 hover:text-white"
              aria-label="Удалить изображение"
            >
              ✕
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-zinc-500 p-4">
            <span className="text-3xl">📷</span>
            <span className="text-sm">Перетащите или нажмите для выбора</span>
            <span className="text-xs">JPG, PNG, WebP до 5 МБ</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
export default function CreateEventPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [maxParticipants, setMaxParticipants] = useState<number>(20);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const canPublish =
    title.trim() &&
    dateTime &&
    location.trim() &&
    maxParticipants >= 1 &&
    description.trim() &&
    file;

  const handlePublish = useCallback(async () => {
    if (!user || !canPublish || !file) return;
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const [datePart, timePart] = dateTime.split("T");

      // 1. Создаём запись мероприятия (Приведение типов через 'as any' добавлено здесь для обхода строгой ошибки Vercel)
      const { data: inserted, error: insertError } = await supabase
        .from("events")
        .insert({
          title: title.trim(),
          description: description.trim().substring(0, 200),
          full_description: description.trim(),
          date: datePart,
          time: timePart || "10:00",
          location: location.trim(),
          city: location.trim().split(",").pop()?.trim().slice(0, 50) || "",
          max_participants: maxParticipants,
          tags: tags,
          reward: 50,
          organizer_id: user.id,
          status: "moderation",
          image: "", 
        } as any) // <--- ВОТ ЗДЕСЬ ИСПРАВЛЕНО
        .select()
        .single();

      if (insertError || !inserted) {
        throw new Error(insertError?.message || "Ошибка создания мероприятия");
      }

      setUploadProgress(30);
      const eventId = inserted.id;

      // 2. Загружаем изображение в bucket event-covers
      const ext = file.name.split(".").pop() || "png";
      const filePath = `${eventId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("event-covers")
        .upload(filePath, file, {
          upsert: true,
          cacheControl: "3600",
        });

      if (uploadError) {
        throw new Error(`Ошибка загрузки фото: ${uploadError.message}`);
      }

      setUploadProgress(70);

      // 3. Получаем публичный URL загруженного файла
      const { data: publicUrlData } = supabase.storage
        .from("event-covers")
        .getPublicUrl(filePath);

      const publicImageUrl = publicUrlData?.publicUrl;

      if (!publicImageUrl) {
        throw new Error("Не удалось получить публичную ссылку на изображение");
      }

      // 4. Обновляем запись мероприятия — записываем URL картинки
      const { error: updateError } = await supabase
        .from("events")
        .update({ image: publicImageUrl })
        .eq("id", eventId);

      if (updateError) {
        throw new Error(`Ошибка сохранения ссылки на фото: ${updateError.message}`);
      }

      setUploadProgress(100);
      alert("✅ Мероприятие успешно опубликовано!");
      router.push("/dashboard/my-events");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Неизвестная ошибка";
      setError(message);
      console.error("Ошибка публикации мероприятия:", err);
    } finally {
      loading_set(false);
    }
  }, [user, canPublish, file, supabase, title, dateTime, location, maxParticipants, description, tags, router]);

  const loading_set = (val: boolean) => setLoading(val);

  if (!user || (user.role !== "organization" && user.role !== "admin")) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-zinc-500">
        Только организации могут создавать мероприятия.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
          ➕ Создать мероприятие
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Заполните данные, и волонтёры увидят ваше мероприятие в ленте
        </p>
      </div>

      <Card glow="violet" className="p-6">
        <div className="flex flex-col gap-6">
          <Input
            label="Название мероприятия"
            placeholder="Например: Зоо-волонтерство"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Дата и время проведения"
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
          />
          <Input
            label="Адрес / Место проведения"
            placeholder="ул. Добрая, 15, Приют «Надежда»"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Input
            label="Необходимое количество участников"
            type="number"
            min={1}
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(Number(e.target.value) || 1)}
          />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">
              Описание мероприятия *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Присоединяйтесь к нашей команде..."
              className="w-full rounded-lg border border-zinc-700/80 bg-zinc-900/60 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 backdrop-blur focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
            />
          </div>

          <TagInput tags={tags} onChange={setTags} />
          <ImageUpload file={file} onChange={setFile} />

          {loading && uploadProgress > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Публикация...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-900/40 bg-red-900/10 p-3 text-sm text-red-400">
              ⚠️ {error}
            </div>
          )}

          {!canPublish && !loading && (
            <div className="flex flex-col gap-1 rounded-lg border border-amber-900/50 bg-amber-900/10 p-3 text-xs text-amber-400">
              <span className="font-medium">Заполните обязательные поля:</span>
              <ul className="list-disc pl-4 space-y-0.5">
                {!title.trim() && <li>Название мероприятия</li>}
                {!dateTime && <li>Дата и время проведения</li>}
                {!location.trim() && <li>Адрес / Место проведения</li>}
                {maxParticipants < 1 && <li>Количество участников (минимум 1)</li>}
                {!description.trim() && <li>Описание мероприятия</li>}
                {!file && <li>Обложка мероприятия (изображение)</li>}
              </ul>
            </div>
          )}

          <Button
            variant={canPublish ? "primary" : "secondary"}
            disabled={!canPublish || loading}
            size="lg"
            className="w-full"
            onClick={handlePublish}
          >
            {loading ? "⏳ Публикация..." : "📢 Опубликовать"}
          </Button>
        </div>
      </Card>
    </div>
  );
}