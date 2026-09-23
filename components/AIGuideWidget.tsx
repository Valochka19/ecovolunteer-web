'use client';



import { useState, useRef, useEffect, useCallback } from 'react';

import Link from 'next/link';



// ---------------------------------------------------------------------------

// Types

// ---------------------------------------------------------------------------

type Role = 'user' | 'model';



interface Message {

  role: Role;

  text: string;

}



interface RouteHint {

  label: string;

  href: string;

}



// ---------------------------------------------------------------------------

// Constants

// ---------------------------------------------------------------------------

const GEMINI_API_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const API_URL = GEMINI_API_KEY
  ? `${GEMINI_API_BASE_URL}?key=${GEMINI_API_KEY}`
  : null;



const SYSTEM_INSTRUCTION = {

  parts: [

    {

      text:

        "Ты — встроенный ИИ-напарник на платформе волонтеров. Отвечай коротко (максимум 3 предложения), только на русском языке. Используй дружелюбный тон и немного эмодзи. " +

        "Не спамь ссылками. Если пользователь спрашивает, где что найти, просто направь его: 'глянь в Древе Навыков', " +

        "'зацени Достижения' или 'загляни в Магазин наград'. Будь краток, не будь навязчивым, используй немного эмодзи.",

        
    },

  ],

};



const ROUTE_HINTS: { keywords: string[]; hint: RouteHint }[] = [

  {

    keywords: ['древо навыков', 'прокачаться', 'навыки'],

    hint: { label: '🌿 Заглянуть в Древо Навыков', href: '/dashboard/skills' },

  },

  {

    keywords: ['достижения', 'ачивки'],

    hint: { label: '🏆 Глянуть Достижения', href: '/dashboard/achievements' },

  },

  {

    keywords: ['магазин', 'потратить'],

    hint: { label: '🛍️ Зайти в Магазин', href: '/dashboard/rewards-shop' },

  },

];



// ---------------------------------------------------------------------------

// Helpers

// ---------------------------------------------------------------------------



/** Extract matching route hints from the bot's message */

function extractRouteHints(text: string): RouteHint[] {

  const lower = text.toLowerCase();

  const hints: RouteHint[] = [];

  for (const entry of ROUTE_HINTS) {

    if (entry.keywords.some((kw) => lower.includes(kw))) {

      // Avoid duplicates

      if (!hints.find((h) => h.href === entry.hint.href)) {

        hints.push(entry.hint);

      }

    }

  }

  return hints;

}



// ---------------------------------------------------------------------------

// AIGuideWidget component

// ---------------------------------------------------------------------------

export default function AIGuideWidget() {

  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);



  const messagesEndRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);



  // Auto-scroll when messages change

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  }, [messages, isLoading]);



  // Focus input when chat opens

  useEffect(() => {

    if (isOpen) {

      // Small delay so the transition finishes

      setTimeout(() => inputRef.current?.focus(), 150);

    }

  }, [isOpen]);



  const sendMessage = useCallback(async () => {

    const text = input.trim();

    if (!text || isLoading) return;



    // Add user message

    const userMsg: Message = { role: 'user', text };

    setMessages((prev) => [...prev, userMsg]);

    setInput('');

    setIsLoading(true);



    // Build conversation for Gemini API (multi-turn)

    const contents = [...messages, userMsg].map((m) => ({

      parts: [{ text: m.text }],

      role: m.role,

    }));



    try {

      if (!API_URL) {
        throw new Error(
          'Отсутствует ключ Gemini. Добавьте NEXT_PUBLIC_GEMINI_API_KEY в .env.local.'
        );
      }

      const res = await fetch(API_URL, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          contents,

          systemInstruction: SYSTEM_INSTRUCTION,

        }),

      });



      if (!res.ok) {

        const errText = await res.text();

        throw new Error(`API error ${res.status}: ${errText}`);

      }



      const data = await res.json();

      const reply =

        data?.candidates?.[0]?.content?.parts?.[0]?.text ??

        '⚠️ Не удалось получить ответ. Попробуй позже.';



      setMessages((prev) => [...prev, { role: 'model', text: reply }]);

    } catch (err: unknown) {

      const message =

        err instanceof Error ? err.message : 'Неизвестная ошибка';

      setMessages((prev) => [

        ...prev,

        {

          role: 'model',

          text: `⚠️ Ой, что-то пошло не так: ${message}`,

        },

      ]);

    } finally {

      setIsLoading(false);

    }

  }, [input, isLoading, messages]);



  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {

    if (e.key === 'Enter' && !e.shiftKey) {

      e.preventDefault();

      sendMessage();

    }

  };



  // -------------------------------------------------------------------

  // Render

  // -------------------------------------------------------------------

  return (

    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">

      {/* ---- Floating trigger button ---- */}

      <button

        onClick={() => setIsOpen((prev) => !prev)}

        aria-label={isOpen ? 'Закрыть чат' : 'Открыть ИИ-путеводитель'}

        className={`

          relative flex h-16 w-16 items-center justify-center

          rounded-full text-3xl transition-all duration-300

          focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-400

          ${

            isOpen

              ? 'bg-zinc-800 shadow-[0_0_25px_rgba(167,139,250,0.7)] rotate-45'

              : 'bg-violet-600 animate-pulse shadow-[0_0_30px_rgba(124,58,237,0.9)]'

          }

        `}

      >

        {/* Glow ring */}

        <span className="absolute inset-0 rounded-full bg-violet-400/20 blur-xl" />

        <span className="relative z-10">{isOpen ? '✕' : '🔮'}</span>

      </button>



      {/* ---- Chat window ---- */}

      <div

        className={`

          flex flex-col overflow-hidden rounded-2xl

          border border-violet-500/30

          bg-zinc-950/90 backdrop-blur-md

          shadow-[0_0_40px_rgba(124,58,237,0.5)]

          transition-all duration-300 ease-out

          ${isOpen ? 'h-[450px] w-[360px] scale-100 opacity-100' : 'h-0 w-0 scale-95 opacity-0'}

        `}

      >

        {/* Header */}

        <header className="flex items-center justify-between border-b border-violet-500/20 px-4 py-3">

          <div className="flex items-center gap-2">

            <span className="text-xl">✨</span>

            <span className="font-semibold text-violet-100">ИИ-Проводник</span>

          </div>

          <div className="flex items-center gap-1.5">

            <span className="relative flex h-2.5 w-2.5">

              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />

            </span>

            <span className="text-xs text-emerald-400">Online</span>

          </div>

        </header>



        {/* Messages area */}

        <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-violet-700 scrollbar-track-transparent">

          {messages.length === 0 && (

            <p className="px-2 text-center text-sm text-zinc-500">

              👋 Привет! Я твой проводник по платформе. Спроси меня о навыках,

              достижениях или магазине наград!

            </p>

          )}



          {messages.map((msg, idx) => {

            const isUser = msg.role === 'user';

            const hints = isUser ? [] : extractRouteHints(msg.text);



            return (

              <div

                key={idx}

                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}

              >

                {/* Bubble */}

                <div

                  className={`

                    max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed

                    ${

                      isUser

                        ? 'bg-violet-600 text-white rounded-br-md'

                        : 'bg-zinc-800/80 text-zinc-100 rounded-bl-md border border-zinc-700/50'

                    }

                  `}

                >

                  {msg.text}

                </div>



                {/* Route-hint buttons (only under bot messages) */}

                {hints.length > 0 && (

                  <div className="mt-2 flex flex-wrap gap-2 pl-1">

                    {hints.map((hint) => (

                      <Link

                        key={hint.href}

                        href={hint.href}

                        className={`

                          inline-flex items-center gap-1 rounded-full

                          border border-emerald-500/40 bg-emerald-500/10

                          px-3 py-1 text-xs font-medium text-emerald-300

                          backdrop-blur-sm transition-all duration-200

                          hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]

                          focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400

                        `}

                      >

                        {hint.label} →

                      </Link>

                    ))}

                  </div>

                )}

              </div>

            );

          })}



          {/* Loading indicator */}

          {isLoading && (

            <div className="flex items-start">

              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-zinc-800/80 px-4 py-3 text-zinc-400">

                <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:0ms]" />

                <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:150ms]" />

                <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:300ms]" />

              </div>

            </div>

          )}



          <div ref={messagesEndRef} />

        </div>



        {/* Input area */}

        <form

          onSubmit={(e) => {

            e.preventDefault();

            sendMessage();

          }}

          className="flex items-center gap-2 border-t border-violet-500/20 p-3"

        >

          <input

            ref={inputRef}

            type="text"

            value={input}

            onChange={(e) => setInput(e.target.value)}

            onKeyDown={handleKeyDown}

            placeholder="Спроси меня..."

            disabled={isLoading}

            className={`

              flex-1 rounded-xl border border-violet-500/30

              bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100

              placeholder-zinc-500 outline-none transition-all

              focus:border-violet-400 focus:shadow-[0_0_12px_rgba(167,139,250,0.4)]

              disabled:opacity-50

            `}

          />

          <button

            type="submit"

            disabled={!input.trim() || isLoading}

            className={`

              flex h-10 w-10 items-center justify-center rounded-xl

              bg-violet-600 text-lg text-white transition-all duration-200

              hover:bg-violet-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.7)]

              focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400

              disabled:cursor-not-allowed disabled:opacity-40

            `}

            aria-label="Отправить сообщение"

          >

            ↑

          </button>

        </form>

      </div>

    </div>

  );

}