"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        router.push("/dashboard");
      } else {
        setError("Неверный email или пароль");
      }
    } catch {
      setError("Произошла ошибка при входе");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card glow="violet" className="w-full max-w-md">
      <div className="mb-6 text-center">
        <span className="text-3xl">🌱</span>
        <h1 className="mt-2 text-2xl font-bold text-zinc-100">Вход</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Платформа волонтёрских мероприятий
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="volunteer@demo.ru"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Пароль"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-950/30 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Войти
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Нет аккаунта?{" "}
        <Link
          href="/register"
          className="font-medium text-violet-400 hover:text-violet-300"
        >
          Зарегистрироваться
        </Link>
      </p>

      <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-500">
        <p className="font-medium text-zinc-400">Демо-аккаунты:</p>
        <ul className="mt-1 space-y-0.5">
          <li>volunteer@demo.ru — Волонтёр</li>
          <li>org@demo.ru — Организация</li>
          <li>admin@demo.ru — Администратор</li>
          <li>partner@demo.ru — Партнёр</li>
        </ul>
      </div>
    </Card>
  );
}
