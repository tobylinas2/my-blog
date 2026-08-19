import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于",
  description: "关于我",
};

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">关于我</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          你好！这里是我的个人博客，用来记录学习心得、技术分享和项目介绍。
        </p>
        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          在这里你可以找到我最近在做的事情，以及我对一些技术话题的思考。
        </p>
        <h2 className="text-2xl font-bold mt-8">联系方式</h2>
        <ul className="space-y-2 text-zinc-700 dark:text-zinc-300">
          <li>
            GitHub:{" "}
            <a
              href="https://github.com/your-username"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              @your-username
            </a>
          </li>
          <li>
            Email:{" "}
            <a
              href="mailto:your-email@example.com"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              your-email@example.com
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
