"use client";

import type { Category, GameEvent } from "@/lib/types";

const CATEGORY_LABEL: Record<Category, string> = {
  history: "역사",
  economy: "경제",
  culture: "문화",
  sports: "스포츠",
  politics: "정치",
  disaster: "재난",
  science: "과학",
};

interface EventCardProps {
  event: GameEvent;
  /** "earlier" 또는 "later" — 정답이 공개되었을 때 표시할 라벨 */
  reveal?: "correct" | "wrong" | null;
  /** 사용자가 이 카드를 클릭했는지 여부 (오답 shake / 정답 pulse 적용 대상) */
  picked?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  /** "vs" 라벨 위치 결정용 (위/아래 또는 좌/우) */
  side: "A" | "B";
}

export function EventCard({
  event,
  reveal,
  picked,
  onClick,
  disabled,
  side,
}: EventCardProps) {
  const stateClass =
    reveal === "correct" && picked
      ? "ring-4 ring-emerald-400 animate-correct-pulse"
      : reveal === "correct" && !picked
      ? "ring-4 ring-emerald-400/80"
      : reveal === "wrong" && picked
      ? "ring-4 ring-rose-500 animate-shake opacity-80"
      : reveal === "wrong" && !picked
      ? "ring-1 ring-white/10 opacity-60"
      : "hover:ring-2 hover:ring-white/40";

  const showYear = reveal !== null && reveal !== undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-cat={event.category}
      aria-label={`${event.title} 선택`}
      className={[
        "group relative w-full overflow-hidden rounded-3xl",
        "bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950",
        "border border-white/10 shadow-2xl",
        "transition-all duration-300",
        "min-h-[260px] md:min-h-[420px] flex flex-col justify-between p-6 md:p-10",
        "disabled:cursor-default cursor-pointer",
        stateClass,
      ].join(" ")}
    >
      {/* category accent stripe */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: "var(--cat)" }}
      />

      {/* side badge */}
      <span className="absolute right-4 top-4 md:right-6 md:top-6 text-xs md:text-sm tracking-[0.2em] text-white/40 font-mono">
        {side}
      </span>

      {/* category label */}
      <span
        className="inline-flex w-fit items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/70 ring-1 ring-white/10"
        style={{ color: "var(--cat)" }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--cat)" }}
        />
        {CATEGORY_LABEL[event.category]}
      </span>

      {/* title */}
      <div className="flex-1 flex items-center justify-center px-2 py-6 md:py-10">
        <h2 className="text-balance text-center text-2xl md:text-4xl lg:text-5xl font-bold leading-tight">
          {event.title}
        </h2>
      </div>

      {/* date placeholder / reveal */}
      <div className="text-center">
        {showYear ? (
          <div className="font-mono text-3xl md:text-5xl font-bold text-white animate-count-up">
            {event.date.slice(0, 4)}
            <span className="text-white/40 text-base md:text-lg ml-2">
              ({event.date.slice(5).replace("-", ".")}.)
            </span>
          </div>
        ) : (
          <div className="font-mono text-xl md:text-2xl text-white/30 select-none">
            ????
          </div>
        )}
      </div>
    </button>
  );
}
