import type { Metadata } from "next";
import { allTravels } from "contentlayer2/generated";
import { TravelCard } from "@/components/TravelCard";

export const metadata: Metadata = {
  title: "旅游日记",
  description: "路上的风景与故事",
};

export default function TravelPage() {
  const travels = allTravels.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">旅游日记</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        {travels.map((travel) => (
          <TravelCard
            key={travel.slug}
            title={travel.title}
            description={travel.description}
            date={travel.date}
            location={travel.location}
            cover={travel.cover}
            slug={travel.slug}
          />
        ))}
      </div>
    </div>
  );
}
