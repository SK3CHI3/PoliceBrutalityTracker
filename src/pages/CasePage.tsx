import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, User, AlertCircle, CheckCircle2, Clock, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCase } from '@/hooks/useCases';
import SEOHead from '@/components/SEOHead';
import { useConfirmCase } from '@/hooks/useConfirmCase';
import { useState, useEffect } from 'react';

const CasePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: caseData, isLoading, error } = useCase(id || '');
  const { confirmCase, isConfirming, hasConfirmed } = useConfirmCase();
  
  const [localConfirmationCount, setLocalConfirmationCount] = useState(0);
  const [localCommunityVerified, setLocalCommunityVerified] = useState(false);
  const [userHasConfirmed, setUserHasConfirmed] = useState(false);

  useEffect(() => {
    if (caseData) {
      setLocalConfirmationCount(caseData.confirmation_count || 0);
      setLocalCommunityVerified(caseData.community_verified || false);
      setUserHasConfirmed(hasConfirmed(caseData.id));
    }
  }, [caseData, hasConfirmed]);

  const handleConfirm = async () => {
    if (!caseData || userHasConfirmed) return;
    
    const result = await confirmCase(caseData.id);
    if (result?.success) {
      setLocalConfirmationCount(result.case.confirmation_count);
      setLocalCommunityVerified(result.case.community_verified);
      setUserHasConfirmed(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading case...</div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Case Not Found</h1>
          <p className="text-gray-400 mb-6">The case you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'unconfirmed': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'death': return 'bg-red-600/90 text-white';
      case 'assault': return 'bg-orange-600/90 text-white';
      case 'harassment': return 'bg-yellow-600/90 text-white';
      case 'unlawful_arrest': return 'bg-purple-600/90 text-white';
      case 'abduction': return 'bg-violet-600/90 text-white';
      default: return 'bg-gray-600/90 text-white';
    }
  };

  // Generate structured data for AI
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `Police Brutality Case: ${caseData.victimName}`,
    "description": caseData.description,
    "datePublished": caseData.date,
    "author": {
      "@type": "Organization",
      "name": "PoliceBrutalityTracker"
    },
    "publisher": {
      "@type": "Organization",
      "name": "PoliceBrutalityTracker",
      "logo": {
        "@type": "ImageObject",
        "url": "https://policebrutalitytracker.co.ke/logo.svg"
      }
    },
    "location": {
      "@type": "Place",
      "name": caseData.location,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": caseData.location,
        "addressRegion": caseData.county,
        "addressCountry": "KE"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": caseData.coordinates[0],
        "longitude": caseData.coordinates[1]
      }
    },
    "about": {
      "@type": "Event",
      "name": `Police brutality incident involving ${caseData.victimName}`,
      "startDate": caseData.date,
      "location": {
        "@type": "Place",
        "name": caseData.location
      }
    }
  };

  return (
    <>
      <SEOHead
        title={`${caseData.victimName} - ${caseData.county} | PoliceBrutalityTracker`}
        description={`Police brutality case in ${caseData.county}, Kenya. ${(caseData.description || '').substring(0, 150)}...`}
        keywords={`police brutality, ${caseData.county}, ${caseData.victimName}, Kenya, human rights, ${caseData.type}`}
        url={`https://policebrutalitytracker.co.ke/case/${caseData.id}`}
      />
      
      {/* Structured Data for AI */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/map')}
              className="text-gray-300 hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Map
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12">
              {/* Header Info */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-8 pb-6 border-b border-white/10">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-3xl md:text-4xl font-bold">{caseData.victimName}</h1>
                    {caseData.age && (
                      <Badge variant="outline" className="border-white/20 text-gray-300">
                        Age {caseData.age}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <Badge className={getTypeColor(caseData.type)}>
                      {caseData.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(caseData.status)}>
                      {caseData.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Location & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Location</div>
                    <div className="font-semibold">{caseData.location}</div>
                    <div className="text-sm text-gray-400">{caseData.county} County</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Incident Date</div>
                    <div className="font-semibold">{formatDate(caseData.date)}</div>
                    {caseData.time && (
                      <div className="text-sm text-gray-400">{caseData.time}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Community Verification */}
              <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                    <ThumbsUp className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">Community Verification</h3>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Confirmations</span>
                    <span className="font-semibold">
                      {localConfirmationCount} / 2 {localCommunityVerified && '✓'}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((localConfirmationCount / 2) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {!userHasConfirmed ? (
                  <Button
                    onClick={handleConfirm}
                    disabled={isConfirming}
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
                  >
                    {isConfirming ? 'Confirming...' : 'Confirm This Case'}
                  </Button>
                ) : (
                  <div className="text-center text-sm text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-green-500 inline mr-2" />
                    You've confirmed this case
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Incident Description
                </h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {caseData.description}
                </p>
              </div>

              {/* Additional Information */}
              {((caseData.officersInvolved && caseData.officersInvolved.length > 0) || (caseData.witnesses && caseData.witnesses.length > 0)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {caseData.officersInvolved && caseData.officersInvolved.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <User className="w-5 h-5 text-yellow-500" />
                        Officers Involved
                      </h3>
                      <ul className="space-y-2">
                        {caseData.officersInvolved.map((officer, idx) => (
                          <li key={idx} className="text-gray-300 pl-4 border-l-2 border-yellow-500/30">
                            {officer.name}{officer.rank ? ` (${officer.rank})` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {caseData.witnesses && caseData.witnesses.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-500" />
                        Witnesses
                      </h3>
                      <ul className="space-y-2">
                        {caseData.witnesses.map((name, idx) => (
                          <li key={idx} className="text-gray-300 pl-4 border-l-2 border-blue-500/30">
                            {name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Justice Status */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-semibold">Justice Status</h3>
                </div>
                <p className="text-gray-300">
                  {caseData.justiceServed 
                    ? '✓ Justice has been served in this case.' 
                    : 'Awaiting justice and accountability.'}
                </p>
              </div>

              {/* Source Information */}
              {caseData.source && (
                <div className="mt-6 pt-6 border-t border-white/10 text-sm text-gray-400">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      Source: {caseData.source}
                      {caseData.reportedBy && ` • Reported by: ${caseData.reportedBy}`}
                    </div>
                    <div>
                      Case ID: {caseData.id.substring(0, 8)}...
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Map Embed Placeholder */}
          <div className="mt-6 text-center">
            <Button
              onClick={() => navigate(`/map`)}
              className="bg-red-600 hover:bg-red-700"
            >
              <MapPin className="w-4 h-4 mr-2" />
              View on Interactive Map
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CasePage;

