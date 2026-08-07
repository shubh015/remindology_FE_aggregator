import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatementVerdict {
  num: string;
  isCorrect: boolean;
  body: string;
}

const ROMAN_ORDER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

function toOrdinal(token: string): number {
  if (/^\d+$/.test(token)) return parseInt(token, 10);
  const idx = ROMAN_ORDER.indexOf(token.toUpperCase());
  return idx >= 0 ? idx + 1 : 999;
}

// Finds every "Statement N is correct/incorrect" marker and slices the
// text between consecutive markers into that statement's reasoning.
function parseExplanation(raw: string): { intro: string; verdicts: StatementVerdict[] } | null {
  const re = /Statement\s+([\dIVXivx]+)\s+is\s+(correct|incorrect)\b[:,]?\s*/gi;
  const matches = [...raw.matchAll(re)];
  if (matches.length < 2) return null;

  const intro = raw.slice(0, matches[0].index).trim();

  const verdicts: StatementVerdict[] = matches.map((m, i) => {
    const start = m.index! + m[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : raw.length;
    const body = raw.slice(start, end).trim().replace(/^(as|because|since)\s+/i, '');
    return {
      num: m[1],
      isCorrect: m[2].toLowerCase() === 'correct',
      body,
    };
  });

  verdicts.sort((a, b) => toOrdinal(a.num) - toOrdinal(b.num));

  return { intro, verdicts };
}

export function ExplanationText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const parsed = parseExplanation(text);
  const introCls = className ?? 'text-xs text-muted-foreground leading-relaxed';

  if (!parsed) {
    return <p className={introCls}>{text}</p>;
  }

  return (
    <div className="space-y-2">
      {parsed.intro && <p className={introCls}>{parsed.intro}</p>}
      <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden">
        {parsed.verdicts.map((v, i) => (
          <div
            key={i}
            className={cn(
              'flex items-start gap-2 px-3 py-2',
              v.isCorrect ? 'bg-emerald-500/5' : 'bg-red-500/5',
            )}
          >
            {v.isCorrect
              ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
              : <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />}
            <p className="text-xs leading-relaxed min-w-0">
              <span className={cn(
                'font-bold uppercase tracking-wide mr-1',
                v.isCorrect ? 'text-emerald-600' : 'text-red-600',
              )}>
                Statement {v.num}:
              </span>
              <span className="text-muted-foreground">{v.body}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
