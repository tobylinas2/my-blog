/** 水彩笔触分隔线：两道错落的洗染笔触 + 一枚墨点 */
export function TravelDivider() {
  return (
    <div className="my-12 flex justify-center" aria-hidden="true">
      <svg width="220" height="18" viewBox="0 0 220 18" fill="none">
        <path
          d="M4 10 C 50 3, 90 15, 130 8 S 200 6, 216 9"
          stroke="var(--color-accent-light)"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M30 14 C 80 9, 130 15, 190 12"
          stroke="var(--color-border)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <circle cx="110" cy="9" r="2.5" fill="var(--color-accent)" />
      </svg>
    </div>
  );
}
