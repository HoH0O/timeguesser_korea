"use client";

import type { Difficulty } from "@/lib/types";

interface IntroScreenProps {
  onStart: (difficulty: Difficulty) => void;
  bestScores: Record<Difficulty, number>;
}

const DIFFICULTY_META: {
  key: Difficulty;
  title: string;
  subtitle: string;
  hint: string;
  accent: string;
}[] = [
  {
    key: "easy",
    title: "쉬움",
    subtitle: "Easy",
    hint: "10년 ~ 100년 격차",
    accent: "from-emerald-400 to-emerald-600",
  },
  {
    key: "normal",
    title: "보통",
    subtitle: "Normal",
    hint: "5년 ~ 10년 격차",
    accent: "from-amber-400 to-orange-500",
  },
  {
    key: "hard",
    title: "어려움",
    subtitle: "Hard",
    hint: "5년 미만 격차",
    accent: "from-rose-400 to-rose-600",
  },
];

export function IntroScreen({ onStart, bestScores }: IntroScreenProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12 text-center">
      <div className="animate-fade-in-up space-y-3">
        <span className="inline-block rounded-full bg-white/5 px-4 py-1.5 text-xs font-medium tracking-[0.3em] text-white/60 ring-1 ring-white/10">
          KOREAN HISTORY · ECONOMY · CULTURE
        </span>
        <h1 className="text-balance text-5xl md:text-7xl font-black tracking-tight">
          <span className="bg-gradient-to-br from-accent-gold via-amber-200 to-accent-rose bg-clip-text text-transparent">
            TimeGuessr
          </span>
          <span className="ml-3 text-white/90">Korea</span>
        </h1>
        <p className="mx-auto max-w-xl text-balance text-base md:text-lg text-white/60">
          두 사건 중 <span className="text-white">먼저 일어난 사건</span>을 골라보세요.
          연승이 끊기기 전까지 몇 문제까지 맞힐 수 있나요?
        </p>
      </div>

      <div
        className="mt-12 grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-6"
        style={{ animationDelay: "120ms" }}
      >
        {DIFFICULTY_META.map((d, i) => (
          <button
            key={d.key}
            onClick={() => onStart(d.key)}
            className="group relative animate-fade-in-up overflow-hidden rounded-2xl border border-white/10 bg-ink-900 p-6 text-left transition-all hover:-translate-y-1 hover:border-white/30 hover:bg-ink-800"
            style={{ animationDelay: `${200 + i * 100}ms` }}
          >
            <div
              className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${d.accent} opacity-30 blur-2xl transition-opacity group-hover:opacity-60`}
              aria-hidden
            />
            <div className="relative space-y-3">
              <div className="flex items-baseline justify-between">
                <h2 className="text-2xl font-bold">{d.title}</h2>
                <span className="text-xs font-mono text-white/40">
                  {d.subtitle}
                </span>
              </div>
              <p className="text-sm text-white/50">{d.hint}</p>
              <div className="flex items-center justify-between pt-4 text-xs">
                <span className="text-white/40">최고 연승</span>
                <span className="font-mono text-lg font-bold text-white">
                  {bestScores[d.key]}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <footer className="mt-16 text-xs text-white/30">
        데이터 출처: 나무위키 · 108개 한국사 사건 수록
      </footer>
    </main>
  );
}
