import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { userId, role } = await request.json();

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { ok: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    const validRoles = ["volunteer", "organization", "admin", "partner"] as const;
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { ok: false, error: `Invalid role: ${role}` },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb: any = supabase;

    // Обновляем роль в public.profiles
    const { error } = await sb
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, role });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
