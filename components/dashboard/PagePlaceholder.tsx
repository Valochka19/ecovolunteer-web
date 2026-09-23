import { Card } from "@/components/ui/Card";

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon: string;
}

export function PagePlaceholder({
  title,
  description,
  icon = "🚧",
}: PagePlaceholderProps) {
  return (
    <div className="mx-auto w-full md:max-w-2xl">
      <Card glow="violet">
        <div className="flex flex-col items-center text-center">
          <span className="text-4xl">{icon}</span>
          <h2 className="mt-4 text-xl font-bold text-zinc-100">{title}</h2>
          <p className="mb-6 text-base text-zinc-400">{description}</p>

          <div className="flex flex-col gap-3">
            <p className="text-sm text-zinc-500">Этот раздел будет реализован в ближайшее время.</p>
            <p className="text-xs text-zinc-600">В другой версии...</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

