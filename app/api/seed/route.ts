import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";


// ────────────────────────────────
// Demo data definitions
// ────────────────────────────────

const ORGANIZATION_USER = {
  email: "demo-org@volunteer.app",
  password: "DemoOrg123!",
  user_metadata: {
    name: "Приют «Надежда»",
    role: "organization",
    avatar: "https://api.dicebear.com/9.x/identicon/svg?seed=Hope",
  },
};

const VOLUNTEER_USERS = [
  {
    email: "demo-volunteer-1@volunteer.app",
    password: "DemoVol123!",
    user_metadata: {
      name: "Анна Волонтёр",
      role: "volunteer",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Anna",
    },
  },
  {
    email: "demo-volunteer-2@volunteer.app",
    password: "DemoVol123!",
    user_metadata: {
      name: "Павел Помощник",
      role: "volunteer",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Pavel",
    },
  },
];

const DEMO_EVENTS = [
  {
    title: "Зоо-волонтерство",
    description:
      "Помощь в уходе за животными в городском приюте. Прогулки, кормление и забота о бездомных питомцах.",
    full_description:
      "Присоединяйтесь к нашей команде волонтёров в городском приюте для бездомных животных! Мы ищем ответственных и неравнодушных людей, готовых помочь с уходом за питомцами.\n\nВ программе:\n• Выгул собак и активные игры\n• Кормление и уход за кошками\n• Уборка вольеров и помощь в обустройстве территории\n• Социализация животных (общение, приучение к поводку)\n• Фотосъёмка питомцев для соцсетей приюта\n\nЧто важно:\n— Приносить с собой хорошее настроение ❤️\n— Одеваться по погоде (часть работы на улице)\n— Перчатки и фартуки выдаются на месте\n\nВсех волонтёров ждёт тёплый чай, печеньки и море благодарности от хвостиков! 🐾",
    image: "/zoo-volo.jpg",
    date: "2025-07-20",
    time: "10:00",
    location: "ул. Добрая, 15, Приют «Надежда»",
    city: "Москва",
    category: "животные",
    max_participants: 20,
    reward: 50,
    status: "open" as const,
  },
  {
    title: "Уборка городского парка",
    description:
      "Совместная уборка территории городского парка. Сбор мусора, посадка деревьев и облагораживание клумб.",
    full_description:
      "Приглашаем всех неравнодушных жителей города на экологическую акцию по уборке центрального парка!\n\nПлан работ:\n• Уборка мусора и сортировка отходов\n• Посадка новых деревьев и кустарников\n• Обновление цветочных клумб\n• Покраска скамеек и урн\n\nЧто предоставляется:\n— Перчатки, мешки для мусора, инвентарь\n— Вода и лёгкий перекус\n— Отличное настроение и новые знакомства!\n\nПриходите — сделаем наш город чище вместе! 🌍",
    image: "/zoo-volo.jpg",
    date: "2025-08-05",
    time: "09:00",
    location: "Центральный парк, вход со стороны ул. Парковой",
    city: "Москва",
    category: "экология",
    max_participants: 30,
    reward: 35,
    status: "open" as const,
  },
  {
    title: "Помощь в доме престарелых",
    description:
      "Посещение пожилых людей, помощь в быту, общение и проведение небольших творческих мастер-классов.",
    full_description:
      "Наши подопечные очень ждут общения и внимания! Если у вас есть свободное время и желание подарить тепло — присоединяйтесь.\n\nЧем можно помочь:\n• Просто пообщаться и выслушать\n• Помочь с письмами и чтением книг\n• Провести небольшой мастер-класс (рисование, музыка, рукоделие)\n• Помочь с чаепитием и организацией досуга\n\nВажно: приходите с открытым сердцем 💛\nОпыт не требуется — главное желание помочь!",
    image: "/zoo-volo.jpg",
    date: "2025-08-12",
    time: "14:00",
    location: "ул. Заботы, 7, Пансионат «Теплота»",
    city: "Санкт-Петербург",
    category: "социальная помощь",
    max_participants: 15,
    reward: 70,
    status: "open" as const,
  },
];

// ────────────────────────────────
// Helpers
// ────────────────────────────────

function createResult(
  ok: boolean,
  data?: Record<string, unknown>,
  error?: string
) {
  if (ok && data) {
    return NextResponse.json({ ok: true, ...data }, { status: 200 });
  }
  return NextResponse.json({ ok: false, error }, { status: 500 });
}

// ────────────────────────────────
// POST /api/seed
// ────────────────────────────────

export async function POST() {
  try {
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb: any = supabase;

    // 1. Очищаем старые демо-данные (если есть) — безопасный перезапуск
    await sb.rpc('cleanup_demo_data');
    await new Promise((r) => setTimeout(r, 300));

    const results: Record<string, unknown> = {};

    // 2. Create organization user
    const { data: orgUser, error: orgErr } =
      await supabase.auth.admin.createUser({
        ...ORGANIZATION_USER,
        email_confirm: true,
      });

    if (orgErr) {
      return createResult(
        false,
        undefined,
        `Ошибка создания организации: ${orgErr.message}`
      );
    }

    const orgProfileId = orgUser.user.id;
    results.organization = { id: orgProfileId, email: ORGANIZATION_USER.email };

    // 3. Create volunteer users
    const volunteerIds: string[] = [];
    for (const vol of VOLUNTEER_USERS) {
      const { data: volUser, error: volErr } =
        await supabase.auth.admin.createUser({
          ...vol,
          email_confirm: true,
        });

      if (volErr) {
        console.warn(`Warning: could not create volunteer ${vol.email}:`, volErr.message);
        continue;
      }
      volunteerIds.push(volUser.user.id);
    }
    results.volunteers_created = volunteerIds.length;

    // 4. Wait for the auto-profile trigger to fire
    await new Promise((r) => setTimeout(r, 500));

    // 5. Вставляем мероприятия
    const createdEventIds: string[] = [];
    for (const evt of DEMO_EVENTS) {
      const eventResult = await sb
        .from('events')
        .insert({
          title: evt.title,
          description: evt.description,
          full_description: evt.full_description,
          image: evt.image,
          date: evt.date,
          time: evt.time,
          location: evt.location,
          city: evt.city,
          category: evt.category,
          max_participants: evt.max_participants,
          reward: evt.reward,
          status: evt.status,
          organizer_id: orgProfileId,
        })
        .select('id')
        .single();

      if (eventResult.error) {
        console.warn(
          `Warning: could not create event "${evt.title}":`,
          eventResult.error?.message
        );
        continue;
      }
      if (eventResult.data) {
        createdEventIds.push(eventResult.data.id);
      }
    }
    results.events_created = createdEventIds.length;

    // 6. Register volunteers for the first event
    if (createdEventIds.length > 0 && volunteerIds.length > 0) {
      const firstEventId = createdEventIds[0];
      for (const vid of volunteerIds) {
        const regResult = await sb
          .from('event_participants')
          .insert({
            event_id: firstEventId,
            user_id: vid,
            status: 'registered',
          });

        if (regResult.error) {
          console.warn(
            `Warning: could not register volunteer ${vid}:`,
            regResult.error.message
          );
        }
      }
      results.registered_volunteers = volunteerIds.length;
    }

    return NextResponse.json({
      ok: true,
      message: '✅ Демо-данные успешно загружены!',
      ...results,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Неизвестная ошибка';
    return createResult(false, undefined, message);
  }
}
