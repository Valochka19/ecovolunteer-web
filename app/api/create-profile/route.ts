import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { ok: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb: any = supabase;

    // 1. Get user from auth to know their email and metadata
    const { data: authUser, error: authError } =
      await supabase.auth.admin.getUserById(userId);

    if (authError || !authUser?.user) {
      return NextResponse.json(
        { ok: false, error: "User not found in auth" },
        { status: 404 }
      );
    }

    const { email, user_metadata } = authUser.user;

    // 2. Check if profile already exists
    const { data: existing } = await sb
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true, message: "Profile already exists" });
    }

    // 3. Create the missing profile
    const defaultAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`;

    const { error: insertError } = await sb
      .from("profiles")
      .insert({
        id: userId,
        name: user_metadata?.name ?? (email?.split("@")[0] ?? "User"),
        avatar: user_metadata?.avatar ?? defaultAvatar,
        email: email ?? "",
        city: user_metadata?.city ?? "",
        role: user_metadata?.role ?? "volunteer",
      });

    if (insertError) {
      return NextResponse.json(
        { ok: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: "Profile created" });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
