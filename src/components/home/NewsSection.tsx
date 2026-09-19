import { ArrowRight, ArrowUpRight, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { formatRelativeDate } from './homeUtils';
import SectionHeading from './SectionHeading';

interface NewsArticle {
  id: string | number;
  title: string;
  excerpt?: string;
  content?: string;
  author?: string;
  category?: string;
  source?: string;
  slug?: string;
  url?: string;
  published_at?: string;
  created_at?: string;
}

interface NewsSectionProps {
  articles: NewsArticle[] | undefined;
  isLoading: boolean;
  onArticleClick: (article: NewsArticle) => void;
}

const ResearchCard = ({
  article,
  index,
  onClick,
}: {
  article: NewsArticle;
  index: number;
  onClick: () => void;
}) => {
  const articleUrl = article.id
    ? `${window.location.origin}/news/${article.id}`
    : article.url && article.url !== '#'
      ? article.url
      : null;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!articleUrl) return;
    navigator.clipboard
      .writeText(articleUrl)
      .then(() => toast.success('Link copied to clipboard'))
      .catch(() => toast.error('Could not copy link'));
  };

  const authorName = article.source === 'admin' ? 'Editorial' : article.author || 'Newsroom';
  const initial = authorName.charAt(0).toUpperCase();

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-red-100 bg-white p-8 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-red-300 hover:shadow-xl hover:shadow-red-100"
      onClick={onClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Top accent line grows on hover */}
      <span className="absolute top-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-gradient-to-r from-red-500 to-red-700 transition-transform duration-500 group-hover:scale-x-100" />

      {/* Meta row: index + category left, date right */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-black text-red-500/80 tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {article.category || 'Report'}
          </span>
        </div>
        <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
          {formatRelativeDate(article.published_at || article.created_at)}
        </span>
      </div>

      <h3 className="mb-4 text-2xl font-bold leading-snug text-slate-900 transition-colors duration-200 group-hover:text-red-600">
        {article.title}
      </h3>

      <p className="mb-8 flex-1 text-sm leading-relaxed text-slate-600 line-clamp-3">
        {article.excerpt || (article.content ? article.content.substring(0, 160) + '…' : '')}
      </p>

      {/* Footer: author + actions */}
      <div className="flex items-center justify-between border-t border-red-50 pt-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-red-200 bg-red-50 text-xs font-bold text-red-600">
            {initial}
          </span>
          <span className="text-xs font-medium text-slate-500">{authorName}</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="mr-1 inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 transition-colors group-hover:text-red-700">
            Open article
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
          {articleUrl && (
            <button
              onClick={handleCopyLink}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
              title="Copy link"
              aria-label="Copy link to article"
            >
              <Link2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

const NewsSection = ({ articles, isLoading, onArticleClick }: NewsSectionProps) => {
  const navigate = useNavigate();

  return (
    <section id="reports" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <SectionHeading
            kicker="News"
            title="Latest news & analysis."
            subtitle="Reporting on police conduct in Kenya — from our editorial team and trusted sources."
          />
          <button
            onClick={() => navigate('/news')}
            className="mb-12 shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors self-start sm:self-auto"
          >
            View all news
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            [0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-red-100 bg-white p-8 animate-pulse">
                <div className="mb-6 h-3 w-1/3 rounded bg-slate-100" />
                <div className="mb-4 h-7 w-5/6 rounded bg-slate-100" />
                <div className="mb-8 h-16 rounded bg-slate-100" />
                <div className="h-4 w-1/4 rounded bg-slate-100" />
              </div>
            ))
          ) : articles && articles.length > 0 ? (
            articles.map((article, index) => (
              <ResearchCard
                key={article.id}
                article={article}
                index={index}
                onClick={() => onArticleClick(article)}
              />
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-red-100 bg-white py-16 text-center">
              <p className="mb-1 font-medium text-slate-600">No reports published yet</p>
              <p className="text-sm text-slate-400">Investigations and analysis are added regularly. Check back soon.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
