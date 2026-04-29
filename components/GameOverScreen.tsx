"use client";

import type { ModeDifficultyStats } from "@/lib/stats";
import type { Difficulty, GameMode } from "@/lib/types";

interface GameOverScreenProps {
  finalStreak: number;
  bestStreak: number;
  isNewBest: boolean;
  mode: GameMode;
  difficulty: Difficulty;
  stats: ModeDifficultyStats;
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

const MODE_LABEL: Record<GameMode, string> = {
  classic: "Classic",
  survival: "Survival ⏱",
  streaming: "Streaming 📺",
};

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "쉬움",
  normal: "보통",
  hard: "어려움",
};

export function GameOverScreen({
  finalStreak,
  bestStreak,
  isNewBest,
  mode,
  difficulty,
  stats,
  onRetry,
  onChangeDifficulty,
}: GameOverScreenProps) {
  const tier = TIER(finalStreak);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-10 text-center">
      <div className="w-full animate-fade-in-up space-y-7 rounded-3xl border border-white/10 bg-ink-900/70 p-8 backdrop-blur md:p-10">
        <div className="space-y-2">
          <span className="inline-block text-xs uppercase tracking-[0.3em] text-white/40 md:text-sm">
            Game Over · {MODE_LABEL[mode]} · {DIFFICULTY_LABEL[difficulty]}
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

        {/* 로컬 통계 패널 */}
        <StatsPanel stats={stats} mode={mode} difficulty={difficulty} />

        <div className="flex flex-col gap-3 pt-2 md:flex-row">
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
            모드 / 난이도 변경
          </button>
        </div>
      </div>
    </main>
  );
}

interface StatsPanelProps {
  stats: ModeDifficultyStats;
  mode: GameMode;
  difficulty: Difficulty;
}

function StatsPanel({ stats, mode, difficulty }: StatsPanelProps) {
  const { attempts, averageStreak, bestStreak, topPercent } = stats;
  const isFirstGame = attempts <= 1;

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-ink-950/60 p-5 text-left">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-white/50">
          내 통계
        </span>
        <span className="text-[10px] text-white/30">
          {MODE_LABEL[mode]} · {DIFFICULTY_LABEL[difficulty]}
        </span>
      </div>

      {isFirstGame ? (
        <p className="text-sm text-white/60">
          이 모드의 첫 도전이에요! 다시 플레이하면 분포 통계가 쌓입니다.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="시도 횟수" value={attempts.toString()} suffix="회" />
            <Stat
              label="평균 연승"
              value={averageStreak.toFixed(1)}
            />
            <Stat
              label="개인 최고"
              value={bestStreak.toString()}
            />
          </div>

          <div
            className={[
              "flex items-center justify-between rounded-xl px-4 py-3 ring-1",
              topPercent <= 20
                ? "bg-accent-gold/10 ring-accent-gold/30"
                : topPercent <= 50
                ? "bg-emerald-500/10 ring-emerald-400/30"
                : "bg-white/5 ring-white/10",
            ].join(" ")}
          >
            <div className="text-left">
              <p className="text-[11px] uppercase tracking-widest text-white/50">
                이번 점수 (내 분포 기준)
              </p>
              <p
                className={[
                  "text-lg font-bold",
                  topPercent <= 20
                    ? "text-accent-gold"
                    : topPercent <= 50
                    ? "text-emerald-400"
                    : "text-white/80",
                ].join(" ")}
              >
                상위 {topPercent}%
              </p>
            </div>
            <div className="text-2xl">
              {topPercent <= 10
                ? "🥇"
                : topPercent <= 20
                ? "🥈"
                : topPercent <= 50
                ? "🥉"
                : "📈"}
            </div>
          </div>

          <p className="text-[11px] text-white/30">
            * 현재는 본인의 과거 플레이 이력 기준이에요. 글로벌 분포는 추후 추가됩니다.
          </p>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 px-2 py-3">
      <p className="text-[10px] uppercase tracking-widest text-white/40">
        {label}
      </p>
      <p className="mt-1 font-mono text-xl font-bold text-white">
        {value}
        {suffix && (
          <span className="ml-1 text-xs font-normal text-white/40">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}
