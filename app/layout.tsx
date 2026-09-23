import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";
import AIGuideWidget from "@/components/AIGuideWidget"; // Это ты уже сделал

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "EcoVolunteer — Платформа волонтёрских мероприятий",
  description:
    "Волонтёрская платформа с системой Social Tokens для геймификации добрых дел",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <AppProviders>
          {children}
          
          {/* ВОТ ЭТА СТРОЧКА ИСПРАВЛЯЕТ ОШИБКУ: */}
          <AIGuideWidget />
        </AppProviders>
      </body>
    </html>
  );
}