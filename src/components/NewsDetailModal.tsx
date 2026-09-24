import { X, Calendar, User, Tag, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface NewsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    id?: string;
    title: string;
    content: string;
    excerpt?: string;
    featured_image_url?: string;
    author: string;
    status?: string;
    category?: string;
    tags?: string[];
    published_at?: string;
    created_at?: string;
    source?: 'admin' | 'scraped';
    url?: string;
    image?: string;
    date?: string;
  } | null;
}

const NewsDetailModal = ({ isOpen, onClose, article }: NewsDetailModalProps) => {
  if (!isOpen || !article) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Default fallback image if none provided
  const defaultImage = 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=1200&h=800&fit=crop&q=80';
  const imageUrl = article.featured_image_url || article.image || defaultImage;
  const publishDate = article.published_at || article.created_at || article.date;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-5xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrollable Content Container */}
        <div className="overflow-y-auto max-h-[95vh] custom-scrollbar">
          <CardContent className="p-0">
          {/* Header with Hero Image */}
          <div className="relative">
            {/* Hero Image - Always show with fallback */}
            <div className="relative h-72 md:h-96 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
              <img
                src={imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Use default image on error
                  e.currentTarget.src = defaultImage;
                }}
              />
              {/* Sophisticated Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
            </div>
            
            {/* Close Button - Top Right */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-110"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Category & Source Badges - Top Left */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {article.category && (
                <Badge className="bg-red-600/90 backdrop-blur-sm hover:bg-red-700 text-white shadow-lg border border-red-500/30">
                  {article.category}
                </Badge>
              )}
              {article.source && (
                <Badge 
                  variant="outline"
                  className={`backdrop-blur-sm shadow-lg ${
                    article.source === 'admin' 
                      ? 'border-blue-500/70 bg-blue-500/20 text-blue-300' 
                      : 'border-purple-500/70 bg-purple-500/20 text-purple-300'
                  }`}
                >
                  {article.source === 'admin' ? 'PBT Editorial' : 'News Source'}
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-10 lg:p-12">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
              {article.title}
            </h1>

            {/* Meta Information - Enhanced Design */}
            <div className="flex flex-wrap items-center gap-6 mb-8 pb-6 border-b border-white/10">
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {article.author.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Author</span>
                  <span className="text-sm font-semibold text-gray-300">{article.author}</span>
                </div>
              </div>
              
              {/* Date */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Published</span>
                  <span className="text-sm font-medium text-gray-300">{formatDate(publishDate)}</span>
                </div>
              </div>
            </div>

            {/* Excerpt - Premium Design */}
            {article.excerpt && (
              <div className="relative bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 border-l-4 border-red-500 p-6 md:p-8 mb-8 rounded-r-xl backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-red-500 to-orange-500 rounded-l-lg" />
                <p className="text-gray-200 italic text-lg md:text-xl leading-relaxed font-light">
                  "{article.excerpt}"
                </p>
              </div>
            )}

            {/* Content - Beautiful Typography */}
            <div className="prose prose-invert prose-lg max-w-none">
              <div className="text-gray-300 leading-[1.8] text-base md:text-lg whitespace-pre-wrap space-y-4">
                {(article.content || '').split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4 first:mt-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Tags - Enhanced Design */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-10 pt-8 border-t border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <Tag className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Related Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-4 py-2 text-sm transition-all duration-200 hover:scale-105"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* External Link for Scraped Articles - Premium Design */}
            {article.source === 'scraped' && article.url && article.url !== '#' && (
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <ExternalLink className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Original Source</h4>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors group"
                      >
                        <span className="underline underline-offset-4">Read Full Article on Original Site</span>
                        <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions - Bottom Bar */}
            <div className="flex items-center justify-between gap-4 mt-10 pt-8 border-t border-white/10">
              <div className="text-sm text-gray-500">
                End of article
              </div>
              <Button
                onClick={onClose}
                variant="outline"
                className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-200 px-6"
              >
                Close
              </Button>
            </div>
          </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default NewsDetailModal;
