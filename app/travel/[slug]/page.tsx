import type { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import { allTravels } from "contentlayer2/generated";
import { MDXRenderer } from "@/components/MDXRenderer";
import { TravelHero } from "@/components/TravelHero";
import { TravelMotionConfig } from "@/components/TravelMotionConfig";
import { TravelOrigProvider } from "@/components/TravelOrigContext";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * 构建期检测本文是否带有原图集（public/<cover 目录>/orig/，TOB-384）：
 * 存在才为正文照片启用原图/风格化切换，返回其 public 路径。
 */
function travelOrigBase(cover?: string): string | undefined {
  if (!cover) return undefined;
  const base = path.posix.join(path.posix.dirname(cover), "orig");
  return fs.existsSync(path.join(process.cwd(), "public", base)) ? base : undefined;
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
      <TravelMotionConfig>
        {travel.cover ? (
          <div className="-mt-12 mb-2">
            <TravelHero
              title={travel.title}
              description={travel.description}
              date={travel.date}
              location={travel.location}
              cover={travel.cover}
              tags={travel.tags}
            />
          </div>
        ) : (
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
        )}
        <TravelOrigProvider base={travelOrigBase(travel.cover)}>
          <MDXRenderer code={travel.body.code} />
        </TravelOrigProvider>
      </TravelMotionConfig>
    </article>
  );
}
