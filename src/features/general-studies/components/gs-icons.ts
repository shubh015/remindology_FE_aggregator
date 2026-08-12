import {
  Landmark, Leaf, Scale, TrendingUp, Map, Users, Palette, Globe2,
  FlaskConical, ShieldAlert, HeartHandshake, BookOpen,
  Swords, Crown, Rocket,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Keyword → icon, checked against a lowercased subject/category name or slug.
// Order matters — more specific keywords first.
const KEYWORD_ICONS: [string, LucideIcon][] = [
  ['ancient', Crown],
  ['medieval', Swords],
  ['modern', Landmark],
  ['post-independence', Rocket],
  ['world', Globe2],
  ['history', Landmark],
  ['geography', Map],
  ['society', Users],
  ['culture', Palette],
  ['polity', Scale],
  ['governance', Scale],
  ['international', Globe2],
  ['relations', Globe2],
  ['economy', TrendingUp],
  ['environment', Leaf],
  ['ecology', Leaf],
  ['science', FlaskConical],
  ['technology', FlaskConical],
  ['disaster', ShieldAlert],
  ['ethics', HeartHandshake],
  ['integrity', HeartHandshake],
];

export function getGSIcon(nameOrSlug: string): LucideIcon {
  const key = nameOrSlug.toLowerCase();
  for (const [keyword, Icon] of KEYWORD_ICONS) {
    if (key.includes(keyword)) return Icon;
  }
  return BookOpen;
}
