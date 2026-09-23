import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute -right-40 bottom-20 h-[500px] w-[500px] rounded-full bg-emerald-600/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <main className="relative z-10 flex max-w-2xl flex-col items-center text-center">
        <span className="text-5xl">🌱</span>
        <h1 className="mt-6 bg-gradient-to-r from-emerald-400 via-violet-400 to-indigo-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
          EcoVolunteer
        </h1>
        <p className="mt-4 text-lg text-zinc-400">
          Платформа волонтёрских мероприятий с системой{" "}
          <span className="font-mono text-violet-400">Social Tokens</span>
        </p>
        <p className="mt-2 max-w-md text-sm text-zinc-500">
          Делайте добрые дела, зарабатывайте ST и обменивайте их на награды от
          партнёров. Cyberpunk meets Eco-Tech.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/login">
            <Button size="lg">Войти</Button>
          </Link>
          <Link href="/register">
            <Button variant="secondary" size="lg">
              Регистрация
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
