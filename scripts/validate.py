"""
Phase 1 검증 — Node가 설치되지 않은 환경에서도 데이터/알고리즘이 잘 도는지 확인하기 위한
TypeScript 미러 검증 스크립트. lib/gameLogic.ts 와 동일한 출제 알고리즘을 Python으로 재현한다.
실제 런타임 동작은 Phase 2 (Next.js) 단계에서 자동으로 검증됨.
"""

from __future__ import annotations
import json
import random
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EVENTS = json.loads((ROOT / "data" / "events.json").read_text(encoding="utf-8"))["events"]

VALID_CATEGORIES = {"history", "economy", "culture", "sports", "politics", "disaster", "science"}
DIFFICULTY_RANGES = {
    "easy":   (10, 100),
    "normal": (5, 10),
    "hard":   (0, 5),
}

failures: list[str] = []
def expect(cond: bool, msg: str) -> None:
    if not cond:
        failures.append(msg)
        print("  ✗", msg)


def year(e: dict) -> int:
    return int(e["date"][:4])


def ts(e: dict) -> int:
    return int(datetime.strptime(e["date"], "%Y-%m-%d").timestamp())


# ─── 1. 데이터 무결성 ────────────────────────────────────────────
print(f"[1] 데이터 무결성 — 총 {len(EVENTS)}개 사건")
ids = set()
date_re = re.compile(r"^\d{4}-\d{2}-\d{2}$")
for e in EVENTS:
    expect(e["id"] not in ids, f"중복 id: {e['id']}")
    ids.add(e["id"])
    expect(bool(date_re.match(e["date"])), f"날짜 포맷 오류: {e['title']} → {e['date']}")
    expect(e["category"] in VALID_CATEGORIES, f"카테고리 오류: {e['title']} → {e['category']}")
    expect(len(e["title"]) > 0, f"빈 제목: id={e['id']}")
print("  카테고리 분포:", dict(Counter(e["category"] for e in EVENTS)))
years = [year(e) for e in EVENTS]
print(f"  연도 범위: {min(years)} ~ {max(years)}")


# ─── 2. 난이도별 출제 분포 ──────────────────────────────────────
def generate_question(difficulty: str, exclude: set[int] | None = None):
    exclude = exclude or set()
    pool = [e for e in EVENTS if e["id"] not in exclude]
    if len(pool) < 2:
        return None
    lo, hi = DIFFICULTY_RANGES[difficulty]
    order = pool[:]
    random.shuffle(order)
    for base in order:
        by = year(base)
        bts = ts(base)
        cands = [
            o for o in pool
            if o["id"] != base["id"]
            and lo <= abs(year(o) - by) < hi
            and ts(o) != bts
        ]
        if not cands:
            continue
        partner = random.choice(cands)
        earlier = base if bts < ts(partner) else partner
        a, b = (base, partner) if random.random() < 0.5 else (partner, base)
        return {
            "eventA": a, "eventB": b,
            "earlierEventId": earlier["id"],
            "yearDiff": abs(year(partner) - by),
        }
    return None


print("\n[2] 난이도별 출제 분포 (각 1,000회)")
for diff in ["easy", "normal", "hard"]:
    lo, hi = DIFFICULTY_RANGES[diff]
    success = out_of_range = wrong_logic = 0
    diffs: list[int] = []
    for _ in range(1000):
        q = generate_question(diff)
        if not q:
            continue
        success += 1
        diffs.append(q["yearDiff"])
        if not (lo <= q["yearDiff"] < hi):
            out_of_range += 1
        earlier = next(e for e in (q["eventA"], q["eventB"]) if e["id"] == q["earlierEventId"])
        other = q["eventB"] if earlier["id"] == q["eventA"]["id"] else q["eventA"]
        if ts(earlier) >= ts(other):
            wrong_logic += 1
    avg = sum(diffs) / len(diffs) if diffs else 0
    print(f"  {diff:6s} | {success}/1000 성공 | 평균 yearDiff={avg:.2f} | 범위 이탈={out_of_range} | 정답 로직 오류={wrong_logic}")
    expect(success == 1000, f"{diff}: 일부 출제 실패 ({success}/1000)")
    expect(out_of_range == 0, f"{diff}: yearDiff 범위 이탈 {out_of_range}건")
    expect(wrong_logic == 0, f"{diff}: earlierEventId 산정 오류 {wrong_logic}건")


# ─── 3. 한 세션에서 연속 출제 시 사건 중복 방지 ─────────────────
print("\n[3] 한 세션에서 연속 출제 (중복 방지)")
for diff in ["easy", "normal", "hard"]:
    used: set[int] = set()
    rounds = 0
    for _ in range(30):
        q = generate_question(diff, exclude=used)
        if not q:
            break
        expect(q["eventA"]["id"] not in used and q["eventB"]["id"] not in used,
               f"{diff}: 사건 중복 발생")
        used.add(q["eventA"]["id"])
        used.add(q["eventB"]["id"])
        rounds += 1
    print(f"  {diff:6s} | 중복 없이 {rounds}라운드 진행")
    expect(rounds >= 5, f"{diff}: 최소 연승 5라운드도 못 채움")


# ─── 결과 ────────────────────────────────────────────────────────
print()
if failures:
    print(f"❌ 검증 실패 — {len(failures)}건")
    for f in failures:
        print("  -", f)
    raise SystemExit(1)
else:
    print("✅ 모든 검증 통과")
