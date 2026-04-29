"use client";

import { useState } from "react";
import type { Difficulty, GameMode } from "@/lib/types";

type BestScores = Record<GameMode, Record<Difficulty, number>>;

interface IntroScreenProps {
  onStart: (mode: GameMode, difficulty: Difficulty) => void;
  bestScores: BestScores;
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

const MODE_META: { key: GameMode; title: string; tagline: string }[] = [
  { key: "classic", title: "일반 모드", tagline: "시간 제한 없음" },
  { key: "survival", title: "서바이벌 모드", tagline: "3초 안에 정답!" },
];

export function IntroScreen({ onStart, bestScores }: IntroScreenProps) {
  const [mode, setMode] = useState<GameMode>("classic");

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

      {/* mode toggle */}
      <div
        className="mt-10 inline-flex animate-fade-in-up rounded-full border border-white/10 bg-ink-900/80 p-1 backdrop-blur"
        style={{ animationDelay: "100ms" }}
        role="tablist"
        aria-label="게임 모드"
      >
        {MODE_META.map((m) => {
          const active = mode === m.key;
          return (
            <button
              key={m.key}
              role="tab"
              aria-selected={active}
              onClick={() => setMode(m.key)}
              className={[
                "relative rounded-full px-5 py-2 text-sm md:text-base font-semibold transition-colors",
                active
                  ? "bg-white text-ink-950 shadow-lg"
                  : "text-white/60 hover:text-white",
              ].join(" ")}
            >
              {m.key === "survival" && (
                <span className="mr-1.5" aria-hidden>
                  ⏱
                </span>
              )}
              {m.title}
              <span className="ml-2 hidden text-xs font-normal opacity-60 md:inline">
                · {m.tagline}
              </span>
            </button>
          );
        })}
      </div>

      <p
        className="mt-3 animate-fade-in-up text-xs text-white/40"
        style={{ animationDelay: "150ms" }}
      >
        {mode === "survival"
          ? "각 문제마다 3초의 제한 시간이 주어져요. 시간 초과 시 즉시 게임 오버!"
          : "원하는 만큼 천천히 생각해서 답할 수 있어요."}
      </p>

      {/* difficulty cards */}
      <div className="mt-8 grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {DIFFICULTY_META.map((d, i) => (
          <button
            key={d.key}
            onClick={() => onStart(mode, d.key)}
            className="group relative animate-fade-in-up overflow-hidden rounded-2xl border border-white/10 bg-ink-900 p-6 text-left transition-all hover:-translate-y-1 hover:border-white/30 hover:bg-ink-800"
            style={{ animationDelay: `${250 + i * 100}ms` }}
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
                <span className="text-white/40">
                  최고 연승{" "}
                  <span className="text-white/30">
                    ({mode === "survival" ? "서바이벌" : "일반"})
                  </span>
                </span>
                <span className="font-mono text-lg font-bold text-white">
                  {bestScores[mode][d.key]}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <footer className="mt-16 text-xs text-white/30">
        데이터 출처: 나무위키 · 490개 한국사·문화·스포츠 사건 수록
      </footer>
    </main>
  );
}
