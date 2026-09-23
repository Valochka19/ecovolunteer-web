import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/5 blur-3xl" />
        </div>
        <div className="relative z-10 w-full flex justify-center">{children}</div>
      </div>
    </AuthGuard>
  );
}
