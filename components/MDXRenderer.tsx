"use client";

import { useMDXComponent } from "next-contentlayer2/hooks";
import { MDXComponents } from "./MDXComponents";

interface MDXRendererProps {
  code: string;
}

export function MDXRenderer({ code }: MDXRendererProps) {
  const MDXContent = useMDXComponent(code);
  return (
    <div className="prose dark:prose-invert max-w-none">
      <MDXContent components={MDXComponents} />
    </div>
  );
}
