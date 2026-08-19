import type { Metadata } from "next";
import { allPosts } from "contentlayer2/generated";
import { PostCard } from "@/components/PostCard";

export const metadata: Metadata = {
  title: "博客",
  description: "所有文章",
};

export default function BlogPage() {
  const posts = allPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">博客</h1>
      <div className="space-y-2">
        {posts.map((post) => (
          <PostCard
            key={post.slug}
            title={post.title}
            description={post.description}
            date={post.date}
            tags={post.tags}
            slug={post.slug}
          />
        ))}
      </div>
    </div>
  );
}
