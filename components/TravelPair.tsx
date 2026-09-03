import { cn } from "@/lib/utils";

interface TravelPairProps {
  children: React.ReactNode;
  className?: string;
}

/** 双列照片组合：子项放两张 TravelPhoto（variant="card"），移动端退化为单列 */
export function TravelPair({ children, className }: TravelPairProps) {
  return (
    <div className={cn("my-9 grid items-start gap-5 sm:grid-cols-2", className)}>
      {children}
    </div>
  );
}
