"use client";

import { createContext, useContext } from "react";

/**
 * 旅记原图切换上下文（TOB-384）：base 指向本文的原图目录
 * （如 /images/travel/guizhou/orig）。由 travel 页面在构建期检测
 * public/<base> 是否存在后注入；未注入时 TravelPhoto 不渲染切换按钮。
 */
const TravelOrigContext = createContext<string | null>(null);

export function TravelOrigProvider({
  base,
  children,
}: {
  base?: string;
  children: React.ReactNode;
}) {
  return (
    <TravelOrigContext.Provider value={base ?? null}>
      {children}
    </TravelOrigContext.Provider>
  );
}

/** 由风格化图 URL 解析同目录 orig/ 下的原图 URL；本文无原图目录时返回 null */
export function useTravelOrigSrc(src: string): string | null {
  const base = useContext(TravelOrigContext);
  if (!base || !src.startsWith("/images/travel/")) return null;
  const name = src.slice(src.lastIndexOf("/") + 1);
  return `${base}/${name}`;
}
