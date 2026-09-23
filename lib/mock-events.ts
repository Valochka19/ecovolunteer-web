export interface EventData {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  date: string;
  time: string;
  location: string;
  city: string;
  category: string;
  participants: number;
  maxParticipants: number;
  reward: number;
  organizer: string;
  organizerAvatar: string;
  status: "open" | "closed" | "full";
}

export const MOCK_EVENTS: EventData[] = [
  {
    id: "evt_001",
    title: "Зоо-волонтерство",
    description:
      "Помощь в уходе за животными в городском приюте. Прогулки, кормление и забота о бездомных питомцах.",
    fullDescription:
      "Присоединяйтесь к нашей команде волонтёров в городском приюте для бездомных животных! Мы ищем ответственных и неравнодушных людей, готовых помочь с уходом за питомцами.\n\nВ программе:\n• Выгул собак и активные игры\n• Кормление и уход за кошками\n• Уборка вольеров и помощь в обустройстве территории\n• Социализация животных (общение, приучение к поводку)\n• Фотосъёмка питомцев для соцсетей приюта\n\nЧто важно:\n— Приносить с собой хорошее настроение ❤️\n— Одеваться по погоде (часть работы на улице)\n— Перчатки и фартуки выдаются на месте\n\nВсех волонтёров ждёт тёплый чай, печеньки и море благодарности от хвостиков! 🐾",
    image: "/zoo-volo.jpg",
    date: "2025-07-20",
    time: "10:00",
    location: "ул. Добрая, 15, Приют «Надежда»",
    city: "Москва",
    category: "животные",
    participants: 8,
    maxParticipants: 20,
    reward: 50,
    organizer: "Приют «Надежда»",
    organizerAvatar: "https://api.dicebear.com/9.x/identicon/svg?seed=Hope",
    status: "open",
  },
];
