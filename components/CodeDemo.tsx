"use client";

import { useState } from "react";

interface CodeDemoProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeDemo({ code, language = "typescript", title }: CodeDemoProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 my-6">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-mono text-zinc-500">{title}</span>
          <span className="text-xs text-zinc-400">{language}</span>
        </div>
      )}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm bg-zinc-950 text-zinc-100">
          <code>{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
        >
          {copied ? "已复制!" : "复制"}
        </button>
      </div>
    </div>
  );
}
