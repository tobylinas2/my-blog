import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  title: string;
  description: string;
  date: string;
  tags?: string[];
  slug: string;
}

export function PostCard({ title, description, date, tags, slug }: PostCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group block p-4 -mx-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
    >
      <article>
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-1">
          <time dateTime={date}>{formatDate(date)}</time>
        </div>
        <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">{description}</p>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
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
      </article>
    </Link>
  );
}
