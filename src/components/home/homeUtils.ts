import { Case } from '@/types';

export const CASE_TYPE_META: Record<Case['type'], { label: string; color: string; badgeClass: string }> = {
  death: { label: 'Death', color: '#ef4444', badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30' },
  assault: { label: 'Assault', color: '#fb923c', badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  harassment: { label: 'Harassment', color: '#facc15', badgeClass: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  unlawful_arrest: { label: 'Unlawful Arrest', color: '#60a5fa', badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  abduction: { label: 'Abduction', color: '#c084fc', badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  other: { label: 'Other', color: '#9ca3af', badgeClass: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
};

export const formatCaseType = (type: string | null | undefined): string => {
  if (!type) return 'Unknown';
  const meta = CASE_TYPE_META[type as Case['type']];
  if (meta) return meta.label;
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatRelativeDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

export const formatFullDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Date unknown';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Date unknown';
  return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
};

export interface HomeStats {
  totalCases: number;
  deathsCount: number;
  countiesCount: number;
  earliestYear: number | null;
  latestUpdate: Date | null;
}

export const computeHomeStats = (cases: Case[] | undefined): HomeStats => {
  if (!cases || cases.length === 0) {
    return { totalCases: 0, deathsCount: 0, countiesCount: 0, earliestYear: null, latestUpdate: null };
  }

  const counties = new Set(
    cases
      .map((c) => c.county)
      .filter(Boolean)
  );

  let earliestYear: number | null = null;
  let latestUpdate: Date | null = null;

  for (const c of cases) {
    if (c.date) {
      const d = new Date(c.date);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        if (earliestYear === null || year < earliestYear) earliestYear = year;
      }
    }
    const updatedStr = c.updated_at || c.created_at || c.date;
    if (updatedStr) {
      const updated = new Date(updatedStr);
      if (!isNaN(updated.getTime()) && (!latestUpdate || updated > latestUpdate)) {
        latestUpdate = updated;
      }
    }
  }

  return {
    totalCases: cases.length,
    deathsCount: cases.filter((c) => c.type === 'death').length,
    countiesCount: counties.size,
    earliestYear,
    latestUpdate,
  };
};
