"use client";

import { useEffect, useMemo, useState } from "react";
import { createQuestionGenerator, isCorrectAnswer } from "@/lib/gameLogic";
import {
  SURVIVAL_TIME_MS,
  type Category,
  type Difficulty,
  type GameMode,
  type QuestionPair,
} from "@/lib/types";
import { EventCard } from "./EventCard";

interface PlayScreenProps {
  mode: GameMode;
  difficulty: Difficulty;
  onGameOver: (finalStreak: number) => void;
  onQuit: () => void;
}

type Phase = "asking" | "revealing";

/** 정답일 때 자동으로 다음 문제로 넘어가는 시간 */
const REVEAL_CORRECT_MS = 1600;

/** 스트리밍 모드에서 제외할 카테고리 (방송 친화) */
const STREAMING_EXCLUDED: ReadonlySet<Category> = new Set<Category>(["disaster"]);

export function PlayScreen({
  mode,
  difficulty,
  onGameOver,
  onQuit,
}: PlayScreenProps) {
  const generator = useMemo(
    () =>
      createQuestionGenerator(difficulty, {
        excludeCategories: mode === "streaming" ? STREAMING_EXCLUDED : undefined,
      }),
    [difficulty, mode]
  );
  const isSurvival = mode === "survival";
  const isStreaming = mode === "streaming";

  const [question, setQuestion] = useState<QuestionPair | null>(() => generator.next());
  const [streak, setStreak] = useState(0);
  const [phase, setPhase] = useState<Phase>("asking");
  const [pickedId, setPickedId] = useState<number | null>(null);

  // 정답 시 자동 다음 문제 (오답/시간초과는 사용자가 버튼으로 진행)
  useEffect(() => {
    if (phase !== "revealing" || pickedId === null || !question) return;
    if (!isCorrectAnswer(question, pickedId)) return;

    const timer = setTimeout(() => {
      const next = generator.next();
      if (!next) {
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

  // 서바이벌 모드: 3초 안에 답하지 않으면 시간 초과 → revealing 상태로 전환
  useEffect(() => {
    if (!isSurvival || phase !== "asking" || !question) return;
    const timer = setTimeout(() => {
      setPickedId(null); // 시간 초과 — 사용자가 아무 것도 안 골랐음
      setPhase("revealing");
    }, SURVIVAL_TIME_MS);
    return () => clearTimeout(timer);
  }, [isSurvival, phase, question]);

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
  const correctAnswered = phase === "revealing" && pickedId === correctId;
  const timedOut = phase === "revealing" && pickedId === null;
  const wrongPicked = phase === "revealing" && pickedId !== null && pickedId !== correctId;
  const incorrect = wrongPicked || timedOut;
  const correctEvent =
    question.eventA.id === correctId ? question.eventA : question.eventB;

  function revealStateFor(id: number): "correct" | "wrong" | null {
    if (phase !== "revealing") return null;
    if (id === correctId) return "correct";
    if (pickedId !== null && id === pickedId) return "wrong";
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
          <span
            className={[
              "hidden md:inline rounded-full px-3 py-1 text-xs uppercase tracking-widest ring-1",
              isSurvival
                ? "bg-rose-500/15 text-rose-300 ring-rose-400/30"
                : isStreaming
                ? "bg-sky-500/15 text-sky-300 ring-sky-400/30"
                : "bg-white/5 text-white/50 ring-white/10",
            ].join(" ")}
          >
            {isSurvival
              ? `⏱ Survival · ${difficulty}`
              : isStreaming
              ? `📺 Streaming · ${difficulty}`
              : difficulty}
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

      {/* 서바이벌 타이머 바 */}
      {isSurvival && (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5 md:mt-5">
          {phase === "asking" ? (
            <div
              key={question.eventA.id + "-" + question.eventB.id}
              className="h-full origin-left animate-timer-shrink rounded-full bg-gradient-to-r from-amber-300 via-rose-400 to-rose-500"
            />
          ) : (
            <div
              className={[
                "h-full origin-left rounded-full",
                correctAnswered
                  ? "bg-emerald-400"
                  : timedOut
                  ? "bg-rose-500/30"
                  : "bg-rose-500",
              ].join(" ")}
              style={{ transform: timedOut ? "scaleX(0)" : "scaleX(1)" }}
            />
          )}
        </div>
      )}

      <div className="my-4 text-center md:my-6">
        <h2 className="text-balance text-lg md:text-2xl font-medium text-white/80">
          {phase === "asking"
            ? "두 사건 중, 먼저 일어난 사건은?"
            : timedOut
            ? "⏱ 시간 초과!"
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
                : incorrect
                ? "bg-rose-500/90 ring-2 ring-rose-300"
                : "bg-emerald-500/90 ring-2 ring-emerald-300",
            ].join(" ")}
          >
            <span className="font-display text-base md:text-xl font-bold text-white">
              {phase === "asking" ? "VS" : incorrect ? "✕" : "✓"}
            </span>
          </div>
        </div>
      </div>

      <footer className="mt-4 md:mt-6">
        {phase === "asking" ? (
          <p className="text-center text-xs text-white/30">
            {isSurvival
              ? "⏱ 3초 안에 사건을 클릭/탭하세요"
              : "사건을 클릭/탭하여 답변"}
          </p>
        ) : incorrect ? (
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
