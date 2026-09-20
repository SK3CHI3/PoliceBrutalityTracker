import { Map as MapIcon, FileText, FolderOpen, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Case } from '@/types';

interface HeroSectionProps {
  onScrollToData: () => void;
  cases: Case[] | undefined;
  isLoading: boolean;
}

const HeroSection = ({ onScrollToData, cases, isLoading }: HeroSectionProps) => {
  const navigate = useNavigate();

  const pillClass =
    'inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-red-100 bg-white/80 text-sm font-medium text-slate-700 hover:bg-white hover:border-red-300 hover:text-red-600 transition-all duration-200';

  // Prepare ticker names
  const names = cases
    ?.filter((c) => {
      const name = (c.victimName || '').trim();
      return name.length > 0 && !/^(unknown|unkown|unnamed|n\/?a)$/i.test(name);
    })
    .map((c) => ({ id: c.id, name: c.victimName.trim() })) || [];

  return (
    <section className="relative h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-28 pb-16 overflow-hidden">
      {/* Background: real imagery under a warm white wash */}
      <div className="absolute inset-0">
        <img
          src="/the_independent_data_project-hero_image.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.07),transparent_65%)]" />
      </div>

      <div className="relative max-w-4xl mx-auto w-full text-center">
        {/* Kicker */}
        <div className="fade-up inline-flex items-center gap-3 mb-8">
          <span className="h-px w-8 bg-red-400/70" />
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-600">
            An independent data project — Kenya
          </span>
          <span className="h-px w-8 bg-red-400/70" />
        </div>

        {/* Headline */}
        <h1
          className="fade-up text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1] mb-10"
          style={{ animationDelay: '0.1s' }}
        >
          We track every documented police brutality incident in Kenya — aggregating data from multiple sources into one searchable, visual database.
        </h1>

        {/* Pill navigation — MPV style */}
        <div
          className="fade-up flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          style={{ animationDelay: '0.3s' }}
        >
          <Button
            onClick={() => navigate('/map')}
            size="lg"
            className="rounded-full bg-red-600 hover:bg-red-700 text-white px-7 font-semibold shadow-lg shadow-red-200 gap-2"
          >
            <MapIcon className="w-4 h-4" />
            Explore the map
          </Button>
          <button onClick={onScrollToData} className={pillClass}>
            <Database className="w-4 h-4 text-red-500" />
            See the data
          </button>
          <button onClick={() => navigate('/cases')} className={pillClass}>
            <FolderOpen className="w-4 h-4 text-red-500" />
            Browse cases
          </button>
          <button onClick={() => navigate('/news')} className={pillClass}>
            <FileText className="w-4 h-4 text-red-500" />
            Read news
          </button>
        </div>
      </div>

      {/* Memorial names ticker at the bottom */}
      {names.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 py-6 border-t border-red-100 bg-white/90 backdrop-blur-sm overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 mb-3 flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-red-200" />
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-600">
              In memoriam
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-red-200" />
          </div>

          <div className="ticker-hover-pause relative">
            {/* Edge fades */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white/90 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white/90 to-transparent z-10 pointer-events-none" />

            <div className="flex w-max animate-marquee" style={{ '--marquee-duration': `${Math.max(45, names.length * 4)}s` } as React.CSSProperties}>
              {/* First copy */}
              <div className="flex items-center shrink-0">
                {names.map((entry, index) => (
                  <span key={`${entry.id}-a-${index}`} className="flex items-center shrink-0">
                    <button
                      onClick={() => navigate(`/case/${entry.id}`)}
                      className="text-lg sm:text-xl font-semibold text-slate-700 hover:text-red-600 transition-colors whitespace-nowrap px-1"
                      title="View case"
                    >
                      {entry.name}
                    </button>
                    <span className="mx-5 text-red-300 text-sm" aria-hidden="true">✦</span>
                  </span>
                ))}
              </div>
              {/* Second copy for seamless loop */}
              <div className="flex items-center shrink-0" aria-hidden="true">
                {names.map((entry, index) => (
                  <span key={`${entry.id}-b-${index}`} className="flex items-center shrink-0">
                    <button
                      onClick={() => navigate(`/case/${entry.id}`)}
                      tabIndex={-1}
                      className="text-lg sm:text-xl font-semibold text-slate-700 hover:text-red-600 transition-colors whitespace-nowrap px-1"
                      title="View case"
                    >
                      {entry.name}
                    </button>
                    <span className="mx-5 text-red-300 text-sm" aria-hidden="true">✦</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
