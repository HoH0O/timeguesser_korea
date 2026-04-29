"use client";

import { useEffect, useState } from "react";
import { GameOverScreen } from "@/components/GameOverScreen";
import { IntroScreen } from "@/components/IntroScreen";
import { PlayScreen } from "@/components/PlayScreen";
import type { Difficulty, GameMode } from "@/lib/types";

type Phase =
  | { kind: "intro" }
  | { kind: "playing"; mode: GameMode; difficulty: Difficulty }
  | {
      kind: "gameover";
      mode: GameMode;
      difficulty: Difficulty;
      finalStreak: number;
      isNewBest: boolean;
    };

type BestScores = Record<GameMode, Record<Difficulty, number>>;

const STORAGE_KEY = "timeguessr-korea:best:v2";

const ZERO_BESTS: BestScores = {
  classic: { easy: 0, normal: 0, hard: 0 },
  survival: { easy: 0, normal: 0, hard: 0 },
};

function loadBests(): BestScores {
  if (typeof window === "undefined") return ZERO_BESTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // v1(평면 구조) 마이그레이션 — 있다면 classic으로 옮김
      const legacy = window.localStorage.getItem("timeguessr-korea:best");
      if (legacy) {
        const parsed = JSON.parse(legacy) as Partial<Record<Difficulty, number>>;
        return {
          classic: {
            easy: typeof parsed.easy === "number" ? parsed.easy : 0,
            normal: typeof parsed.normal === "number" ? parsed.normal : 0,
            hard: typeof parsed.hard === "number" ? parsed.hard : 0,
          },
          survival: { easy: 0, normal: 0, hard: 0 },
        };
      }
      return ZERO_BESTS;
    }
    const parsed = JSON.parse(raw) as Partial<BestScores>;
    return {
      classic: {
        easy: parsed.classic?.easy ?? 0,
        normal: parsed.classic?.normal ?? 0,
        hard: parsed.classic?.hard ?? 0,
      },
      survival: {
        easy: parsed.survival?.easy ?? 0,
        normal: parsed.survival?.normal ?? 0,
        hard: parsed.survival?.hard ?? 0,
      },
    };
  } catch {
    return ZERO_BESTS;
  }
}

function saveBests(bests: BestScores) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bests));
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>({ kind: "intro" });
  const [bests, setBests] = useState<BestScores>(ZERO_BESTS);

  // 마운트 시 localStorage에서 최고 기록 로드
  useEffect(() => {
    setBests(loadBests());
  }, []);

  function startGame(mode: GameMode, difficulty: Difficulty) {
    setPhase({ kind: "playing", mode, difficulty });
  }

  function handleGameOver(finalStreak: number) {
    if (phase.kind !== "playing") return;
    const previousBest = bests[phase.mode][phase.difficulty];
    const isNewBest = finalStreak > previousBest;
    if (isNewBest) {
      const updated: BestScores = {
        ...bests,
        [phase.mode]: {
          ...bests[phase.mode],
          [phase.difficulty]: finalStreak,
        },
      };
      setBests(updated);
      saveBests(updated);
    }
    setPhase({
      kind: "gameover",
      mode: phase.mode,
      difficulty: phase.difficulty,
      finalStreak,
      isNewBest,
    });
  }

  function handleRetry() {
    if (phase.kind !== "gameover") return;
    setPhase({ kind: "playing", mode: phase.mode, difficulty: phase.difficulty });
  }

  function handleQuit() {
    setPhase({ kind: "intro" });
  }

  switch (phase.kind) {
    case "intro":
      return <IntroScreen onStart={startGame} bestScores={bests} />;
    case "playing":
      return (
        <PlayScreen
          key={`${phase.mode}-${phase.difficulty}-${Date.now()}`}
          mode={phase.mode}
          difficulty={phase.difficulty}
          onGameOver={handleGameOver}
          onQuit={handleQuit}
        />
      );
    case "gameover":
      return (
        <GameOverScreen
          mode={phase.mode}
          difficulty={phase.difficulty}
          finalStreak={phase.finalStreak}
          bestStreak={bests[phase.mode][phase.difficulty]}
          isNewBest={phase.isNewBest}
          onRetry={handleRetry}
          onChangeDifficulty={handleQuit}
        />
      );
  }
}
