import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allPosts } from "contentlayer2/generated";
import { MDXRenderer } from "@/components/MDXRenderer";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = allPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = allPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <article>
      <header className="mb-8">
        <time className="text-sm text-zinc-500">{formatDate(post.date)}</time>
        <h1 className="text-3xl font-bold mt-1">{post.title}</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">{post.description}</p>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>
      <MDXRenderer code={post.body.code} />
    </article>
  );
}
