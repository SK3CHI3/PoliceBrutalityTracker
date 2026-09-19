import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, ArrowLeft, Newspaper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAllPublishedNews } from '@/hooks/useNewsArticle';
import SEOHead from '@/components/SEOHead';
import { useNavigate } from 'react-router-dom';

const NewsPage = () => {
  const { data: articles, isLoading } = useAllPublishedNews();
  const navigate = useNavigate();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  const getPlaceholderPattern = (category?: string) => {
    const patterns: Record<string, string> = {
      'Research & Analysis': 'from-blue-900/40 to-blue-600/20',
      'Legal Guide': 'from-green-900/40 to-green-600/20',
      'Protest Coverage': 'from-orange-900/40 to-orange-600/20',
      'Community Action': 'from-purple-900/40 to-purple-600/20',
      'Policy & Reform': 'from-yellow-900/40 to-yellow-600/20',
      'Health & Justice': 'from-pink-900/40 to-pink-600/20',
      'Gender & Justice': 'from-indigo-900/40 to-indigo-600/20',
    };
    return patterns[category || ''] || 'from-red-900/40 to-red-600/20';
  };

  const newsStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "PoliceBrutalityTracker News",
    "description": "News, reports, and data visualizations on police incidents in Kenya",
    "url": "https://policebrutalitytracker.co.ke/news",
    "publisher": {
      "@type": "Organization",
      "name": "PoliceBrutalityTracker",
      "logo": {
        "@type": "ImageObject",
        "url": "https://policebrutalitytracker.co.ke/logo.svg"
      }
    },
    "hasPart": articles?.slice(0, 20).map(article => ({
      "@type": "NewsArticle",
      "headline": article.title,
      "description": article.summary,
      "datePublished": article.published_at || article.created_at,
      "url": `https://policebrutalitytracker.co.ke/news/${article.id}`
    })) || []
  };

  return (
    <>
      <SEOHead
        title="News & Insights | PoliceBrutalityTracker"
        description="Read news, reports, and data visualizations on police incidents in Kenya. Updates from PoliceBrutalityTracker."
        keywords="police brutality Kenya news, human rights news Kenya, police accountability articles, Kenya justice news, civic tech Kenya"
        url="https://policebrutalitytracker.co.ke/news"
        structuredData={newsStructuredData}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <Newspaper className="w-8 h-8 text-red-400" />
              <h1 className="text-3xl md:text-4xl font-bold">
                News & Insights
              </h1>
            </div>
            <p className="text-gray-400 text-lg max-w-3xl">
              In-depth analysis, legal guides, and reports on police accountability and human rights in Kenya. 
              Stay informed with evidence-based coverage from PoliceBrutalityTracker.
            </p>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4" />
              <p className="text-gray-400">Loading articles...</p>
            </div>
          ) : !articles || articles.length === 0 ? (
            <div className="text-center py-16">
              <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No articles published yet. Check back soon.</p>
            </div>
          ) : (
            <>
              {/* Featured Article */}
              {articles[0] && (
                <Link
                  to={`/news/${articles[0].id}`}
                  className="block group mb-16"
                >
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        <div className="h-64 lg:h-full bg-gradient-to-br from-red-900/50 to-slate-900 flex items-center justify-center relative overflow-hidden">
                          <div className={`absolute inset-0 bg-gradient-to-br ${getPlaceholderPattern(articles[0].category)} to-transparent`}></div>
                        </div>
                        <div className="p-8 lg:p-12 flex flex-col justify-center">
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className="w-fit bg-red-600/20 text-red-300 border-red-500/30">
                              Featured
                            </Badge>
                            {articles[0].category && (
                              <Badge className={`w-fit ${getCategoryColor(articles[0].category)}`}>
                                {articles[0].category}
                              </Badge>
                            )}
                          </div>
                          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white group-hover:text-red-400 transition-colors mb-4 leading-tight">
                            {articles[0].title}
                          </h2>
                          <p className="text-gray-300 mb-6 text-base md:text-lg leading-relaxed line-clamp-3">
                            {articles[0].summary}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(articles[0].published_at || articles[0].created_at)}
                            </span>
                            <span className="flex items-center gap-1 text-red-400 group-hover:text-red-300 transition-colors">
                              Read article
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}

              {/* Section Header */}
              {articles.length > 1 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2">Latest Articles</h2>
                  <div className="h-1 w-20 bg-red-600 rounded-full"></div>
                </div>
              )}

              {/* Rest of articles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.slice(1).map((article) => (
                  <Link
                    key={article.id}
                    to={`/news/${article.id}`}
                    className="block group"
                  >
                    <Card className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-red-500/30 transition-all duration-300 h-full">
                      <CardContent className="p-0">
                        <div className="w-full h-48 bg-gradient-to-br from-red-900/30 to-slate-800 flex items-center justify-center rounded-t-lg relative overflow-hidden">
                          <div className={`absolute inset-0 bg-gradient-to-br ${getPlaceholderPattern(article.category)} group-hover:opacity-80 transition-all duration-300`}></div>
                        </div>
                        <div className="p-6">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {article.category && (
                              <Badge className={`text-xs ${getCategoryColor(article.category)}`}>
                                {article.category}
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors mb-3 line-clamp-2 leading-tight">
                            {article.title}
                          </h3>
                          <p className="text-gray-400 text-sm line-clamp-3 mb-4 leading-relaxed">
                            {article.summary}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-white/5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(article.published_at || article.created_at)}
                            </span>
                            <span className="flex items-center gap-1 text-red-400 group-hover:text-red-300 transition-colors">
                              Read
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* SEO Footer */}
          <div className="mt-20 pt-12 border-t border-white/10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">About PoliceBrutalityTracker News</h2>
              <p className="text-gray-300 mb-4 text-base md:text-lg leading-relaxed">
                Our newsroom publishes evidence-based reports, legal guides, and analysis on police accountability in Kenya. 
                All articles are grounded in verified data from our database of <span className="text-red-400 font-semibold">848 documented cases</span> across all 47 counties.
              </p>
              <p className="text-gray-400 mb-8 leading-relaxed">
                We complement our <Link to="/map" className="text-red-400 hover:text-red-300 underline">interactive incident map</Link> and 
                <Link to="/cases-index" className="text-red-400 hover:text-red-300 underline ml-1">case database</Link> with in-depth coverage 
                that provides context, analysis, and actionable information for communities, journalists, and policymakers.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                  <Link to="/map">Explore the Map</Link>
                </Button>
                <Button asChild variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                  <Link to="/cases-index">Browse Cases</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsPage;
