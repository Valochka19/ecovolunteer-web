import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb: any = supabase;

    // Вызываем функцию очистки демо-данных (создана в миграции 003)
    const { error } = await sb.rpc('cleanup_demo_data');

    if (error) {
      return NextResponse.json(
        { ok: false, error: `Ошибка очистки: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "✅ Демо-данные успешно удалены. Можно загрузить заново.",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Неизвестная ошибка";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
