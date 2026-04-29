"use client";

import type { Difficulty } from "@/lib/types";

interface GameOverScreenProps {
  finalStreak: number;
  bestStreak: number;
  isNewBest: boolean;
  difficulty: Difficulty;
  onRetry: () => void;
  onChangeDifficulty: () => void;
}

const TIER = (streak: number): { label: string; emoji: string } => {
  if (streak >= 25) return { label: "사학자급", emoji: "🏛️" };
  if (streak >= 15) return { label: "시간 여행자", emoji: "🕰️" };
  if (streak >= 8) return { label: "역사 좀 아는 사람", emoji: "📚" };
  if (streak >= 3) return { label: "초보 탐험가", emoji: "🧭" };
  return { label: "다음엔 더 잘할 거예요", emoji: "🌱" };
};

export function GameOverScreen({
  finalStreak,
  bestStreak,
  isNewBest,
  difficulty,
  onRetry,
  onChangeDifficulty,
}: GameOverScreenProps) {
  const tier = TIER(finalStreak);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="w-full animate-fade-in-up space-y-8 rounded-3xl border border-white/10 bg-ink-900/70 p-8 backdrop-blur md:p-12">
        <div className="space-y-2">
          <span className="inline-block text-sm uppercase tracking-[0.3em] text-white/40">
            Game Over · {difficulty}
          </span>
          <div className="text-6xl">{tier.emoji}</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            {tier.label}
          </h2>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-white/50">최종 연승</p>
          <p className="font-mono text-7xl md:text-8xl font-black bg-gradient-to-br from-accent-gold to-accent-rose bg-clip-text text-transparent">
            {finalStreak}
          </p>
          {isNewBest ? (
            <p className="inline-flex items-center gap-2 rounded-full bg-accent-gold/15 px-3 py-1 text-xs font-medium text-accent-gold ring-1 ring-accent-gold/30">
              ✨ 최고 기록 갱신!
            </p>
          ) : (
            <p className="text-xs text-white/40">
              현재 최고 기록: <span className="font-mono">{bestStreak}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 pt-4 md:flex-row">
          <button
            onClick={onRetry}
            className="flex-1 rounded-full bg-white px-6 py-3 text-base font-bold text-ink-950 transition-transform hover:-translate-y-0.5"
          >
            다시 도전하기
          </button>
          <button
            onClick={onChangeDifficulty}
            className="flex-1 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-base font-medium text-white/80 transition-colors hover:bg-white/10"
          >
            난이도 변경
          </button>
        </div>
      </div>
    </main>
  );
}
