"use client";

import { useEffect, useState } from "react";
import { GameOverScreen } from "@/components/GameOverScreen";
import { IntroScreen } from "@/components/IntroScreen";
import { PlayScreen } from "@/components/PlayScreen";
import type { Difficulty } from "@/lib/types";

type Phase =
  | { kind: "intro" }
  | { kind: "playing"; difficulty: Difficulty }
  | { kind: "gameover"; difficulty: Difficulty; finalStreak: number; isNewBest: boolean };

const STORAGE_KEY = "timeguessr-korea:best";

const ZERO_BESTS: Record<Difficulty, number> = { easy: 0, normal: 0, hard: 0 };

function loadBests(): Record<Difficulty, number> {
  if (typeof window === "undefined") return ZERO_BESTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return ZERO_BESTS;
    const parsed = JSON.parse(raw) as Partial<Record<Difficulty, number>>;
    return {
      easy: typeof parsed.easy === "number" ? parsed.easy : 0,
      normal: typeof parsed.normal === "number" ? parsed.normal : 0,
      hard: typeof parsed.hard === "number" ? parsed.hard : 0,
    };
  } catch {
    return ZERO_BESTS;
  }
}

function saveBests(bests: Record<Difficulty, number>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bests));
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>({ kind: "intro" });
  const [bests, setBests] = useState<Record<Difficulty, number>>(ZERO_BESTS);

  // 마운트 시 localStorage에서 최고 기록 로드
  useEffect(() => {
    setBests(loadBests());
  }, []);

  function startGame(difficulty: Difficulty) {
    setPhase({ kind: "playing", difficulty });
  }

  function handleGameOver(finalStreak: number) {
    if (phase.kind !== "playing") return;
    const previousBest = bests[phase.difficulty];
    const isNewBest = finalStreak > previousBest;
    if (isNewBest) {
      const updated = { ...bests, [phase.difficulty]: finalStreak };
      setBests(updated);
      saveBests(updated);
    }
    setPhase({
      kind: "gameover",
      difficulty: phase.difficulty,
      finalStreak,
      isNewBest,
    });
  }

  function handleRetry() {
    if (phase.kind !== "gameover") return;
    setPhase({ kind: "playing", difficulty: phase.difficulty });
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
          key={`${phase.difficulty}-${Date.now()}`}
          difficulty={phase.difficulty}
          onGameOver={handleGameOver}
          onQuit={handleQuit}
        />
      );
    case "gameover":
      return (
        <GameOverScreen
          difficulty={phase.difficulty}
          finalStreak={phase.finalStreak}
          bestStreak={bests[phase.difficulty]}
          isNewBest={phase.isNewBest}
          onRetry={handleRetry}
          onChangeDifficulty={handleQuit}
        />
      );
  }
}

