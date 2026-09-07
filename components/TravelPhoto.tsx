"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTravelOrigSrc } from "./TravelOrigContext";
import { TravelLightbox } from "./TravelLightbox";

type TravelPhotoVariant = "card" | "wide" | "full" | "side";

interface TravelPhotoProps {
  /** 照片序号（1-25），caption 前以「图 NN」展示 */
  num: number;
  src: string;
  caption: string;
  alt?: string;
  /** card: 手账照片卡（默认） / wide: 破格宽图 / full: 全幅出血图 / side: 桌面端侧栏对齐图块，不环绕文字 */
  variant?: TravelPhotoVariant;
  /** variant="side" 时浮动方向 */
  side?: "left" | "right";
  /** 容器宽高比，如 "3/2"、"3/4" */
  ratio?: string;
  className?: string;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function TravelPhoto({
  num,
  src,
  caption,
  alt,
  variant = "card",
  side = "right",
  ratio = "3/2",
  className,
}: TravelPhotoProps) {
  const orig = useTravelOrigSrc(src);
  const [showOrig, setShowOrig] = useState(false);
  // 原图首次切换才挂载（默认访问不加载 41 张原图），之后保持挂载避免来回重复请求
  const [origMounted, setOrigMounted] = useState(false);
  const select = (next: boolean) => {
    setShowOrig(next);
    if (next) setOrigMounted(true);
  };
  // 点图全屏查看（TOB-384）：展示当前生效的变体（切原图后即原图）
  const [zoom, setZoom] = useState(false);
  const framed = variant !== "full";
  // 三个嵌套层各持一种 transform：外层破格位移 / reveal 升起 / 卡片微倾
  const bleed =
    variant === "full"
      ? "relative left-1/2 w-screen -translate-x-1/2"
      : variant === "wide"
        ? "relative left-1/2 w-[min(960px,calc(100vw-2rem))] -translate-x-1/2"
        : variant === "side"
          ? cn(
              "mx-auto w-full max-w-md md:max-w-[46%]",
              side === "left" ? "md:ml-0" : "md:mr-0"
            )
          : "mx-auto max-w-md";

  const reveal = {
    "data-motion-item": true,
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-64px" },
    transition: { duration: 0.7, ease: "easeOut" as const },
  };

  return (
    <div className={cn("my-9", bleed, className)}>
      <motion.figure {...reveal}>
        <div
          className={cn(
            "rounded-lg border border-border bg-card shadow-[0_14px_36px_-18px_rgba(44,36,22,0.35)]",
            framed ? "p-2 sm:p-2.5" : "overflow-hidden",
            variant === "card" &&
              cn(
                "transition-transform duration-500 hover:rotate-0",
                num % 2 === 0 ? "-rotate-1" : "rotate-1"
              )
          )}
        >
          <div
            className="relative overflow-hidden rounded-md"
            style={{ aspectRatio: ratio }}
          >
            <Image
              src={src}
              alt={alt ?? caption}
              fill
              sizes={variant === "card" ? "(max-width: 768px) 90vw, 448px" : "90vw"}
              className={cn(
                "object-cover transition-opacity duration-500",
                orig && showOrig && "opacity-0"
              )}
            />
            {orig && origMounted && (
              <Image
                src={orig}
                alt={`原图：${alt ?? caption}`}
                fill
                sizes={variant === "card" ? "(max-width: 768px) 90vw, 448px" : "90vw"}
                className={cn(
                  "object-cover transition-opacity duration-500",
                  !showOrig && "opacity-0"
                )}
              />
            )}
            {/* 点图开全屏：盖住两张图、位于切换胶囊之下 */}
            <button
              type="button"
              data-lightbox-open
              aria-label={`全屏查看：${alt ?? caption}`}
              onClick={() => setZoom(true)}
              className="absolute inset-0 z-0 cursor-zoom-in bg-transparent"
            />
            {orig && (
              <div
                className="absolute right-2 top-2 z-10 flex overflow-hidden rounded-full border border-border bg-paper/90 text-[11px] shadow-sm backdrop-blur-sm"
                role="group"
                aria-label="切换原图与风格化"
              >
                <button
                  type="button"
                  onClick={() => select(true)}
                  aria-pressed={showOrig}
                  className={cn(
                    "px-2.5 py-1 tracking-wide transition-colors",
                    showOrig ? "bg-ink text-paper" : "text-ink-light hover:text-ink"
                  )}
                >
                  原图
                </button>
                <button
                  type="button"
                  onClick={() => select(false)}
                  aria-pressed={!showOrig}
                  className={cn(
                    "px-2.5 py-1 tracking-wide transition-colors",
                    !showOrig ? "bg-ink text-paper" : "text-ink-light hover:text-ink"
                  )}
                >
                  风格化
                </button>
              </div>
            )}
          </div>
        </div>
        <figcaption className="mt-2.5 px-1 leading-relaxed">
          <span className="mr-2 font-mono text-xs tracking-widest text-accent">
            图 {pad2(num)}
          </span>
          <span className="text-sm text-ink-light">{caption}</span>
        </figcaption>
      </motion.figure>
      {zoom && (
        <TravelLightbox
          src={orig && showOrig ? orig : src}
          alt={alt ?? caption}
          caption={caption}
          onClose={() => setZoom(false)}
        />
      )}
    </div>
  );
}
