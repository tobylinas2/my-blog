import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allTravels } from "contentlayer2/generated";
import { MDXRenderer } from "@/components/MDXRenderer";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allTravels.map((travel) => ({ slug: travel.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const travel = allTravels.find((t) => t.slug === slug);
  if (!travel) return {};
  return {
    title: travel.title,
    description: travel.description,
  };
}

export default async function TravelEntry({ params }: Props) {
  const { slug } = await params;
  const travel = allTravels.find((t) => t.slug === slug);
  if (!travel) notFound();

  return (
    <article>
      <header className="mb-8">
        <div className="flex items-center gap-2 text-sm text-ink-faint">
          <time dateTime={travel.date}>{formatDate(travel.date)}</time>
          {travel.location && (
            <>
              <span aria-hidden="true">·</span>
              <span>{travel.location}</span>
            </>
          )}
        </div>
        <h1 className="text-3xl font-bold mt-1">{travel.title}</h1>
        <p className="text-ink-light mt-2">{travel.description}</p>
        {travel.tags && travel.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {travel.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full bg-paper-dark text-ink-light border border-border"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>
      <MDXRenderer code={travel.body.code} />
    </article>
  );
}
