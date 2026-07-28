interface ProgressRingProps {
  pct: number;
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({ pct, size = 88, strokeWidth = 7 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(pct, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" strokeWidth={strokeWidth}
        className="stroke-primary/15"
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" strokeWidth={strokeWidth}
        className="stroke-primary transition-all duration-700"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}
