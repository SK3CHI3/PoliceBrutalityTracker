import { useMemo, useRef, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { Download, Link2, Facebook, Twitter, Mail, ChevronDown } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { toPng } from 'html-to-image';
import { Case } from '@/types';
import { normalizeCountyName } from '@/utils/countyNormalization';

interface DataModulesProps {
  cases: Case[] | undefined;
  isLoading: boolean;
}

// 2019 Kenya census populations
const COUNTY_POPULATIONS: Record<string, number> = {
  mombasa: 1208333, kwale: 866820, kilifi: 1453787, tanariver: 315943, lamu: 143920,
  taitataveta: 340671, garissa: 841353, wajir: 781263, mandera: 867457, marsabit: 459785,
  isiolo: 268002, meru: 1545714, tharakanithi: 393177, embu: 608599, kitui: 1136187,
  machakos: 1421932, makueni: 987653, nyandarua: 638289, nyeri: 759164, kirinyaga: 610411,
  muranga: 1056640, kiambu: 2417735, turkana: 926976, westpokot: 621241, samburu: 310327,
  transnzoia: 990341, uasingishu: 1163186, elgeyomarakwet: 454480, nandi: 885711,
  baringo: 666763, laikipia: 518560, nakuru: 2162202, narok: 1157873, kajiado: 1117840,
  kericho: 901777, bomet: 875689, kakamega: 1867579, vihiga: 590013, bungoma: 1670570,
  busia: 893681, siaya: 993183, kisumu: 1155574, homabay: 1131950, migori: 1116436,
  kisii: 1266860, nyamira: 605576, nairobi: 4397073,
};

const norm = (name: string) => name.toLowerCase().replace(/[^a-z]/g, '');

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const heatColor = (count: number) => {
  if (count <= 0) return '#f1f5f9';
  if (count === 1) return '#fca5a5';
  if (count === 2) return '#ef4444';
  return '#991b1b';
};

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #fecaca',
  borderRadius: '12px',
  color: '#0f172a',
  fontSize: '13px',
  boxShadow: '0 10px 30px rgba(15,23,42,0.12)',
};

/* Inline highlighted number */
const Num = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex min-w-[2.4rem] items-center justify-center rounded-lg border-2 border-red-300 bg-red-50 px-2 py-0.5 text-red-600 font-black tabular-nums">
    {children}
  </span>
);

/* Year dropdown */
const YearSelect = ({
  value,
  years,
  onChange,
}: {
  value: number;
  years: number[];
  onChange: (y: number) => void;
}) => (
  <span className="relative inline-block">
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label="Select year"
      className="cursor-pointer appearance-none border-b-2 border-dotted border-red-400/80 bg-transparent pr-5 font-bold text-red-600 focus:outline-none"
    >
      {years.map((y) => (
        <option key={y} value={y} className="bg-white font-bold text-slate-900">
          {y}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-red-500" />
  </span>
);

/* County dropdown */
const CountySelect = ({
  value,
  counties,
  onChange,
}: {
  value: string;
  counties: Array<{ county: string; label: string }>;
  onChange: (c: string) => void;
}) => (
  <span className="relative inline-block">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Select county"
      className="cursor-pointer appearance-none border-b-2 border-dotted border-red-400/80 bg-transparent pr-5 font-bold text-red-600 focus:outline-none"
    >
      {counties.map((c) => (
        <option key={c.county} value={c.county} className="bg-white font-bold text-slate-900">
          {c.label}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-red-500" />
  </span>
);

interface ShareRowProps {
  summary: string;
  onDownload?: () => void;
}

const ShareRow = ({ summary, onDownload }: ShareRowProps) => {
  const url = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success('Link copied to clipboard'))
      .catch(() => toast.error('Could not copy link'));
  };

  const open = (href: string) => window.open(href, '_blank', 'noopener');

  const iconBtn = 'rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors';

  return (
    <div className="flex items-center justify-between gap-3">
      {onDownload ? (
        <button
          onClick={onDownload}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Download graphic
        </button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-0.5">
        <span className="mr-1 text-[11px] text-slate-400">Share:</span>
        <button onClick={copyLink} className={iconBtn} title="Copy link" aria-label="Copy link">
          <Link2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)}
          className={iconBtn}
          title="Share to Facebook"
          aria-label="Share to Facebook"
        >
          <Facebook className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(summary)}&url=${encodeURIComponent(url)}`)}
          className={iconBtn}
          title="Share to Twitter"
          aria-label="Share to Twitter"
        >
          <Twitter className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => open(`mailto:?subject=${encodeURIComponent('Police brutality data — Kenya')}&body=${encodeURIComponent(summary + '\n\n' + url)}`)}
          className={iconBtn}
          title="Share by email"
          aria-label="Share by email"
        >
          <Mail className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

/* Captures a card as a branded PNG — uses filter to exclude UI elements, includes branding */
const downloadCardAsPng = async (
  ref: React.RefObject<HTMLDivElement | null>,
  filename: string
) => {
  if (!ref.current) return;
  try {
    // Temporarily show export-only elements
    const exportElements = ref.current.querySelectorAll('.export-only');
    exportElements.forEach((el) => {
      (el as HTMLElement).style.display = 'block';
    });

    const dataUrl = await toPng(ref.current, {
      pixelRatio: 3,
      cacheBust: true,
      filter: (node) => {
        // Exclude elements with .no-export class
        if (node instanceof HTMLElement && node.classList.contains('no-export')) {
          return false;
        }
        return true;
      },
    });

    // Hide export-only elements again
    exportElements.forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
  } catch (e) {
    console.error('Download failed:', e);
    toast.error('Could not generate image');
  }
};

/* Simple card with ref for download */
interface MpvCardProps {
  kicker: string;
  summary: string;
  onDownload?: () => void;
  children: React.ReactNode;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

const MpvCard = ({ kicker, summary, onDownload, children, cardRef }: MpvCardProps) => (
  <div ref={cardRef} className="flex flex-col overflow-hidden rounded-2xl border border-red-100 bg-gradient-to-b from-white to-[#FDF8F6] shadow-sm">
    {/* Export-only branding header */}
    <div className="export-only" style={{ padding: '20px 24px 14px', borderBottom: '2px solid #fecaca' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '5px', height: '28px', background: '#dc2626', borderRadius: '3px', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>PoliceBrutalityTracker</div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#dc2626', letterSpacing: '0.08em', marginTop: '1px' }}>PUBLIC DATA, ORGANIZED AND VISUALIZED</div>
        </div>
      </div>
    </div>

    <div className="flex-1 p-6 sm:p-7">
      <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-red-600/80">{kicker}</div>
      {children}
    </div>

    {/* Export-only branding footer */}
    <div className="export-only" style={{ padding: '12px 24px', borderTop: '2px solid #fecaca', background: '#FDF6F4' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>policebrutalitytracker.co.ke</span>
      </div>
    </div>

    {/* ShareRow - excluded from export */}
    <div className="no-export border-t border-red-100 bg-[#FDF6F4] px-6 py-3">
      <ShareRow summary={summary} onDownload={onDownload} />
    </div>
  </div>
);

const parseDate = (s: string | null | undefined) => {
  if (!s || s === '') return new Date(NaN); // Return invalid date for null/undefined/empty
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const DataModules = ({ cases, isLoading }: DataModulesProps) => {
  const [hoverDay, setHoverDay] = useState<{ label: string; count: number } | null>(null);

  // Card refs for PNG download
  const recordCardRef = useRef<HTMLDivElement>(null);
  const tollCardRef = useRef<HTMLDivElement>(null);
  const heatmapCardRef = useRef<HTMLDivElement>(null);
  const perCapitaCardRef = useRef<HTMLDivElement>(null);
  const yearOnYearCardRef = useRef<HTMLDivElement>(null);

  const deaths = useMemo(() => {
    return (cases || [])
      .filter((c) => c.type === 'death')
      .map((c) => ({ date: parseDate(c.date), county: c.county }))
      .filter((d) => !isNaN(d.date.getTime()));
  }, [cases]);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    let min = current;
    for (const d of deaths) {
      const y = d.date.getFullYear();
      if (y < min) min = y;
    }
    const out: number[] = [];
    for (let y = min; y <= current; y++) out.push(y);
    return out;
  }, [deaths]);

  const defaultYear = useMemo(() => {
    const withData = years.filter((y) => deaths.some((d) => d.date.getFullYear() === y));
    return withData.length > 0 ? withData[withData.length - 1] : years[years.length - 1];
  }, [years, deaths]);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const year = selectedYear ?? defaultYear;
  const currentYear = new Date().getFullYear();

  const yearDeaths = useMemo(() => deaths.filter((d) => d.date.getFullYear() === year), [deaths, year]);

  const dailyCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of yearDeaths) {
      const key = `${d.date.getMonth()}-${d.date.getDate()}`;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [yearDeaths]);

  const daysWithDeaths = dailyCounts.size;

  const prevComparison = useMemo(() => {
    const prevYear = year - 1;
    const cutoff =
      year === currentYear
        ? { m: new Date().getMonth(), d: new Date().getDate() }
        : { m: 11, d: 31 };
    const prevSamePeriod = deaths.filter((d) => {
      if (d.date.getFullYear() !== prevYear) return false;
      const m = d.date.getMonth();
      const day = d.date.getDate();
      return m < cutoff.m || (m === cutoff.m && day <= cutoff.d);
    }).length;
    return { prevYear, prevSamePeriod, diff: yearDeaths.length - prevSamePeriod };
  }, [deaths, year, yearDeaths.length, currentYear]);

  const yearlyCumulative = useMemo(() => {
    return MONTHS_SHORT.map((m, mi) => {
      const row: Record<string, number | string> = { month: m };
      for (const y of years) {
        let cum = 0;
        for (const d of deaths) {
          if (d.date.getFullYear() === y && d.date.getMonth() <= mi) cum += 1;
        }
        row[String(y)] = cum;
      }
      return row;
    });
  }, [deaths, years]);

  const perCapita = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of deaths) {
      const key = norm(normalizeCountyName(d.county));
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([key, count]) => {
        const pop = COUNTY_POPULATIONS[key];
        if (!pop) return null;
        return { county: key, rate: Math.round((count / pop) * 1_000_000 * 10) / 10, count };
      })
      .filter((x): x is { county: string; rate: number; count: number } => x !== null)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 8)
      .map((x) => ({ ...x, label: x.county.charAt(0).toUpperCase() + x.county.slice(1) }));
  }, [deaths]);

  const CELL = 10;
  const STEP = 13;
  const BLOCK_W = 7 * STEP;
  const BLOCK_H = 18 + 5 * STEP;
  const GAP_X = 24;
  const GAP_Y = 22;
  const PAD = 14;
  const COLS = 4;
  const HEAT_W = PAD * 2 + COLS * BLOCK_W + (COLS - 1) * GAP_X;
  const HEAT_H = PAD * 2 + 3 * BLOCK_H + 2 * GAP_Y;

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const topCounty = perCapita[0];

  const recordStats = useMemo(() => {
    const all = cases || [];
    const counties = new Set(all.map((c) => norm(normalizeCountyName(c.county))));
    let earliestYear: number | null = null;
    for (const c of all) {
      const d = parseDate(c.date);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        if (earliestYear === null || y < earliestYear) earliestYear = y;
      }
    }
    
    // Calculate death rate percentage
    const totalCases = all.length;
    const deathsCount = deaths.length;
    const deathRatePercent = totalCases > 0 
      ? Math.round((deathsCount / totalCases) * 100) 
      : 0;
    
    // Calculate Nairobi percentage of total cases
    const nairobiCases = all.filter(c => 
      norm(normalizeCountyName(c.county)) === 'nairobi'
    ).length;
    const nairobiPercent = totalCases > 0 
      ? Math.round((nairobiCases / totalCases) * 100) 
      : 0;
    
    return {
      totalCases,
      countiesCount: counties.size,
      earliestYear,
      deathsCount,
      deathRatePercent,
      nairobiPercent,
    };
  }, [cases, deaths]);

  // Headline text helpers
  const tollHeadline = year === currentYear
    ? 'Police have killed'
    : 'Police killed';
  const tollSuffix = year === currentYear ? 'so far in' : 'in';
  const daysHeadline = year === currentYear ? 'There have been' : 'There were';
  const daysSuffix = year === currentYear ? 'days so far in' : 'days in';

  return (
    <section id="data" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">
          The data — live from our database
        </span>

        {isLoading ? (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[380px] rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left column */}
            <div className="flex flex-col gap-6">
              {/* Card 01 — the toll */}
              <MpvCard
                kicker="01 · The toll"
                cardRef={tollCardRef}
                summary={`${tollHeadline} ${yearDeaths.length} people ${tollSuffix} ${year}. Every case documented at policebrutalitytracker.co.ke`}
                onDownload={() => downloadCardAsPng(tollCardRef, `the-toll-kenya-${year}.png`)}
              >
                <p className="text-2xl sm:text-[1.7rem] font-bold text-slate-900 leading-relaxed">
                  {year === currentYear ? (
                    <>Police have killed <Num>{yearDeaths.length}</Num> people in Kenya so far in{' '}
                      <YearSelect value={year} years={years} onChange={setSelectedYear} />.</>
                  ) : (
                    <>Police killed <Num>{yearDeaths.length}</Num> people in Kenya in{' '}
                      <YearSelect value={year} years={years} onChange={setSelectedYear} />.</>
                  )}
                </p>
              </MpvCard>

              {/* Card 02 — day by day */}
              <MpvCard
                kicker="02 · Day by day"
                cardRef={heatmapCardRef}
                summary={`${daysHeadline} ${daysWithDeaths} ${daysSuffix} ${year} when police killed people in Kenya — see the day-by-day record at policebrutalitytracker.co.ke`}
                onDownload={() => downloadCardAsPng(heatmapCardRef, `day-by-day-kenya-${year}.png`)}
              >
                <p className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed mb-6">
                  {year === currentYear ? (
                    <>There have been <Num>{daysWithDeaths}</Num> days so far in {year} when police killed people in Kenya.</>
                  ) : (
                    <>There were <Num>{daysWithDeaths}</Num> days in {year} when police killed people in Kenya.</>
                  )}
                </p>

                <div>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-slate-700">Killings by police in {year}</h3>
                    <div className="flex items-center gap-2">
                      {hoverDay ? (
                        <span className="text-[11px] font-semibold text-slate-700">
                          {hoverDay.label} — <span className="text-red-600">{hoverDay.count} {hoverDay.count === 1 ? 'death' : 'deaths'}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">hover a day</span>
                      )}
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <span>0</span>
                        {['#f1f5f9', '#fca5a5', '#ef4444', '#991b1b'].map((c) => (
                          <span key={c} className="h-3.5 w-3.5 rounded-sm" style={{ backgroundColor: c }} />
                        ))}
                        <span>3+</span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto pb-1">
                    <svg
                      viewBox={`0 0 ${HEAT_W} ${HEAT_H}`}
                      className="w-full min-w-[440px] h-auto"
                      role="img"
                      aria-label={`Calendar heatmap of police killings in Kenya, ${year}`}
                    >
                      {MONTHS.map((m, mi) => {
                        const col = mi % COLS;
                        const row = Math.floor(mi / COLS);
                        const bx = PAD + col * (BLOCK_W + GAP_X);
                        const by = PAD + row * (BLOCK_H + GAP_Y);
                        const daysInMonth = new Date(year, mi + 1, 0).getDate();
                        return (
                          <g key={m}>
                            <text x={bx} y={by + 10} fill="#475569" fontSize="10" fontWeight="700" fontFamily="sans-serif">
                              {MONTHS_SHORT[mi]}
                            </text>
                            {Array.from({ length: daysInMonth }).map((_, di) => {
                              const count = dailyCounts.get(`${mi}-${di + 1}`) || 0;
                              const cx = bx + (di % 7) * STEP;
                              const cy = by + 18 + Math.floor(di / 7) * STEP;
                              const dateLabel = `${MONTHS_SHORT[mi]} ${String(di + 1).padStart(2, '0')}, ${year}`;
                              return (
                                <rect
                                  key={di}
                                  x={cx}
                                  y={cy}
                                  width={CELL}
                                  height={CELL}
                                  rx={2.5}
                                  fill={heatColor(count)}
                                  className="cursor-pointer"
                                  onMouseEnter={() => setHoverDay({ label: dateLabel, count })}
                                  onMouseLeave={() => setHoverDay(null)}
                                />
                              );
                            })}
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </MpvCard>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-6">
              {/* Card 03 — per capita */}
              <MpvCard
                kicker="03 · Per capita"
                cardRef={perCapitaCardRef}
                summary={`${topCounty ? `${topCounty.label} records the highest rate of police killings in Kenya: ${topCounty.rate} per 1 million residents.` : 'Police killings per 1 million residents by county.'} Data at policebrutalitytracker.co.ke`}
                onDownload={() => downloadCardAsPng(perCapitaCardRef, `killings-per-capita-kenya-${years[0]}-${currentYear}.png`)}
              >
                <p className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed mb-6">
                  {topCounty ? (
                    <>
                      <span className="border-b-2 border-dotted border-red-400/70 text-red-600">{topCounty.label}</span>{' '}
                      records the highest rate — <Num>{topCounty.rate}</Num> killings per 1 million
                      residents since {years[0]}.
                    </>
                  ) : (
                    <>No county data available yet.</>
                  )}
                </p>

                <div>
                  <h3 className="mb-3 text-center text-xs font-bold text-slate-700">
                    Killings per 1 million people in Kenya, {years[0]}–{currentYear}
                  </h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={perCapita} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 0 }}>
                      <CartesianGrid horizontal={false} stroke="rgba(0,0,0,0.06)" />
                      <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="label"
                        width={90}
                        tick={{ fill: '#334155', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                        formatter={(value: number) => [`${value} per 1M`, 'Rate']}
                      />
                      <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={16} label={{ position: 'right', fill: '#64748b', fontSize: 11 }}>
                        {perCapita.map((entry, index) => (
                          <Cell key={entry.county} fill={index === 0 ? '#ef4444' : 'rgba(148,163,184,0.45)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="mt-2 text-right text-[10px] text-slate-500">
                    Population data from the 2019 Kenya census
                  </p>
                </div>
              </MpvCard>

              {/* Card 04 — year on year */}
              <MpvCard
                kicker="04 · Year on year"
                cardRef={yearOnYearCardRef}
                summary={`Police have killed ${yearDeaths.length} people in Kenya in ${year}, compared with ${prevComparison.prevSamePeriod} in the same period of ${prevComparison.prevYear}. Data at policebrutalitytracker.co.ke`}
                onDownload={() => downloadCardAsPng(yearOnYearCardRef, `year-on-year-kenya-${year}.png`)}
              >
                <p className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed mb-6">
                  {year === years[0] ? (
                    <>
                      {years[0]} is the first year in our record — police killed{' '}
                      <Num>{yearDeaths.length}</Num> people.
                    </>
                  ) : (
                    <>
                      Police have killed{' '}
                      <Num>{Math.abs(prevComparison.diff)}</Num>{' '}
                      {prevComparison.diff > 0 ? 'more' : prevComparison.diff < 0 ? 'fewer' : 'the same number of'}{' '}
                      people in {year} compared to the same period in {prevComparison.prevYear}.
                    </>
                  )}
                </p>

                <div>
                  <h3 className="mb-3 text-xs font-bold text-slate-700">
                    {deaths.length} total killings by police — cumulative by month
                  </h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={yearlyCumulative} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
                      <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      {years.map((y) => (
                        <Line
                          key={y}
                          type="monotone"
                          dataKey={String(y)}
                          stroke={y === year ? '#ef4444' : 'rgba(148,163,184,0.3)'}
                          strokeWidth={y === year ? 2.5 : 1.5}
                          dot={false}
                          activeDot={{ r: 3 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </MpvCard>
            </div>
          </div>
          </>
        )}
      </div>
    </section>
  );
};

export default DataModules;
