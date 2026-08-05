const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

function parseQuestionText(raw: string): { intro: string; statements: string[] } | null {
  const positions: { idx: number; len: number }[] = [];

  for (let n = 1; n <= 9; n++) {
    const startFrom =
      positions.length > 0
        ? positions[positions.length - 1].idx + positions[positions.length - 1].len
        : 0;
    // Match any whitespace + digit + period + whitespace
    const re = new RegExp(`[\\s]${n}\\.\\s`);
    const match = raw.slice(startFrom).match(re);
    if (!match) break;
    positions.push({ idx: startFrom + match.index!, len: match[0].length });
  }

  if (positions.length < 2) return null;

  const intro = raw.slice(0, positions[0].idx).trim();
  const statements = positions.map((pos, i) => {
    const from = pos.idx + pos.len;
    const to = i + 1 < positions.length ? positions[i + 1].idx : raw.length;
    return raw.slice(from, to).trim();
  });

  return { intro, statements };
}

export function QuestionText({
  text,
  introClassName,
  stmtClassName,
}: {
  text: string;
  introClassName?: string;
  stmtClassName?: string;
}) {
  const parsed = parseQuestionText(text);

  if (!parsed) {
    return <p className={introClassName ?? 'text-sm font-semibold leading-relaxed'}>{text}</p>;
  }

  return (
    <div className="space-y-3">
      {parsed.intro && (
        <p className={introClassName ?? 'text-sm font-semibold leading-relaxed'}>{parsed.intro}</p>
      )}
      <div className="rounded-lg border border-border/60 bg-muted/30 divide-y divide-border/40">
        {parsed.statements.map((stmt, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-2.5">
            <span className={`text-xs font-bold text-primary shrink-0 mt-0.5 w-6 text-center ${stmtClassName ?? ''}`}>
              {ROMAN[i] ?? String(i + 1)}.
            </span>
            <span className="text-sm leading-relaxed">{stmt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
