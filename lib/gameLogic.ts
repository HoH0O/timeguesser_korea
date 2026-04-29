import eventsData from "../data/events.json";
import type {
  Category,
  Difficulty,
  DifficultyRange,
  GameEvent,
  QuestionPair,
} from "./types";

/**
 * 난이도별 출제 범위.
 * 비중복 구간으로 정의해 난이도가 올라갈수록 두 사건의 시간 격차가 좁아지도록 한다.
 *  - easy:   10년 이상 ~ 100년 미만
 *  - normal:  5년 이상 ~  10년 미만
 *  - hard:   0년 이상 ~   5년 미만 (단, 동일 날짜 사건은 제외)
 */
export const DIFFICULTY_RANGES: Record<Difficulty, DifficultyRange> = {
  easy: { minYearDiff: 10, maxYearDiff: 100 },
  normal: { minYearDiff: 5, maxYearDiff: 10 },
  hard: { minYearDiff: 0, maxYearDiff: 5 },
};

const ALL_EVENTS: GameEvent[] = (eventsData as { events: GameEvent[] }).events;

export function getAllEvents(): GameEvent[] {
  return ALL_EVENTS;
}

function getYear(event: GameEvent): number {
  return parseInt(event.date.slice(0, 4), 10);
}

function getTimestamp(event: GameEvent): number {
  // "YYYY-MM-DD" → UTC 기준 timestamp. JS Date는 0-99년을 1900-1999로 매핑하는
  // 레거시 동작이 있어 4자리 연도로 통일된 입력이라는 전제로 동작.
  return Date.parse(event.date + "T00:00:00Z");
}

function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface GenerateOptions {
  /** 이전에 출제된 사건은 다시 등장하지 않도록 제외 (연승 시 다양성 확보) */
  excludeIds?: ReadonlySet<number>;
  /** 테스트 시 결정성 확보를 위해 풀 전체를 강제로 사용할 때 */
  pool?: readonly GameEvent[];
}

/**
 * 주어진 난이도에 맞는 두 사건 쌍을 생성한다.
 *
 * 알고리즘:
 *   1. 사용 가능 풀을 셔플하여 base event 후보 순서를 무작위화
 *   2. 각 base에 대해 "연도 차이가 [min, max) 범위" 인 파트너 후보를 필터링
 *      - hard 난이도일 때 두 사건의 timestamp가 동일하면 제외 (정답 결정 불가)
 *   3. 후보가 있으면 무작위 파트너 선택 후 좌우 위치를 셔플하여 반환
 *   4. 끝까지 후보가 없으면 null 반환 (호출 측에서 데이터 보강 필요)
 */
export function generateQuestion(
  difficulty: Difficulty,
  options: GenerateOptions = {}
): QuestionPair | null {
  const { excludeIds, pool = ALL_EVENTS } = options;
  const range = DIFFICULTY_RANGES[difficulty];

  const available = excludeIds
    ? pool.filter((e) => !excludeIds.has(e.id))
    : [...pool];

  if (available.length < 2) return null;

  const baseOrder = shuffle(available);

  for (const base of baseOrder) {
    const baseYear = getYear(base);
    const baseTs = getTimestamp(base);

    const candidates = available.filter((other) => {
      if (other.id === base.id) return false;
      const diff = Math.abs(getYear(other) - baseYear);
      if (diff < range.minYearDiff || diff >= range.maxYearDiff) return false;
      // 정답이 결정되지 않는 동일 timestamp 쌍 제외
      if (getTimestamp(other) === baseTs) return false;
      return true;
    });

    if (candidates.length === 0) continue;

    const partner = pickRandom(candidates);
    const baseEarlier = baseTs < getTimestamp(partner);
    const earlierEvent = baseEarlier ? base : partner;

    const [eventA, eventB] = Math.random() < 0.5 ? [base, partner] : [partner, base];

    return {
      eventA,
      eventB,
      earlierEventId: earlierEvent.id,
      yearDiff: Math.abs(getYear(partner) - baseYear),
      dayDiff: Math.abs(getTimestamp(partner) - baseTs) / 86_400_000,
      difficulty,
    };
  }

  return null;
}

interface GeneratorOptions {
  /** 출제에서 제외할 카테고리 (예: 스트리밍 모드에서 disaster 제외) */
  excludeCategories?: ReadonlySet<Category>;
}

/**
 * 한 게임 세션을 위한 출제기. 같은 사건이 반복되지 않도록 내부 상태로 추적한다.
 * Phase 2 UI에서 useRef/useState 어느 쪽으로도 끼울 수 있도록 클래스가 아닌 클로저로 구성.
 */
export function createQuestionGenerator(
  difficulty: Difficulty,
  options: GeneratorOptions = {}
) {
  const used = new Set<number>();
  const pool = options.excludeCategories
    ? ALL_EVENTS.filter((e) => !options.excludeCategories!.has(e.category))
    : ALL_EVENTS;

  return {
    next(): QuestionPair | null {
      const q = generateQuestion(difficulty, { excludeIds: used, pool });
      if (!q) return null;
      // 매 라운드마다 base는 교체되도록 두 사건 모두 used에 등록
      used.add(q.eventA.id);
      used.add(q.eventB.id);
      return q;
    },
    reset() {
      used.clear();
    },
    /** 디버깅용: 지금까지 사용된 사건 id */
    getUsedIds(): ReadonlySet<number> {
      return used;
    },
    /** 디버깅용: 현재 풀 크기 */
    getPoolSize(): number {
      return pool.length;
    },
  };
}

/**
 * 정답 검증. UI 레이어에서 클릭한 사건 id를 넘기면 정답 여부를 돌려준다.
 */
export function isCorrectAnswer(question: QuestionPair, pickedId: number): boolean {
  return question.earlierEventId === pickedId;
}
