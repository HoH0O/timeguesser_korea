"use client";

import { useEffect, useMemo, useState } from "react";
import { createQuestionGenerator, isCorrectAnswer } from "@/lib/gameLogic";
import type { Difficulty, QuestionPair } from "@/lib/types";
import { EventCard } from "./EventCard";

interface PlayScreenProps {
  difficulty: Difficulty;
  onGameOver: (finalStreak: number) => void;
  onQuit: () => void;
}

type Phase = "asking" | "revealing";

/** 정답일 때 자동으로 다음 문제로 넘어가는 시간 */
const REVEAL_CORRECT_MS = 1600;

export function PlayScreen({ difficulty, onGameOver, onQuit }: PlayScreenProps) {
  const generator = useMemo(() => createQuestionGenerator(difficulty), [difficulty]);

  const [question, setQuestion] = useState<QuestionPair | null>(() => generator.next());
  const [streak, setStreak] = useState(0);
  const [phase, setPhase] = useState<Phase>("asking");
  const [pickedId, setPickedId] = useState<number | null>(null);

  useEffect(() => {
    if (phase !== "revealing" || pickedId === null || !question) return;
    // 오답일 때는 자동 전환하지 않고, 사용자가 "결과 보기" 버튼을 눌러야 진행
    if (!isCorrectAnswer(question, pickedId)) return;

    const timer = setTimeout(() => {
      const next = generator.next();
      if (!next) {
        // 데이터 풀 소진 — 사실상 클리어
        onGameOver(streak + 1);
        return;
      }
      setStreak((s) => s + 1);
      setQuestion(next);
      setPickedId(null);
      setPhase("asking");
    }, REVEAL_CORRECT_MS);

    return () => clearTimeout(timer);
  }, [phase, pickedId, question, streak, generator, onGameOver]);

  function handlePick(id: number) {
    if (phase !== "asking" || !question) return;
    setPickedId(id);
    setPhase("revealing");
  }

  if (!question) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white/60">
        출제 가능한 사건이 부족합니다.
      </div>
    );
  }

  const correctId = question.earlierEventId;
  const wrongPicked = pickedId !== null && pickedId !== correctId;
  const correctEvent =
    question.eventA.id === correctId ? question.eventA : question.eventB;

  function revealStateFor(id: number): "correct" | "wrong" | null {
    if (phase !== "revealing") return null;
    if (id === correctId) return "correct";
    if (id === pickedId) return "wrong";
    return null;
  }

  return (
    <main className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 md:px-8 md:py-6">
      <header className="flex items-center justify-between gap-4">
        <button
          onClick={onQuit}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          ← 그만두기
        </button>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-widest text-white/50">
            {difficulty}
          </span>
          <div className="flex items-baseline gap-2 rounded-full bg-white/5 px-4 py-1.5 ring-1 ring-white/10">
            <span className="text-xs text-white/50">연승</span>
            <span
              key={streak}
              className="font-mono text-2xl font-bold animate-count-up"
            >
              {streak}
            </span>
          </div>
        </div>
      </header>

      <div className="my-4 text-center md:my-6">
        <h2 className="text-balance text-lg md:text-2xl font-medium text-white/80">
          {phase === "asking"
            ? "두 사건 중, 먼저 일어난 사건은?"
            : wrongPicked
            ? "아쉬워요! 정답은 반대편이었어요."
            : "정답이에요!"}
        </h2>
      </div>

      {/* 카드 두 개 + 중앙 vs 라벨 */}
      <div className="relative grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <EventCard
          event={question.eventA}
          side="A"
          reveal={revealStateFor(question.eventA.id)}
          picked={pickedId === question.eventA.id}
          disabled={phase !== "asking"}
          onClick={() => handlePick(question.eventA.id)}
        />
        <EventCard
          event={question.eventB}
          side="B"
          reveal={revealStateFor(question.eventB.id)}
          picked={pickedId === question.eventB.id}
          disabled={phase !== "asking"}
          onClick={() => handlePick(question.eventB.id)}
        />

        {/* center badge: VS / ✓ / ✕ */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className={[
              "flex h-14 w-14 items-center justify-center rounded-full backdrop-blur md:h-16 md:w-16 transition-colors",
              phase === "asking"
                ? "bg-ink-950 ring-2 ring-white/15"
                : wrongPicked
                ? "bg-rose-500/90 ring-2 ring-rose-300"
                : "bg-emerald-500/90 ring-2 ring-emerald-300",
            ].join(" ")}
          >
            <span className="font-display text-base md:text-xl font-bold text-white">
              {phase === "asking" ? "VS" : wrongPicked ? "✕" : "✓"}
            </span>
          </div>
        </div>
      </div>

      <footer className="mt-4 md:mt-6">
        {phase === "asking" ? (
          <p className="text-center text-xs text-white/30">
            사건을 클릭/탭하여 답변
          </p>
        ) : wrongPicked ? (
          <div className="flex flex-col items-center gap-3 animate-fade-in-up">
            <p className="text-balance text-center text-sm md:text-base text-white/70">
              정답은{" "}
              <span className="font-bold text-emerald-400">
                {correctEvent.title}
              </span>
              <span className="ml-1.5 font-mono text-xs text-white/50 md:text-sm">
                ({correctEvent.date})
              </span>
              이 먼저였어요.
            </p>
            <button
              onClick={() => onGameOver(streak)}
              className="rounded-full bg-white px-7 py-3 text-sm md:text-base font-bold text-ink-950 shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              결과 보기 →
            </button>
          </div>
        ) : (
          <p className="text-center text-xs text-white/30">
            연도 차이 {question.yearDiff}년 · 다음 문제로 넘어가는 중...
          </p>
        )}
      </footer>
    </main>
  );
}
