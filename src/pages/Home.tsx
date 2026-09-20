import { useState, useRef, lazy, Suspense } from 'react';
import { ArrowRight, Shield, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useCases } from '@/hooks/useCases';
import { useVisitorTracking } from '@/hooks/useVisitorTracking';
import { useRecentNews } from '@/hooks/useNews';
import NewsDetailModal from '@/components/NewsDetailModal';
import SEOHead from '@/components/SEOHead';
import StructuredData from '@/components/StructuredData';
import HeroSection from '@/components/home/HeroSection';
import NewsSection from '@/components/home/NewsSection';
import MapCTA from '@/components/home/MapCTA';
import SectionHeading from '@/components/home/SectionHeading';
import { computeHomeStats } from '@/components/home/homeUtils';

// Charts are heavy — keep them out of the initial bundle
const LazyDataModules = lazy(() => import('@/components/home/DataModules'));

const DataModulesFallback = () => (
  <section id="data" className="py-24 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="h-4 w-32 bg-white/5 rounded mb-4 animate-pulse" />
      <div className="h-10 w-2/3 bg-white/5 rounded mb-12 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[420px] bg-white/[0.03] border border-white/10 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  </section>
);

const Home = () => {
  useVisitorTracking();

  const navigate = useNavigate();
  const { data: cases, isLoading, error } = useCases();
  const { data: newsArticles, isLoading: articlesLoading } = useRecentNews(3);

  const [selectedNewsArticle, setSelectedNewsArticle] = useState<any>(null);

  // Secret admin access state
  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stats = computeHomeStats(cases);

  const handleEnterApp = () => navigate('/map');

  const handleNewsClick = (article: any) => {
    if (article.id) {
      navigate(`/news/${article.id}`);
    } else if (article.url && article.url !== '#') {
      window.open(article.url, '_blank');
    } else {
      setSelectedNewsArticle(article);
    }
  };

  // Secret admin access handler
  const handleLiveIndicatorClick = () => {
    setTapCount((prev) => prev + 1);

    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    tapTimeoutRef.current = setTimeout(() => {
      setTapCount(0);
    }, 500);

    if (tapCount + 1 >= 2) {
      setTapCount(0);
      navigate('/sys-mgmt-portal-auth');
    }
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinkClass =
    'text-gray-300 hover:text-white transition-colors text-sm font-medium hover:scale-105 transform duration-200';

  return (
    <>
      <SEOHead
        title="PoliceBrutalityTracker - Police incident data from Kenya | Centralized and mapped"
        description="Interactive platform visualizing police incident data from Kenya. Aggregated from human rights organizations, media reports, and citizen submissions. Public data, organized and visualized."
        keywords="police brutality, Kenya, incident data, police misconduct, human rights, tracking, mapping, incidents, cases, interactive map"
        url="https://policebrutalitytracker.co.ke"
      />
      <StructuredData cases={(cases as any) || []} pageType="home" />

      <div className="theme-light min-h-screen bg-slate-950 text-white overflow-x-hidden">
        {/* Floating Navigation Header */}
        <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/50 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl max-w-7xl w-[calc(100%-2rem)]">
          <div className="px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg">
                  <img src="/logo.svg" alt="PoliceBrutalityTracker" className="w-full h-full" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight">PoliceBrutalityTracker</h1>
                  <p className="text-xs text-gray-400 hidden sm:block">Public data, visualized</p>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-8">
                <button onClick={() => scrollToSection('data')} className={navLinkClass}>The Data</button>
                <button onClick={() => scrollToSection('about')} className={navLinkClass}>About</button>
                <button onClick={() => navigate('/news')} className={navLinkClass}>News</button>
              </div>

              <Button
                onClick={handleEnterApp}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all hover:scale-105 transform duration-200"
              >
                Launch App
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <HeroSection onScrollToData={() => scrollToSection('data')} cases={cases} isLoading={isLoading} />

        {/* Data modules: county, trend, type charts */}
        <Suspense fallback={<DataModulesFallback />}>
          <LazyDataModules cases={cases} isLoading={isLoading} />
        </Suspense>

        {/* County choropleth + live data panel */}
        <MapCTA cases={cases} isLoading={isLoading} />

        {/* Research & reports */}
        <NewsSection articles={newsArticles as any} isLoading={articlesLoading} onArticleClick={handleNewsClick} />

        {/* Mission */}
        <section id="about" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <SectionHeading
                kicker="About this project"
                title="Centralizing scattered police incident data."
              />
              <p className="text-gray-300 leading-relaxed mb-6">
                Police brutality cases in Kenya are reported across multiple sources — human rights organizations,
                media outlets, court records, and citizen submissions. This project aggregates that scattered data
                into one place, making it easier to see patterns and understand the scale of the issue.
              </p>
              <p className="text-gray-300 leading-relaxed">
                All case records are sourced from public information. We don't claim ownership of the data or sell
                it — we just organize and visualize it to make it more accessible and easier to navigate across
                all 47 counties.
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-red-400" />
                </div>
                <h4 className="text-xl font-bold text-white">Data sources &amp; methodology</h4>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Community submissions, reviewed before publication',
                  'Verified media reports and court records',
                  'Community confirmation voting on each case',
                  'All figures on this site are computed live from the database',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-300">
                    <Shield className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleEnterApp}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2"
              >
                View the data now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-4 border-t border-white/10 bg-black/40">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden">
                    <img src="/logo.svg" alt="PoliceBrutalityTracker" className="w-full h-full" />
                  </div>
                  <span className="text-xl font-bold">PoliceBrutalityTracker</span>
                </div>
                <p className="text-gray-400 text-sm">Public data, visualized</p>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-white">Platform</h4>
                <div className="space-y-2">
                  <button onClick={handleEnterApp} className="block text-gray-400 hover:text-white text-sm transition-colors">
                    Interactive Map
                  </button>
                  <button onClick={() => scrollToSection('data')} className="block text-gray-400 hover:text-white text-sm transition-colors">
                    The Data
                  </button>
                  <button onClick={() => navigate('/news')} className="block text-gray-400 hover:text-white text-sm transition-colors">
                    News
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-white">Data</h4>
                <div className="space-y-2">
                  <div className="text-gray-400 text-sm">
                    Total cases: {isLoading ? '…' : error ? '—' : stats.totalCases}
                  </div>
                  <div className="text-gray-400 text-sm">Enforced disappearances: {isLoading ? '…' : error ? '—' : stats.enforcedDisappearancesCount}</div>
                  <div className="text-gray-400 text-sm">
                    Last updated:{' '}
                    {stats.latestUpdate
                      ? stats.latestUpdate.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-white">Support</h4>
                <div className="space-y-2">
                  <div className="text-gray-400 text-sm">Report an Issue</div>
                  <div className="text-gray-400 text-sm">Community Guidelines</div>
                  <div className="text-gray-400 text-sm">Privacy Policy</div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <p className="text-gray-400 text-sm text-center md:text-left mb-4 md:mb-0">
                  © {new Date().getFullYear()} PoliceBrutalityTracker. Public data, organized and visualized.
                </p>
                <div className="flex items-center space-x-6">
                  <span className="text-gray-400 text-sm">Data from public sources</span>
                  <button
                    onClick={handleLiveIndicatorClick}
                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-medium">Live</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </footer>

        <NewsDetailModal
          isOpen={!!selectedNewsArticle}
          onClose={() => setSelectedNewsArticle(null)}
          article={selectedNewsArticle}
        />
      </div>
    </>
  );
};

export default Home;
