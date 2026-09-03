"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";

interface TravelHeroProps {
  title: string;
  description: string;
  date: string;
  location?: string;
  cover: string;
}

/** 沉浸式游记头图：全幅出血封面 + 纸色渐晕 + 地名印章 + 标题信息层 */
export function TravelHero({ title, description, date, location, cover }: TravelHeroProps) {
  const fade = (delay: number) => ({
    "data-motion-item": true,
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: "easeOut" as const },
  });
  const zoom = {
    initial: { scale: 1.04 },
    animate: { scale: 1 },
    transition: { duration: 2.2, ease: "easeOut" as const },
  };

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2">
      <div className="relative h-[62vh] min-h-[420px] max-h-[680px] overflow-hidden sm:h-[72vh]">
        <motion.div className="absolute inset-0" {...zoom}>
          <Image
            src={cover}
            alt={`${title} 封面`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        {/* 上下纸色渐晕，让头图沉进纸张底色 */}
        <div className="absolute inset-0 bg-gradient-to-b from-paper/80 via-paper/5 to-paper" />
        {location && (
          <motion.div
            className="absolute right-5 top-5 rotate-2 rounded-md border-2 border-accent bg-paper/85 px-3 py-1.5 shadow-sm sm:right-10 sm:top-8"
            {...fade(0.9)}
          >
            <span className="font-display text-sm tracking-[0.35em] text-accent">
              {location}
            </span>
          </motion.div>
        )}
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-3xl px-6 pb-8 sm:pb-10">
          <motion.p
            className="font-mono text-xs tracking-wide text-ink-faint sm:text-sm"
            {...fade(0.15)}
          >
            <time dateTime={date}>{formatDate(date)}</time>
            {location ? ` · ${location}` : ""} · 五日行程
          </motion.p>
          <motion.h1 className="mt-2 font-display text-4xl sm:text-5xl" {...fade(0.3)}>
            {title}
          </motion.h1>
          <motion.p className="mt-3 max-w-xl text-[15px] text-ink-light" {...fade(0.45)}>
            {description}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
