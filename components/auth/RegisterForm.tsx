"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import type { RegisterRole } from "@/types";

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState<RegisterRole>("volunteer");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await register({ name, email, password, role, city });
      if (success) {
        router.push("/dashboard");
      } else {
        setError("Не удалось зарегистрироваться");
      }
    } catch {
      setError("Произошла ошибка при регистрации");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card glow="emerald" className="w-full max-w-md">
      <div className="mb-6 text-center">
        <span className="text-3xl">✨</span>
        <h1 className="mt-2 text-2xl font-bold text-zinc-100">Регистрация</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Присоединяйтесь к экосистеме волонтёрства
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Имя / Название"
          type="text"
          placeholder="Алексей или НКО «ЭкоМир»"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Пароль"
          type="password"
          placeholder="Минимум 6 символов"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />
        <Input
          label="Город"
          type="text"
          placeholder="Москва"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-zinc-300">Роль</legend>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { value: "volunteer", label: "Волонтёр", icon: "🌿", color: "emerald" },
                { value: "organization", label: "Организация", icon: "🏢", color: "blue" },
              ] as const
            ).map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                  role === option.value
                    ? option.color === "emerald"
                      ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-300"
                      : "border-blue-500/50 bg-blue-950/40 text-blue-300"
                    : "border-zinc-700 bg-zinc-900/40 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={role === option.value}
                  onChange={() => setRole(option.value)}
                  className="sr-only"
                />
                <span className="text-2xl">{option.icon}</span>
                <span className="text-sm font-medium">{option.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Администраторы и партнёры создаются отдельно администрацией платформы.
          </p>
        </fieldset>

        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-950/30 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Создать аккаунт
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Уже есть аккаунт?{" "}
        <Link
          href="/login"
          className="font-medium text-emerald-400 hover:text-emerald-300"
        >
          Войти
        </Link>
      </p>
    </Card>
  );
}
