/**
 * 난이도별 샘플 문제 5개씩 출력해 실제 출제 결과를 눈으로 확인하기 위한 데모 스크립트.
 */

import { createQuestionGenerator } from "../lib/gameLogic";
import type { Difficulty, QuestionPair } from "../lib/types";

function render(q: QuestionPair, idx: number) {
  const earlier = q.eventA.id === q.earlierEventId ? "A" : "B";
  console.log(
    `  Q${idx + 1}. (yearDiff=${q.yearDiff}년)\n` +
      `    A) ${q.eventA.date}  ${q.eventA.title}\n` +
      `    B) ${q.eventB.date}  ${q.eventB.title}\n` +
      `    → 먼저 일어난 사건: ${earlier}`
  );
}

for (const diff of ["easy", "normal", "hard"] as Difficulty[]) {
  console.log(`\n━━━ 난이도: ${diff.toUpperCase()} ━━━`);
  const gen = createQuestionGenerator(diff);
  for (let i = 0; i < 5; i++) {
    const q = gen.next();
    if (!q) {
      console.log("  (출제 가능한 사건 부족)");
      break;
    }
    render(q, i);
  }
}
