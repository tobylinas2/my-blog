import { allPosts } from "contentlayer2/generated";
import { allProjects } from "contentlayer2/generated";
import { PostCard } from "@/components/PostCard";
import { ProjectCard } from "@/components/ProjectCard";

export default function Home() {
  const recentPosts = allPosts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const recentProjects = allProjects
    .filter((p) => p.status === "active" || p.status === "wip")
    .slice(0, 2);

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Hi, I&apos;m Your Name</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          在这里记录我的学习心得、技术分享和项目介绍。
        </p>
      </section>

      {/* Recent Posts */}
      <section>
        <h2 className="text-2xl font-bold mb-6">最近文章</h2>
        <div className="space-y-2">
          {recentPosts.map((post) => (
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
      </section>

      {/* Active Projects */}
      {recentProjects.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">活跃项目</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {recentProjects.map((project) => (
              <ProjectCard
                key={project.slug}
                title={project.title}
                description={project.description}
                tags={project.tags}
                github={project.github}
                demo={project.demo}
                status={project.status}
                slug={project.slug}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
