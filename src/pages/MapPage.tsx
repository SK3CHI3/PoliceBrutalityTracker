import { useState } from 'react';
import MapView from '@/components/MapView';
import Header from '@/components/Header';
import SubmitCaseModal from '@/components/SubmitCaseModal';
import DataSidebar from '@/components/DataSidebar';
import CaseModal from '@/components/CaseModal';
import SEOHead from '@/components/SEOHead';
import StructuredData from '@/components/StructuredData';

import { Case, FilterState } from '@/types';
import { useCases } from '@/hooks/useCases';
import { useVisitorTracking } from '@/hooks/useVisitorTracking';
import { normalizeCountyName } from '@/utils/countyNormalization';
import { SidebarProvider, Sidebar, SidebarTrigger } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';

const MapPage = () => {
  // Track visitor
  useVisitorTracking();

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    counties: [],
    caseTypes: [],
    dateRange: { start: '', end: '' },
  });

  // Fetch cases from Supabase
  const { data: cases = [], isLoading, error } = useCases();

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = !filters.search ||
      caseItem.victimName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      caseItem.location?.toLowerCase().includes(filters.search.toLowerCase()) ||
      caseItem.description?.toLowerCase().includes(filters.search.toLowerCase());

    const normalizedCounty = normalizeCountyName(caseItem.county);
    const matchesCounty = filters.counties.length === 0 || filters.counties.includes(normalizedCounty);
    const matchesCaseType = filters.caseTypes.length === 0 || filters.caseTypes.includes(caseItem.type);

    const start = filters.dateRange?.start;
    const end = filters.dateRange?.end;
    const matchesDateRange = (!start || caseItem.date >= start) &&
                            (!end || caseItem.date <= end);

    return matchesSearch && matchesCounty && matchesCaseType && matchesDateRange;
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-red-400" />
          <p className="text-white">Loading cases...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-center">
          <p className="text-red-400 text-lg">Error loading cases</p>
          <p className="text-gray-400">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Interactive Map | PoliceBrutalityTracker - Police Brutality Tracking"
        description="Explore police brutality incidents across Kenya with our interactive map. Filter by county, case type, and date range to understand patterns and trends."
        keywords="police brutality map, Kenya incidents, interactive map, case tracking, county data, incident visualization"
        url="https://policebrutalitytracker.co.ke/map"
      />
      <StructuredData cases={filteredCases as any} pageType="map" />
      
      <SidebarProvider>
        {/* Mobile Sidebar Trigger */}
        <div className="fixed top-4 left-4 z-50 md:hidden">
          <SidebarTrigger />
        </div>
        <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 overflow-hidden flex flex-col">
        <Header
          onOpenFilters={() => {}} // Not needed with sidebar
          onSubmitCase={() => setIsSubmitModalOpen(true)}
          caseCount={filteredCases.length}
        />
        <div className="flex flex-1 min-h-0">
          <Sidebar>
            <DataSidebar
              filters={filters}
              onFiltersChange={setFilters}
              filteredCasesCount={filteredCases.length}
              totalCasesCount={cases.length}
              cases={cases}
            />
          </Sidebar>
          <div className="flex-1 relative min-h-0">
            <MapView
              cases={filteredCases}
              onViewDetails={(caseItem) => setSelectedCase(caseItem)}
            />
          </div>
        </div>


        {/* Detail Modal */}
        {selectedCase && (
          <CaseModal
            case={selectedCase}
            onClose={() => setSelectedCase(null)}
          />
        )}

        {isSubmitModalOpen && (
          <SubmitCaseModal
            onClose={() => setIsSubmitModalOpen(false)}
          />
        )}
        </div>
      </SidebarProvider>
    </>
  );
};

export default MapPage;
