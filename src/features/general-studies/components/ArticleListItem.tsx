import type { GSArticle } from '@/types/features';
import { GSPlaceholderCard } from './GSPlaceholderCard';
import { getGSIcon } from './gs-icons';

const GS_PAPER_COLORS: Record<string, string> = {
  GS1: '#7C3AED', GS2: '#0891B2', GS3: '#059669', GS4: '#DC2626',
};

function stripHtml(text: string): string {
  return text.includes('<') ? text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : text;
}

export function ArticleListItem({ article }: { article: GSArticle }) {
  const accentColor = GS_PAPER_COLORS[article.gsPaperTags[0]] ?? '#7C3AED';
  const icon = getGSIcon(article.topicTags[0] ?? article.title);

  return (
    <GSPlaceholderCard
      title={article.title}
      description={stripHtml(article.summary)}
      href={`/general-studies/articles/${article.slug}`}
      accentColor={accentColor}
      icon={icon}
    />
  );
}
