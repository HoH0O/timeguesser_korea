export type Category =
  | "history"
  | "economy"
  | "culture"
  | "sports"
  | "politics"
  | "disaster"
  | "science";

export interface GameEvent {
  id: number;
  title: string;
  /** ISO 8601 date string (YYYY-MM-DD). 4자리 연도 강제. */
  date: string;
  category: Category;
  description?: string;
  image_url?: string;
  namuwiki_url?: string;
}

export type Difficulty = "easy" | "normal" | "hard";

export type GameMode = "classic" | "survival";

/** 서바이벌 모드에서 한 문제당 허용 시간 (밀리초) */
export const SURVIVAL_TIME_MS = 3000;

export interface QuestionPair {
  /** 좌측(또는 상단)에 표시될 사건 */
  eventA: GameEvent;
  /** 우측(또는 하단)에 표시될 사건 */
  eventB: GameEvent;
  /** 정답: 두 사건 중 먼저 발생한 사건의 id */
  earlierEventId: number;
  /** 두 사건의 발생 연도 차이 (절댓값) */
  yearDiff: number;
  /** 두 사건의 실제 일수 차이 (절댓값) — 디버깅/연출용 */
  dayDiff: number;
  /** 어떤 난이도 풀에서 출제되었는지 */
  difficulty: Difficulty;
}

export interface DifficultyRange {
  /** 두 사건의 연도 차이가 이 값 이상이어야 함 (inclusive) */
  minYearDiff: number;
  /** 두 사건의 연도 차이가 이 값 미만이어야 함 (exclusive) */
  maxYearDiff: number;
}
