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
    <div className="rounded-lg overflow-hidden border border-border my-6">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-paper-dark border-b border-border">
          <span className="text-xs font-mono text-ink-faint">{title}</span>
          <span className="text-xs text-ink-faint">{language}</span>
        </div>
      )}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm bg-ink text-paper font-mono">
          <code>{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-paper/20 hover:bg-paper/30 text-paper transition-colors font-mono"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
