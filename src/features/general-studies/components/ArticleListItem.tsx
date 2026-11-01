import Link from 'next/link';
import type { GSArticle } from '@/types/features';

function stripHtml(text: string | undefined | null): string {
  if (!text) return '';
  return text.includes('<') ? text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : text;
}

/**
 * Rule-separated list row for a GS article. Every GS paper is styled the
 * same; tags differ by label only. Wrap a list of these in a container with
 * `border-b border-rule` to close the last row.
 */
export function ArticleListItem({ article }: { article: GSArticle }) {
  const paperTag = article.gsPaperTags?.[0];
  const topicTag = article.topicTags?.[0];
  const description = stripHtml(article.summary);

  return (
    <Link
      href={`/general-studies/articles/${article.slug}`}
      className="group grid gap-2 py-5 border-t border-rule transition-colors duration-150 ease-ks"
    >
      {(paperTag || topicTag) && (
        <div className="ks-card-head">
          {paperTag && <span className="ks-tag">{paperTag}</span>}
          {topicTag && <span className="ks-tag ks-tag-outline">{topicTag}</span>}
        </div>
      )}
      <p className="ks-card-title group-hover:underline underline-offset-4 decoration-1">
        {article.title}
      </p>
      {description && <p className="ks-card-desc line-clamp-2">{description}</p>}
      {article.readTimeMins > 0 && (
        <span className="ks-card-meta">{article.readTimeMins} min read</span>
      )}
    </Link>
  );
}
