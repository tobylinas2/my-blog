"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface TravelLightboxProps {
  src: string;
  alt: string;
  caption?: string;
  onClose: () => void;
}

/**
 * 旅记图片全屏查看（TOB-384）。portal 到 body——TravelPhoto 的祖先带
 * transform（破格位移/卡片微倾），fixed 定位会被劫持为相对该祖先。
 * Esc / 背板 / × 关闭；打开期间锁定页面滚动。
 */
export function TravelLightbox({ src, alt, caption, onClose }: TravelLightboxProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      data-lightbox
      role="dialog"
      aria-modal="true"
      aria-label={`全屏查看：${alt}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        data-lightbox-close
        aria-label="关闭全屏查看"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full border border-paper/30 bg-paper/10 px-3 py-1.5 text-xl leading-none text-paper transition-colors hover:bg-paper/20"
      >
        ×
      </button>
      {/* 图与说明一起挡掉背板点击，点文字不致误关 */}
      <div
        className="flex max-h-full flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0.96 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Image
            src={src}
            alt={alt}
            width={1600}
            height={1200}
            className="h-auto w-auto max-h-[86vh] max-w-[94vw] rounded-md object-contain shadow-2xl"
          />
        </motion.div>
        {caption && (
          <p className="mt-3 max-w-[94vw] text-center text-sm leading-relaxed text-paper/80">
            {caption}
          </p>
        )}
      </div>
    </motion.div>,
    document.body
  );
}
