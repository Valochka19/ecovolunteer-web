import type { Reward } from "@/types";

/**
 * Mock rewards data for the Reward Marketplace.
 * Covers all required categories: discount, item, service, event, education.
 *
 * Naming convention: Cyberpunk / Eco-Tech blend.
 * ── Standard: discounts (Partner Pizza), local merchandise (Eco-Tech merch), partner services.
 * ── Premium: volunteer eco-trip (requires approval), closed event access, educational programs.
 */
export const MOCK_REWARDS: Reward[] = [
  // ──────────────────────────────────────────────
  // STANDARD REWARDS
  // ──────────────────────────────────────────────

  // ── DISCOUNT ──────────────────────────────────
  {
    id: "rew_dsc_001",
    title: "Скидка 25% в «НейроПицца»",
    description:
      "Настоящая цифровая пицца с нейро-приправами. Скидка 25% на любой заказ от 2-х пицц в сети «НейроПицца».",
    tokenCost: 40,
    category: "discount",
    itemsLeft: 50,
    expirationDate: "2026-01-15",
    partnerName: "НейроПицца",
    requiresApproval: false,
    imageSrc: "/rewards/neuro-pizza.jpg",
    status: "available",
  },
  {
    id: "rew_dsc_002",
    title: "Био-кофе «Энергия Будущего»",
    description:
      "Скидка 30% на линейку премиального био-кофе в сети кибер-кафе «ЭкоПоинт». Заряжает тело и гаджеты.",
    tokenCost: 25,
    category: "discount",
    itemsLeft: 120,
    expirationDate: "2025-12-31",
    partnerName: "ЭкоПоинт",
    requiresApproval: false,
    imageSrc: "/rewards/bio-coffee.jpg",
    status: "available",
  },

  // ── ITEM ──────────────────────────────────────
  {
    id: "rew_itm_001",
    title: "Мерч «Eco-Tech» — Футболка с логотипом",
    description:
      "Лимитированная футболка из переработанного пластика с термо-чувствительным логотипом NeoLeaf. Размеры S–XL.",
    tokenCost: 100,
    category: "item",
    itemsLeft: 30,
    expirationDate: "2026-06-01",
    partnerName: "Eco-Tech",
    requiresApproval: false,
    imageSrc: "/rewards/ecotech-tshirt.jpg",
    status: "available",
  },
  {
    id: "rew_itm_002",
    title: "Кружка «КиберБотаника»",
    description:
      "Термо-кружка с авто-подогревом и сменными LED-панелями. Заряжается от USB-C. Экологичный силикон.",
    tokenCost: 75,
    category: "item",
    itemsLeft: 15,
    expirationDate: "2025-11-30",
    partnerName: "Eco-Tech",
    requiresApproval: false,
    imageSrc: "/rewards/cyber-mug.jpg",
    status: "available",
  },

  // ── SERVICE ───────────────────────────────────
  {
    id: "rew_srv_001",
    title: "Эко-химчистка на дому",
    description:
      "Бесплатная эко-химчистка одного комплекта одежды био-растворителями. Выезд в пределах города.",
    tokenCost: 60,
    category: "service",
    itemsLeft: 20,
    expirationDate: "2025-10-15",
    partnerName: "Чисто-Ноль",
    requiresApproval: false,
    imageSrc: "/rewards/eco-cleaning.jpg",
    status: "available",
  },
  {
    id: "rew_srv_002",
    title: "Ремонт гаджетов в «КиберМастерской»",
    description:
      "Скидка 50% на диагностику и ремонт любой техники. Бесплатная пайка экологичным припоем.",
    tokenCost: 85,
    category: "service",
    itemsLeft: 10,
    expirationDate: "2026-03-01",
    partnerName: "КиберМастерская",
    requiresApproval: false,
    imageSrc: "/rewards/cyber-repair.jpg",
    status: "available",
  },

  // ── EVENT ─────────────────────────────────────
  {
    id: "rew_evt_001",
    title: "Закрытый показ «НеоГород 2121»",
    description:
      "VIP-доступ на закрытый показ эко-футуристического фильма с технологиями дополненной реальности.",
    tokenCost: 150,
    category: "event",
    itemsLeft: 10,
    expirationDate: "2025-12-01",
    partnerName: "NeoVision",
    requiresApproval: false,
    imageSrc: "/rewards/neocity-premiere.jpg",
    status: "available",
  },
  {
    id: "rew_evt_002",
    title: "Мастер-класс «Сборка био-дрона»",
    description:
      "Практический воркшоп по сборке и настройке дрона на био-топливе. Всё оборудование предоставляется.",
    tokenCost: 120,
    category: "event",
    itemsLeft: 5,
    expirationDate: "2025-09-20",
    partnerName: "AeroLeaf",
    requiresApproval: true,
    imageSrc: "/rewards/bio-drone-workshop.jpg",
    status: "available",
  },

  // ── EDUCATION ─────────────────────────────────
  {
    id: "rew_edu_001",
    title: "Курс «Основы кибер-экологии»",
    description:
      "8-недельный онлайн-курс по устойчивому развитию в цифровую эпоху. Сертификат от NeoLeaf Academy.",
    tokenCost: 200,
    category: "education",
    itemsLeft: 100,
    expirationDate: "2026-12-31",
    partnerName: "NeoLeaf Academy",
    requiresApproval: false,
    imageSrc: "/rewards/cyber-ecology-course.jpg",
    status: "available",
  },
  {
    id: "rew_edu_002",
    title: "Интенсив «Zero Waste Dev»",
    description:
      "3-дневный интенсив по созданию приложений с нулевым углеродным следом. Для разработчиков уровня Junior+.",
    tokenCost: 180,
    category: "education",
    itemsLeft: 25,
    expirationDate: "2025-08-30",
    partnerName: "GreenCode",
    requiresApproval: true,
    imageSrc: "/rewards/zerowaste-dev.jpg",
    status: "available",
  },

  // ──────────────────────────────────────────────
  // PREMIUM REWARDS
  // ──────────────────────────────────────────────

  // ── PREMIUM TRIP ──────────────────────────────
  {
    id: "rew_prm_001",
    title: "Волонтёрская экспедиция на Байкал",
    description:
      "Недельная эко-экспедиция на озеро Байкал: очистка берегов, научные исследования, проживание в био-домиках. Требуется подтверждение участия координатором.",
    tokenCost: 500,
    category: "service",
    itemsLeft: 8,
    expirationDate: "2025-07-01",
    partnerName: "БайкалЗаповедный",
    requiresApproval: true,
    imageSrc: "/rewards/baikal-expedition.jpg",
    status: "available",
  },

  // ── PREMIUM CLOSED EVENT ─────────────────────
  {
    id: "rew_prm_002",
    title: "Eco-Конгресс «Зелёный Давос»",
    description:
      "Билет на закрытый ежегодный конгресс эко-лидеров с участием Нобелевских лауреатов. Networking и ужин.",
    tokenCost: 650,
    category: "event",
    itemsLeft: 3,
    expirationDate: "2025-11-10",
    partnerName: "Green Davos Foundation",
    requiresApproval: true,
    imageSrc: "/rewards/green-davos.jpg",
    status: "available",
  },

  // ── PREMIUM EDUCATION ─────────────────────────
  {
    id: "rew_prm_003",
    title: "Стажировка в NeoLeaf R&D Lab",
    description:
      "Месячная оплачиваемая стажировка в исследовательской лаборатории NeoLeaf. Работа над реальными эко-тех проектами. Требуется собеседование.",
    tokenCost: 800,
    category: "education",
    itemsLeft: 2,
    expirationDate: "2025-10-01",
    partnerName: "NeoLeaf Academy",
    requiresApproval: true,
    imageSrc: "/rewards/neoleaf-internship.jpg",
    status: "available",
  },

  // ── OUT OF STOCK (edge case) ──────────────────
  {
    id: "rew_ost_001",
    title: "Фирменный PowerBank «Солнечный Луч»",
    description:
      "Портативный powerbank на 20 000 мАч с солнечной панелью. Когда-то был в наличии, теперь — легенда.",
    tokenCost: 90,
    category: "item",
    itemsLeft: 0,
    expirationDate: "2025-06-30",
    partnerName: "Eco-Tech",
    requiresApproval: false,
    imageSrc: "/rewards/solar-powerbank.jpg",
    status: "out_of_stock",
  },
];
