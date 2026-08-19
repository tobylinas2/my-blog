import Link from "next/link";

interface ProjectCardProps {
  title: string;
  description: string;
  tags?: string[];
  github?: string;
  demo?: string;
  status?: string;
  slug: string;
}

export function ProjectCard({
  title,
  description,
  tags,
  github,
  demo,
  status,
  slug,
}: ProjectCardProps) {
  return (
    <div className="group p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <Link href={`/projects/${slug}`} className="text-lg font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {title}
        </Link>
        {status && (
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              status === "active"
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : status === "wip"
                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
            }`}
          >
            {status === "active" ? "进行中" : status === "wip" ? "开发中" : "已归档"}
          </span>
        )}
      </div>
      <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4 line-clamp-3">{description}</p>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-3 text-sm">
        {github && (
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            GitHub &rarr;
          </a>
        )}
        {demo && (
          <a
            href={demo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Demo &rarr;
          </a>
        )}
        <Link
          href={`/projects/${slug}`}
          className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors ml-auto"
        >
          详情 &rarr;
        </Link>
      </div>
    </div>
  );
}
