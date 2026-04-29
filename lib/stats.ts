/**
 * 로컬 게임 이력 누적과 사용자 분포 기반 통계 계산.
 *
 * 현재는 100% localStorage 기반 — 다른 플레이어 점수와는 비교하지 않고,
 * **자신의 과거 플레이 이력**을 기준으로 백분위를 계산한다.
 * (글로벌 상위 X% 비교는 추후 서버리스 DB 연결 시 추가)
 */

import type { Difficulty, GameMode } from "./types";

export interface GameRecord {
  mode: GameMode;
  difficulty: Difficulty;
  finalStreak: number;
  /** epoch ms */
  timestamp: number;
}

const HISTORY_KEY = "timeguessr-korea:history:v1";
/** 메모리/스토리지 보호를 위한 최대 보존 게임 수 */
const MAX_HISTORY = 500;

export function loadHistory(): GameRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(-MAX_HISTORY);
  } catch {
    return [];
  }
}

export function appendHistory(record: GameRecord): GameRecord[] {
  const current = loadHistory();
  const updated = [...current, record].slice(-MAX_HISTORY);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  }
  return updated;
}

export interface ModeDifficultyStats {
  /** 같은 (mode, difficulty) 조합에서의 시도 횟수 (이번 게임 포함) */
  attempts: number;
  bestStreak: number;
  averageStreak: number;
  /**
   * 이번 점수가 자기 분포 내에서 상위 몇 %인지 (1~100, 작을수록 좋음).
   * 표본이 1개(첫 게임)이면 100을 반환.
   */
  topPercent: number;
}

/**
 * 새 게임이 끝난 직후 호출. history는 이미 이번 게임이 append된 상태로 받는다.
 */
export function computeStats(
  history: readonly GameRecord[],
  mode: GameMode,
  difficulty: Difficulty,
  currentStreak: number
): ModeDifficultyStats {
  const filtered = history.filter(
    (r) => r.mode === mode && r.difficulty === difficulty
  );

  const attempts = filtered.length;
  if (attempts === 0) {
    // 호출 측에서 이미 push했어야 정상이지만 방어적으로 처리
    return {
      attempts: 1,
      bestStreak: currentStreak,
      averageStreak: currentStreak,
      topPercent: 100,
    };
  }

  const bestStreak = filtered.reduce(
    (m, r) => (r.finalStreak > m ? r.finalStreak : m),
    0
  );
  const sum = filtered.reduce((s, r) => s + r.finalStreak, 0);
  const averageStreak = sum / attempts;

  // "이번 점수보다 같거나 높은 시도의 수" / 전체 → 작을수록 좋음
  const equalOrBetter = filtered.filter(
    (r) => r.finalStreak >= currentStreak
  ).length;
  const topPercent = Math.max(
    1,
    Math.round((equalOrBetter / attempts) * 100)
  );

  return { attempts, bestStreak, averageStreak, topPercent };
}
