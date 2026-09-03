"use client";

import { MotionConfig } from "framer-motion";

/** 游记页动效配置：reducedMotion="user" 尊重系统减弱动效设置（变换跳变、淡入保留） */
export function TravelMotionConfig({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
