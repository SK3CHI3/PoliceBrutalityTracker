import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag, Share2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNewsArticleBySlug, useAllPublishedNews } from '@/hooks/useNewsArticle';
import SEOHead from '@/components/SEOHead';
import ArticleRenderer from '@/components/ArticleRenderer';

const NewsPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: article, isLoading, error } = useNewsArticleBySlug(slug || '');
  const { data: allArticles } = useAllPublishedNews();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const estimateReadTime = (content?: string) => {
    if (!content) return '1 min read';
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
          url,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      'Research & Analysis': 'bg-blue-600/20 text-blue-300 border-blue-500/30',
      'Legal Guide': 'bg-green-600/20 text-green-300 border-green-500/30',
      'Protest Coverage': 'bg-orange-600/20 text-orange-300 border-orange-500/30',
      'Community Action': 'bg-purple-600/20 text-purple-300 border-purple-500/30',
      'Policy & Reform': 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30',
      'Health & Justice': 'bg-pink-600/20 text-pink-300 border-pink-500/30',
      'Gender & Justice': 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30',
    };
    return colors[category || ''] || 'bg-gray-600/20 text-gray-300 border-gray-500/30';
  };

  // Related articles (same category, excluding current)
  const relatedArticles = allArticles
    ?.filter(a => a.id !== article?.id && a.category === article?.category)
    .slice(0, 3) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-400 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/news')} className="bg-red-600 hover:bg-red-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News
          </Button>
        </div>
      </div>
    );
  }

  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.excerpt || article.content?.substring(0, 160),
    "author": {
      "@type": "Organization",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "PoliceBrutalityTracker",
      "logo": {
        "@type": "ImageObject",
        "url": "https://policebrutalitytracker.co.ke/logo.svg"
      }
    },
    "datePublished": article.published_at || article.created_at,
    "dateModified": article.updated_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://policebrutalitytracker.co.ke/news/${slug}`
    },
    "url": `https://policebrutalitytracker.co.ke/news/${slug}`,
    "keywords": article.tags?.join(', ') || 'police brutality, Kenya, human rights',
    "articleSection": article.category || 'News',
    "wordCount": article.content?.split(/\s+/).length || 0,
    "inLanguage": "en"
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://policebrutalitytracker.co.ke" },
      { "@type": "ListItem", "position": 2, "name": "News", "item": "https://policebrutalitytracker.co.ke/news" },
      { "@type": "ListItem", "position": 3, "name": article.title, "item": `https://policebrutalitytracker.co.ke/news/${slug}` }
    ]
  };

  return (
    <>
      <SEOHead
        title={`${article.title} | PoliceBrutalityTracker`}
        description={article.excerpt || article.content?.substring(0, 155) + '...'}
        keywords={article.tags?.join(', ') || `${article.category}, police brutality Kenya, human rights`}
        url={`https://policebrutalitytracker.co.ke/news/${slug}`}
        type="article"
        structuredData={[articleStructuredData, breadcrumbData]}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white">
        {/* Header Bar */}
        <div className="bg-black/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/news')}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Articles
            </Button>
            <Button
              variant="ghost"
              onClick={handleShare}
              className="text-gray-300 hover:text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 py-12">
          {/* Article Header */}
          <header className="mb-12">
            <div className="flex flex-wrap gap-2 mb-6">
              {article.category && (
                <Badge className={getCategoryColor(article.category)}>
                  {article.category}
                </Badge>
              )}
              {article.isAiGenerated && (
                <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                  AI Generated
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-white">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                {article.excerpt}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 pb-6 border-b border-white/10">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {article.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(article.published_at || article.created_at)}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {estimateReadTime(article.content)}
              </span>
            </div>
          </header>

          {/* Article Body - Rendered Content */}
          <ArticleRenderer content={article.content || ''} />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-12 mt-12 pt-8 border-t border-white/10">
              <Tag className="w-4 h-4 text-gray-400" />
              {article.tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="border-white/20 text-gray-300">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Author Card */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-12 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-white">{article.author}</p>
              <p className="text-sm text-gray-400">PoliceBrutalityTracker</p>
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6 text-white">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    to={`/news/${related.id}`}
                    className="block group"
                  >
                    <div className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-red-500/30 transition-all h-full rounded-lg p-4">
                      <h3 className="font-semibold text-white group-hover:text-red-400 transition-colors mb-2 line-clamp-2">
                        {related.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {formatDate(related.published_at || related.created_at)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <div className="text-center mt-16 pt-8 border-t border-white/10">
            <p className="text-gray-400 mb-6">Explore more from PoliceBrutalityTracker</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button onClick={() => navigate('/news')} variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                More Articles
              </Button>
              <Button onClick={() => navigate('/map')} className="bg-red-600 hover:bg-red-700">
                View Interactive Map
              </Button>
            </div>
          </div>
        </article>
      </div>
    </>
  );
};

export default NewsPostPage;
