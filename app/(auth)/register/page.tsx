import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Регистрация | EcoVolunteer",
  description: "Создайте аккаунт волонтёра или организации",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
