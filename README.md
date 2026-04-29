# TimeGuessr Korea 🇰🇷

한국에서 일어난 역사·경제·문화 사건의 **선후 관계를 맞추는** 캐주얼 퀴즈 게임.
[The Higher Lower Game](https://www.higherlowergame.com/) 형식을 한국사 데이터로 재해석했습니다.

## 게임 룰

- 화면에 두 사건이 동시에 나타납니다.
- 두 사건 중 **먼저 일어난 사건**을 골라야 합니다.
- 정답이면 연승(Streak)이 올라가고, 오답이면 게임 오버.

## 난이도

| 난이도 | 두 사건의 연도 격차 |
|:------:|:---|
| 쉬움 (Easy) | 10년 ~ 100년 |
| 보통 (Normal) | 5년 ~ 10년 |
| 어려움 (Hard) | 5년 미만 (단, 동일 날짜는 제외) |

연승 최고 기록은 `localStorage`에 저장됩니다.

## 기술 스택

- **Next.js 14** (App Router) · TypeScript · React 18
- **Tailwind CSS** — keyframe 애니메이션 (정답 펄스 / 오답 shake / count-up)
- **데이터** — 나무위키 기반 108개 한국사 사건 (`data/events.json`)

## 시작하기

```bash
npm install
npm run dev          # http://localhost:3000
```

추가 스크립트:

```bash
npm run validate     # 데이터 무결성 + 출제 알고리즘 1,000회 시뮬레이션
npm run demo         # 난이도별 샘플 문제 5개씩 콘솔에 출력
npm run build        # 프로덕션 빌드
```

## 프로젝트 구조

```
.
├── app/
│   ├── layout.tsx          # 루트 레이아웃 (다크 그라디언트 배경)
│   ├── page.tsx            # 게임 상태 머신 (intro → playing → gameover)
│   └── globals.css         # Tailwind + 카테고리별 액센트 컬러
├── components/
│   ├── EventCard.tsx       # 분할 화면 카드 (정답 시 펄스, 오답 시 shake)
│   ├── IntroScreen.tsx     # 난이도 선택
│   ├── PlayScreen.tsx      # 두 카드 + VS 라벨 + 연승 카운터
│   └── GameOverScreen.tsx  # 최종 점수 + 다시 도전
├── lib/
│   ├── types.ts            # GameEvent / Difficulty / QuestionPair
│   └── gameLogic.ts        # 출제 알고리즘 (createQuestionGenerator 등)
├── data/
│   └── events.json         # 한국사 사건 108개
└── scripts/
    ├── validate.ts         # 자체 검증
    ├── demo.ts             # 데모 출제
    └── validate.py         # Node 미설치 환경에서도 알고리즘 검증
```

## 출제 알고리즘 (요약)

1. 풀을 셔플하여 base event 후보를 무작위로 순회
2. base에 대해 `[minYearDiff, maxYearDiff)` 범위에 들어오는 파트너 후보를 필터
3. 동일 timestamp 사건은 정답 결정이 불가하므로 제외
4. 후보가 있으면 무작위 파트너 선택, 좌우 위치도 랜덤

`createQuestionGenerator(difficulty)`는 한 세션 내에서 같은 사건이 다시 나오지 않도록 내부에 사용 ID를 기록합니다.

## 배포

권장: **Vercel** (Next.js 공식 호스팅)

1. 이 리포지토리를 GitHub에 push
2. <https://vercel.com/new> 에서 import
3. 별도 환경 변수 없음, 기본 빌드 설정 그대로

## 데이터 출처

- 모든 사건은 [나무위키](https://namu.wiki) 한국사·경제사·대중문화 연표를 참고하여 정리했습니다.
- 각 사건은 `namuwiki_url` 필드로 원문 링크가 연결되어 있습니다.

## 라이선스

개인 학습/포트폴리오 용도. 데이터는 나무위키 CC BY-NC-SA 2.0 KR 라이선스를 따릅니다.
