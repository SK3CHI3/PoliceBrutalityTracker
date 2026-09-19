import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, AlertCircle, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCases } from '@/hooks/useCases';
import { normalizeCountyName } from '@/utils/countyNormalization';
import { kenyanCounties, caseTypes } from '@/data/mockData';
import SEOHead from '@/components/SEOHead';

const CasesIndexPage = () => {
  const { data: cases, isLoading } = useCases();

  const [search, setSearch] = useState('');
  const [selectedCounty, setSelectedCounty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'death': return 'bg-red-600 text-white';
      case 'assault': return 'bg-orange-600 text-white';
      case 'harassment': return 'bg-yellow-600 text-white';
      case 'unlawful_arrest': return 'bg-purple-600 text-white';
      case 'abduction': return 'bg-violet-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const filteredCases = useMemo(() => {
    if (!cases) return [];

    return cases.filter(c => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        c.victimName?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q) ||
        c.county?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q);

      const normalizedCounty = normalizeCountyName(c.county);
      const matchesCounty = selectedCounty === 'all' || normalizedCounty === selectedCounty;

      const matchesType = selectedType === 'all' || c.type === selectedType;

      const matchesFrom = !dateFrom || c.date >= dateFrom;
      const matchesTo = !dateTo || c.date <= dateTo;

      return matchesSearch && matchesCounty && matchesType && matchesFrom && matchesTo;
    });
  }, [cases, search, selectedCounty, selectedType, dateFrom, dateTo]);

  const hasFilters = search || selectedCounty !== 'all' || selectedType !== 'all' || dateFrom || dateTo;

  const clearFilters = () => {
    setSearch('');
    setSelectedCounty('all');
    setSelectedType('all');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <>
      <SEOHead
        title="All Police Brutality Cases Database | PoliceBrutalityTracker"
        description={`Browse ${cases?.length || 'all'} documented police brutality cases across Kenya's 47 counties. Public incident data from multiple sources, centralized.`}
        keywords="police brutality cases, Kenya database, all cases, incident list, human rights violations, police accountability"
        url="https://policebrutalitytracker.co.ke/cases-index"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Police Brutality Cases Database
            </h1>
            <p className="text-gray-400 text-lg">
              {cases?.length || 0} documented cases across Kenya's 47 counties
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-black/20 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name, location, county..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-black/30 border-white/20 text-white placeholder:text-gray-500 focus:border-red-400"
                />
              </div>

              {/* County */}
              <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                <SelectTrigger className="bg-black/30 border-white/20 text-white focus:border-red-400">
                  <SelectValue placeholder="All counties" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="all">All counties</SelectItem>
                  {kenyanCounties.map(county => (
                    <SelectItem key={county} value={county}>{county}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Case Type */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-black/30 border-white/20 text-white focus:border-red-400">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="all">All types</SelectItem>
                  {caseTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date range */}
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-black/30 border-white/20 text-white focus:border-red-400 text-sm"
                  title="From date"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-black/30 border-white/20 text-white focus:border-red-400 text-sm"
                  title="To date"
                />
              </div>
            </div>

            {/* Filter summary + clear */}
            <div className="flex items-center justify-between mt-3">
              <p className="text-sm text-gray-400">
                Showing <span className="text-white font-semibold">{filteredCases.length}</span> of {cases?.length || 0} cases
              </p>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Cases Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-400">Loading cases...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCases.map((caseItem) => (
                <Link
                  key={caseItem.id}
                  to={`/case/${caseItem.id}`}
                  className="block group"
                >
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 h-full">
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors mb-2 line-clamp-1">
                            {caseItem.victimName}
                          </h2>
                          {caseItem.age && (
                            <p className="text-sm text-gray-400">Age: {caseItem.age}</p>
                          )}
                        </div>
                        <Badge className={getTypeColor(caseItem.type)}>
                          {caseItem.type.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-gray-400 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{caseItem.location}, {caseItem.county}</span>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-gray-400 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(caseItem.date)}</span>
                      </div>

                      {/* Description Preview */}
                      <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed mb-4">
                        {caseItem.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <Badge variant="outline" className="border-white/20 text-gray-400">
                          {caseItem.status}
                        </Badge>
                        <span className="text-xs text-gray-500 group-hover:text-red-400 transition-colors">
                          View Details →
                        </span>
                      </div>

                      {/* Community Verification Indicator */}
                      {caseItem.community_verified && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Community Verified
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* No Cases */}
          {!isLoading && filteredCases.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">
                {hasFilters ? 'No cases match your filters.' : 'No cases found in the database.'}
              </p>
              {hasFilters && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="mt-4 border-white/20 text-gray-300 hover:bg-white/10"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CasesIndexPage;
