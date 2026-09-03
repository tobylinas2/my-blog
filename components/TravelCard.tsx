import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface TravelCardProps {
  title: string;
  description: string;
  date: string;
  location?: string;
  cover?: string;
  slug: string;
}

export function TravelCard({
  title,
  description,
  date,
  location,
  cover,
  slug,
}: TravelCardProps) {
  return (
    <Link
      href={`/travel/${slug}`}
      className="group block rounded-xl border border-border bg-card overflow-hidden hover:border-accent-light transition-colors"
    >
      <div className="relative aspect-[16/9] bg-paper-dark">
        {cover ? (
          <Image
            src={cover}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            style={{
              filter: "sepia(0.15) saturate(0.9) brightness(1.02) contrast(0.95)",
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-sm uppercase tracking-widest text-ink-faint">
              {location ?? "Travel"}
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 text-sm text-ink-faint">
          <time dateTime={date}>{formatDate(date)}</time>
          {location && (
            <>
              <span aria-hidden="true">·</span>
              <span>{location}</span>
            </>
          )}
        </div>
        <h3 className="text-lg font-semibold mt-1 group-hover:text-accent transition-colors">
          {title}
        </h3>
        <p className="text-ink-light mt-2 text-[15px] line-clamp-2">
          {description}
        </p>
      </div>
    </Link>
  );
}
