import type { Metadata } from "next";
import { allProjects } from "contentlayer2/generated";
import { ProjectCard } from "@/components/ProjectCard";

export const metadata: Metadata = {
  title: "项目",
  description: "我做的东西",
};

export default function ProjectsPage() {
  const projects = allProjects.sort((a, b) => {
    const order = { active: 0, wip: 1, archived: 2 };
    return (order[a.status as keyof typeof order] ?? 0) - (order[b.status as keyof typeof order] ?? 0);
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">项目</h1>
      <div className="space-y-4">
        {projects.map((project) => (
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
    </div>
  );
}
