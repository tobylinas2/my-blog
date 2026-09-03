"use client";

import { motion } from "framer-motion";

const CN_NUM = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖", "拾"];

interface DaySectionProps {
  /** 第几日（1-10），用于日戳与锚点 */
  day: number;
  title: string;
  /** 当日路线，如「杭州东 → 贵阳北」 */
  route?: string;
  children: React.ReactNode;
}

/** 按日分段的章节容器：日戳 + 路线 + 衬线标题 + 水彩笔触下划线 */
export function DaySection({ day, title, route, children }: DaySectionProps) {
  const numeral = CN_NUM[day] ?? String(day);
  const reveal = {
    "data-motion-item": true,
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-48px" },
    transition: { duration: 0.6, ease: "easeOut" as const },
  };

  return (
    <motion.section
      id={`day-${day}`}
      className="mt-16 flow-root scroll-mt-24 first:mt-12"
      {...reveal}
    >
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-block -rotate-2 rounded-md border-2 border-accent/70 px-2.5 py-1 font-display text-xs tracking-[0.3em] text-accent">
            第{numeral}日
          </span>
          {route && (
            <span className="font-mono text-xs tracking-wide text-ink-faint">{route}</span>
          )}
        </div>
        <h2 className="mt-3 font-display text-2xl sm:text-3xl">{title}</h2>
        <svg
          className="mt-2.5 text-accent-light"
          width="180"
          height="10"
          viewBox="0 0 180 10"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 6 C 40 1, 80 9, 120 5 S 168 3, 178 5"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>
      </header>
      {children}
    </motion.section>
  );
}
