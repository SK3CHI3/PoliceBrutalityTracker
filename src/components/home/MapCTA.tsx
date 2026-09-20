import { useMemo, useState } from 'react';
import { ArrowRight, BadgeCheck, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Case } from '@/types';
import { normalizeCountyName } from '@/utils/countyNormalization';
import { CASE_TYPE_META, formatCaseType, formatFullDate } from './homeUtils';
import { KENYA_COUNTIES, KENYA_VIEWBOX } from './kenyaCountyShapes';

interface MapCTAProps {
  cases: Case[] | undefined;
  isLoading: boolean;
}

const norm = (name: string) => name.toLowerCase().replace(/[^a-z]/g, '');

const MapCTA = ({ cases, isLoading }: MapCTAProps) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const casesByCounty = useMemo(() => {
    const map = new Map<string, Case[]>();
    for (const c of cases || []) {
      const key = norm(normalizeCountyName(c.county));
      const list = map.get(key) || [];
      list.push(c);
      map.set(key, list);
    }
    return map;
  }, [cases]);

  const maxCount = useMemo(
    () => Math.max(1, ...Array.from(casesByCounty.values(), (list) => list.length)),
    [casesByCounty]
  );

  const activeKey = selected || hovered;
  const activeCases = activeKey ? casesByCounty.get(activeKey) || [] : [];
  const activeName = activeKey
    ? KENYA_COUNTIES.find((shape) => norm(shape.name) === activeKey)?.name || activeKey
    : null;

  const nationalStats = useMemo(() => {
    const all = cases || [];
    return {
      total: all.length,
      deaths: all.filter((c) => c.type === 'death').length,
      enforcedDisappearances: all.filter((c) => c.type === 'enforced_disappearance').length,
    };
  }, [cases]);

  const typeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of activeCases) {
      const key = c.type || 'other';
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([type, count]) => ({
        type,
        label: formatCaseType(type),
        count,
        color: CASE_TYPE_META[type as Case['type']]?.color || '#94a3b8',
      }))
      .sort((a, b) => b.count - a.count);
  }, [activeCases]);

  const recentCases = useMemo(
    () =>
      [...activeCases]
        .filter((c) => c.date != null)
        .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
        .slice(0, 3),
    [activeCases]
  );

  const fillFor = (name: string) => {
    const count = (casesByCounty.get(norm(name)) || []).length;
    if (count === 0) return { fill: '#0f172a', opacity: 0.05 };
    const t = Math.pow(count / maxCount, 0.55);
    return { fill: '#dc2626', opacity: 0.15 + 0.85 * t };
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F3E7E4]/60">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center">
        {/* Left: choropleth map */}
        <div>
          <svg
            viewBox={KENYA_VIEWBOX}
            className="w-full h-auto"
            role="img"
            aria-label="Map of Kenya shaded by documented police brutality cases per county"
          >
            {KENYA_COUNTIES.map((shape) => {
              const key = norm(shape.name);
              const { fill, opacity } = fillFor(shape.name);
              const isActive = activeKey === key;
              const isSelected = selected === key;
              return (
                <path
                  key={shape.name}
                  d={shape.d}
                  fill={fill}
                  fillOpacity={isActive ? Math.min(1, opacity + 0.25) : opacity}
                  stroke={isSelected ? '#b91c1c' : isActive ? 'rgba(185,28,28,0.5)' : '#FAF3F1'}
                  strokeWidth={isSelected ? 1.4 : isActive ? 1 : 0.6}
                  className="cursor-pointer transition-[fill-opacity] duration-200"
                  onMouseEnter={() => setHovered(key)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected((prev) => (prev === key ? null : key))}
                />
              );
            })}
          </svg>

          {/* Legend */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="text-[11px] text-slate-500">0 cases</span>
            <div
              className="h-2 w-40 rounded-full"
              style={{ background: 'linear-gradient(to right, rgba(15,23,42,0.05), rgba(220,38,38,0.4), #dc2626)' }}
            />
            <span className="text-[11px] text-slate-500">{maxCount} cases</span>
          </div>
        </div>

        {/* Right: live data panel */}
        <div className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-red-100 bg-gradient-to-b from-white to-[#FDF8F6] shadow-sm">
          <div className="flex-1 p-6 sm:p-7">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 w-24 bg-slate-100 rounded" />
                <div className="h-8 w-48 bg-slate-100 rounded" />
                <div className="h-24 bg-slate-100 rounded" />
              </div>
            ) : activeName ? (
              <>
                <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-red-600/80">
                  {selected ? 'Selected county' : 'Hovering'}
                </div>
                <div className="flex items-end justify-between gap-4 mb-6">
                  <h3 className="text-3xl font-black text-slate-900">{activeName}</h3>
                  <div className="text-right">
                    <span className="text-4xl font-black text-red-600">{activeCases.length}</span>
                    <span className="block text-xs text-slate-400">documented {activeCases.length === 1 ? 'case' : 'cases'}</span>
                  </div>
                </div>

                {activeCases.length > 0 ? (
                  <>
                    {/* Type breakdown */}
                    <div className="space-y-2.5 mb-6">
                      {typeBreakdown.map((t) => (
                        <div key={t.type} className="flex items-center gap-3">
                          <span className="w-28 shrink-0 text-xs text-slate-500">{t.label}</span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(t.count / activeCases.length) * 100}%`,
                                backgroundColor: t.color,
                              }}
                            />
                          </div>
                          <span className="w-6 text-right text-xs font-semibold text-slate-700">{t.count}</span>
                        </div>
                      ))}
                    </div>

                    {/* Recent cases */}
                    <div className="space-y-2">
                      {recentCases.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => navigate(`/case/${c.id}`)}
                          className="w-full flex items-center justify-between gap-3 text-left p-3 rounded-xl bg-[#FDF8F6] border border-red-50 hover:border-red-200 hover:bg-red-50/50 transition-colors"
                        >
                          <span className="text-sm font-medium text-slate-800 truncate">
                            {c.victimName || 'Unnamed victim'}
                          </span>
                          <span className="text-xs text-slate-400 whitespace-nowrap">{formatFullDate(c.date)}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">No documented cases in this county yet.</p>
                )}
              </>
            ) : (
              <>
                <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-red-600/80">
                  National overview
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-6">Kenya</h3>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-3xl font-black text-red-600">{nationalStats.total}</div>
                    <div className="text-xs text-slate-400 mt-1">Total cases</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-slate-900">{nationalStats.deaths}</div>
                    <div className="text-xs text-slate-400 mt-1">Deaths</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-slate-900">{nationalStats.enforcedDisappearances}</div>
                    <div className="text-xs text-slate-400 mt-1">Enforced disappearances</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer bar — same as data cards */}
          <div className="flex items-center justify-between gap-3 border-t border-red-100 bg-[#FDF6F4] px-6 py-3">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              {activeName && activeCases.length > 0 ? (
                <>
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {activeCases.filter((c) => c.community_verified).length} community verified
                </>
              ) : (
                <>
                  <MousePointerClick className="w-3.5 h-3.5 text-red-500" />
                  Click a county on the map to see its data
                </>
              )}
            </span>
            <button
              onClick={() => navigate('/map')}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              View on map
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="text-center mt-14">
        <Button
          onClick={() => navigate('/map')}
          size="lg"
          className="rounded-full bg-red-600 hover:bg-red-700 text-white px-8 font-semibold shadow-lg shadow-red-200 gap-2"
        >
          Launch the interactive map
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </section>
  );
};

export default MapCTA;
