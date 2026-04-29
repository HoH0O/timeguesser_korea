import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TimeGuessr Korea — 한국사 사건 선후 맞히기",
  description:
    "두 한국사 사건 중 먼저 일어난 것을 골라보세요. 연승 기록에 도전하는 캐주얼 퀴즈 게임.",
  openGraph: {
    title: "TimeGuessr Korea",
    description: "한국사 사건의 선후 관계를 맞춰보는 캐주얼 퀴즈 게임",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
