import type { Metadata } from "next";
import { GithubIcon, TwitterIcon } from "@/components/SocialIcons";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-xl">
      <h1 className="text-3xl font-bold">About</h1>
      <div className="space-y-4 text-ink-light leading-relaxed">
        <p>
          独立开发者，主要做 Minecraft 相关的 Mod 和工具。
        </p>
        <p>
          目前在维护两个开源项目：Mcedia（在 Minecraft 里看视频）和
          Toby&apos;s Camera（把 Minecraft 拍成照片）。
        </p>
        <p>
          喜欢折腾客户端渲染、音视频解码和游戏内交互这些东西。
        </p>
      </div>
      <div className="border-t border-border pt-6 space-y-3 text-sm">
        <p className="text-ink-faint font-mono">Find me at</p>
        <div className="space-y-2">
          <a
            href="https://github.com/tobyprime"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-ink-light hover:text-ink transition-colors"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub</span>
          </a>
          <a
            href="https://twitter.com/toby_linas"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-ink-light hover:text-ink transition-colors"
          >
            <TwitterIcon className="w-4 h-4" />
            <span>@toby_linas</span>
          </a>
        </div>
      </div>
    </div>
  );
}
