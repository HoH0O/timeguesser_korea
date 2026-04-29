/**
 * Phase 1 자체 검증 스크립트.
 *  1) 데이터 무결성: id 중복, 날짜 포맷, 카테고리 enum 검증
 *  2) 각 난이도별 출제 분포 시뮬레이션 (1,000회)
 *  3) 한 세션에서 연승 20문제까지 사건 중복 없이 뽑히는지 확인
 *  4) 정답 검증 헬퍼 동작 점검
 */

import {
  DIFFICULTY_RANGES,
  createQuestionGenerator,
  generateQuestion,
  getAllEvents,
  isCorrectAnswer,
} from "../lib/gameLogic";
import type { Category, Difficulty, GameEvent } from "../lib/types";

const VALID_CATEGORIES: Category[] = [
  "history",
  "economy",
  "culture",
  "sports",
  "politics",
  "disaster",
  "science",
];

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("✗ FAIL:", msg);
    process.exitCode = 1;
  }
}

function checkDataIntegrity(events: GameEvent[]) {
  console.log(`\n[1] 데이터 무결성 검사 — 총 ${events.length}개 사건`);
  const ids = new Set<number>();
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  let categoryCount: Record<string, number> = {};

  for (const e of events) {
    assert(!ids.has(e.id), `중복 id: ${e.id} (${e.title})`);
    ids.add(e.id);
    assert(isoDate.test(e.date), `날짜 포맷 오류: ${e.title} → ${e.date}`);
    assert(
      VALID_CATEGORIES.includes(e.category),
      `잘못된 카테고리: ${e.title} → ${e.category}`
    );
    assert(e.title.length > 0, `빈 제목: id=${e.id}`);
    categoryCount[e.category] = (categoryCount[e.category] ?? 0) + 1;
  }

  console.log("  카테고리 분포:", categoryCount);
  const years = events.map((e) => parseInt(e.date.slice(0, 4), 10));
  console.log(`  연도 범위: ${Math.min(...years)} ~ ${Math.max(...years)}`);
}

function simulateDistribution(difficulty: Difficulty, runs = 1000) {
  const range = DIFFICULTY_RANGES[difficulty];
  let success = 0;
  let outOfRange = 0;
  let wrongAnswerLogic = 0;
  const yearDiffs: number[] = [];

  for (let i = 0; i < runs; i++) {
    const q = generateQuestion(difficulty);
    if (!q) continue;
    success++;
    yearDiffs.push(q.yearDiff);
    if (q.yearDiff < range.minYearDiff || q.yearDiff >= range.maxYearDiff) {
      outOfRange++;
    }
    // earlierEventId가 실제로 더 이른 날짜인지 확인
    const earlier = [q.eventA, q.eventB].find((e) => e.id === q.earlierEventId)!;
    const other = q.eventA.id === earlier.id ? q.eventB : q.eventA;
    if (Date.parse(earlier.date) >= Date.parse(other.date)) {
      wrongAnswerLogic++;
    }
  }

  const avg =
    yearDiffs.length > 0
      ? (yearDiffs.reduce((a, b) => a + b, 0) / yearDiffs.length).toFixed(2)
      : "n/a";
  console.log(
    `  ${difficulty.padEnd(6)} | ${success}/${runs} 성공 | 평균 yearDiff=${avg} | 범위 이탈=${outOfRange} | 정답 로직 오류=${wrongAnswerLogic}`
  );
  assert(success === runs, `${difficulty}: 일부 출제 실패`);
  assert(outOfRange === 0, `${difficulty}: yearDiff 범위 이탈 발생`);
  assert(wrongAnswerLogic === 0, `${difficulty}: earlierEventId 산정 오류`);
}

function simulateSession() {
  console.log(`\n[3] 한 세션에서 연속 출제 (사건 중복 방지)`);
  for (const diff of ["easy", "normal", "hard"] as Difficulty[]) {
    const gen = createQuestionGenerator(diff);
    const seen = new Set<number>();
    let rounds = 0;
    for (let i = 0; i < 30; i++) {
      const q = gen.next();
      if (!q) break;
      assert(!seen.has(q.eventA.id), `${diff}: A 중복 ${q.eventA.id}`);
      assert(!seen.has(q.eventB.id), `${diff}: B 중복 ${q.eventB.id}`);
      seen.add(q.eventA.id);
      seen.add(q.eventB.id);
      rounds++;
    }
    console.log(`  ${diff.padEnd(6)} | 중복 없이 ${rounds}라운드 진행`);
    assert(rounds >= 5, `${diff}: 최소 연승 5라운드도 못 채움 (데이터 부족)`);
  }
}

function checkAnswerHelper() {
  console.log(`\n[4] 정답 판정 헬퍼 동작 확인`);
  const q = generateQuestion("easy");
  if (!q) {
    assert(false, "easy 난이도 출제 실패");
    return;
  }
  const wrongId = q.eventA.id === q.earlierEventId ? q.eventB.id : q.eventA.id;
  assert(isCorrectAnswer(q, q.earlierEventId), "정답 판정 실패");
  assert(!isCorrectAnswer(q, wrongId), "오답인데 정답으로 판정");
  console.log(`  ✓ isCorrectAnswer 정상 동작`);
}

function main() {
  const events = getAllEvents();
  checkDataIntegrity(events);

  console.log(`\n[2] 난이도별 출제 분포 (각 1,000회)`);
  simulateDistribution("easy");
  simulateDistribution("normal");
  simulateDistribution("hard");

  simulateSession();
  checkAnswerHelper();

  console.log(
    process.exitCode === 1
      ? "\n❌ 검증 실패 — 위 로그 확인 필요"
      : "\n✅ 모든 검증 통과"
  );
}

main();
