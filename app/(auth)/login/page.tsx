import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Вход | EcoVolunteer",
  description: "Войдите в платформу волонтёрских мероприятий",
};

export default function LoginPage() {
  return <LoginForm />;
}
