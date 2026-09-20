import { useState } from 'react';
import { X, Calendar, MapPin, User, AlertTriangle, Clock, Shield, Phone, Users, FileText, Video, Image as ImageIcon, ExternalLink, CheckCircle2, XCircle, Scale, Building2, Briefcase, ChevronLeft, ChevronRight, Heart, Camera, ThumbsUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Case } from '@/types';
import { useConfirmCase } from '@/hooks/useConfirmCase';
import { toast } from '@/components/ui/sonner';

interface CaseModalProps {
  case: Case;
  onClose: () => void;
}

const CaseModal = ({ case: caseData, onClose }: CaseModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [localConfirmationCount, setLocalConfirmationCount] = useState(caseData.confirmation_count || 0);
  const [localCommunityVerified, setLocalCommunityVerified] = useState(caseData.community_verified || false);
  const { confirmCase, isConfirming, error: confirmError, hasConfirmed } = useConfirmCase();
  
  const userHasConfirmed = hasConfirmed(caseData.id);

  const handleConfirm = async () => {
    const result = await confirmCase(caseData.id);
    
    if (result) {
      // Update local state optimistically
      setLocalConfirmationCount(result.case.confirmation_count);
      setLocalCommunityVerified(result.case.community_verified);
      toast.success('Thank you for confirming this case!');
    } else if (confirmError) {
      toast.error(confirmError);
    }
  };

  const getStatusConfig = (status: Case['status']) => {
    switch (status) {
      case 'confirmed':
        return {
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          icon: CheckCircle2,
          label: 'Verified',
          labelFull: 'Community Verified'
        };
      case 'unconfirmed':
        return {
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          icon: AlertTriangle,
          label: 'Unverified',
          labelFull: 'Pending Verification'
        };
      default:
        return {
          color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
          icon: AlertTriangle,
          label: status,
          labelFull: status
        };
    }
  };

  const getTypeConfig = (type: Case['type']) => {
    switch (type) {
      case 'death':
        return {
          color: 'bg-red-500/20 text-red-300 border-red-500/30',
          label: 'Death',
          icon: AlertTriangle
        };
      case 'assault':
        return {
          color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
          label: 'Physical Assault',
          icon: AlertTriangle
        };
      case 'harassment':
        return {
          color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
          label: 'Harassment',
          icon: AlertTriangle
        };
      case 'unlawful_arrest':
        return {
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          label: 'Unlawful Arrest',
          icon: Scale
        };
      case 'abduction':
        return {
          color: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
          label: 'Abduction',
          icon: AlertTriangle
        };
      case 'enforced_disappearance':
        return {
          color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          label: 'Enforced Disappearance',
          icon: AlertTriangle
        };
      case 'other':
        return {
          color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
          label: 'Other',
          icon: AlertTriangle
        };
      default:
        return {
          color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
          label: type,
          icon: AlertTriangle
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const nextImage = () => {
    if (caseData.photos && currentImageIndex < caseData.photos.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const statusConfig = getStatusConfig(caseData.status);
  const typeConfig = getTypeConfig(caseData.type);
  const StatusIcon = statusConfig.icon;
  const TypeIcon = typeConfig.icon;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      style={{ touchAction: 'none' }}
    >
      <div 
        className="relative w-full sm:max-w-4xl h-screen sm:h-[95vh] max-h-[100dvh] bg-gradient-to-br from-slate-900 via-red-950/50 to-slate-900 border-t sm:border border-white/10 sm:rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:fade-in duration-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Gradient overlay effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-transparent to-slate-900/20 pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
        
        {/* Header - Sticky */}
        <div className="flex-shrink-0 bg-black/40 backdrop-blur-xl border-b border-white/10 relative z-10"
          style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top))' }}
        >
          <div className="px-4 sm:px-6 py-2.5 sm:py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5 sm:space-x-3 flex-1 min-w-0">
                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-red-500 to-red-700 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-xl font-bold text-white line-clamp-1">
                      {caseData.victimName}
                    </h2>
                    {caseData.age && (
                      <p className="text-xs text-gray-400">Age {caseData.age}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <Badge className={`${statusConfig.color} border flex items-center space-x-1 px-2 py-0.5 text-xs whitespace-nowrap`}>
                      <StatusIcon className="w-3 h-3" />
                      <span>{statusConfig.label}</span>
                    </Badge>
                    <Badge className={`${typeConfig.color} border flex items-center space-x-1 px-2 py-0.5 text-xs whitespace-nowrap`}>
                      <TypeIcon className="w-3 h-3" />
                      <span>{typeConfig.label}</span>
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
            willChange: 'scroll-position'
          }}
        >
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-5 pb-6"
            style={{ paddingBottom: 'max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom)))' }}
          >
            
            {/* Image Carousel - Full Width Hero */}
            {caseData.photos && caseData.photos.length > 0 && (
              <div className="relative -mx-3 sm:mx-0 sm:rounded-xl overflow-hidden bg-black/40 border-y sm:border border-white/10">
                <div className="relative aspect-video sm:aspect-[21/9] bg-black">
                  <img
                    src={caseData.photos[currentImageIndex]}
                    alt={`Evidence ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Carousel Controls */}
                  {caseData.photos.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        disabled={currentImageIndex === 0}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/60 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        disabled={currentImageIndex === caseData.photos.length - 1}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/60 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-black/70 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 flex items-center space-x-1.5">
                    <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                    <span className="text-xs sm:text-sm font-medium text-white">
                      {currentImageIndex + 1} / {caseData.photos.length}
                    </span>
                  </div>

                  {/* Thumbnail Strip */}
                  {caseData.photos.length > 1 && (
                    <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 sm:space-x-2">
                      {caseData.photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                            index === currentImageIndex 
                              ? 'bg-white w-4 sm:w-6' 
                              : 'bg-white/40 hover:bg-white/60'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-4 hover:border-white/20 transition-colors">
            <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Incident Date</p>
                    <p className="text-sm font-semibold text-white">{formatDate(caseData.date)}</p>
                    {caseData.time && (
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(caseData.time)}
                      </p>
                    )}
                  </div>
              </div>
            </div>

              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-4 hover:border-white/20 transition-colors">
            <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Location</p>
                    <p className="text-sm font-semibold text-white line-clamp-1">{caseData.location}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{caseData.county} County</p>
                  </div>
              </div>
            </div>
          </div>

          {/* Description */}
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-5">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                <h3 className="text-base sm:text-lg font-bold text-white">Incident Description</h3>
              </div>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-wrap">
              {caseData.description}
            </p>
          </div>

            {/* Additional Details Section */}
            {(caseData.policeStation || caseData.caseNumber || caseData.legalStatus || caseData.medicalReport || caseData.compensation) && (
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-5">
                <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  <h3 className="text-base sm:text-lg font-bold text-white">Case Details</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {caseData.policeStation && (
                    <div className="flex items-start space-x-2.5">
                      <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Police Station</p>
                        <p className="text-sm text-white mt-0.5 break-words">{caseData.policeStation}</p>
                      </div>
                    </div>
                  )}
                  {caseData.caseNumber && (
                    <div className="flex items-start space-x-2.5">
                      <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Case Number</p>
                        <p className="text-sm text-white mt-0.5 font-mono break-all">{caseData.caseNumber}</p>
                      </div>
                    </div>
                  )}
                  {caseData.legalStatus && (
                    <div className="flex items-start space-x-2.5">
                      <Scale className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Legal Status</p>
                        <p className="text-sm text-white mt-0.5 break-words">{caseData.legalStatus}</p>
                      </div>
                    </div>
                  )}
                  {caseData.medicalReport && (
                    <div className="flex items-start space-x-2.5">
                      <Heart className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Medical Report</p>
                        <p className="text-sm text-white mt-0.5 break-words">{caseData.medicalReport}</p>
                      </div>
                    </div>
                  )}
                  {caseData.compensation && (
                    <div className="flex items-start space-x-2.5 sm:col-span-2">
                      <Scale className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Compensation</p>
                        <p className="text-sm text-white mt-0.5 break-words">{caseData.compensation}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Officers Involved */}
            {caseData.officersInvolved && caseData.officersInvolved.length > 0 && (
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-5">
                <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  <h3 className="text-base sm:text-lg font-bold text-white">Officers Involved</h3>
                </div>
                <div className="space-y-2.5">
                  {caseData.officersInvolved.map((officer, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <p className="text-sm font-semibold text-white">{officer.name}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-400">
                        {officer.rank && <span>Rank: {officer.rank}</span>}
                        {officer.badge_number && <span>Badge: {officer.badge_number}</span>}
                        {officer.station && <span>Station: {officer.station}</span>}
                      </div>
                    </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Witnesses */}
            {caseData.witnesses && caseData.witnesses.length > 0 && (
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-5">
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  <h3 className="text-base sm:text-lg font-bold text-white">Witnesses</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {caseData.witnesses.map((witness, index) => (
                    <Badge key={index} className="bg-green-500/20 text-green-300 border-green-500/30 border px-2.5 py-1 text-xs sm:text-sm">
                      {witness}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Video Evidence */}
              {caseData.videoLinks && caseData.videoLinks.length > 0 && (
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-5">
                <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                  <Video className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                  <h3 className="text-base sm:text-lg font-bold text-white">Video Evidence</h3>
                </div>
                  <div className="space-y-2">
                    {caseData.videoLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:border-pink-500/50 hover:bg-white/10 transition-all group overflow-hidden"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1 overflow-hidden">
                        <div className="w-9 h-9 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Video className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="text-sm font-medium text-white truncate">Video Evidence {index + 1}</p>
                          <p className="text-xs text-gray-400 truncate">{link}</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-pink-400 transition-colors flex-shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

            {/* Contact & Meta Info */}
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-5">
              <div className="space-y-3 text-sm">
                {caseData.source && (
                  <div className="flex items-start space-x-2.5">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Source</p>
                      {caseData.source.startsWith('http') ? (
                        <a
                          href={caseData.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 mt-0.5 inline-block break-all hover:underline text-xs sm:text-sm"
                        >
                          {caseData.source}
                        </a>
                      ) : (
                        <p className="text-white mt-0.5 break-words">{caseData.source}</p>
                      )}
                    </div>
                  </div>
                )}
                {caseData.reportedBy && (
                  <div className="flex items-start space-x-2.5">
                    <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Reported By</p>
                      <p className="text-white mt-0.5 break-words">{caseData.reportedBy}</p>
                    </div>
                  </div>
                )}
                {caseData.familyContact && (
                  <div className="flex items-start space-x-2.5">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Family Contact</p>
                      <p className="text-white mt-0.5 break-words">{caseData.familyContact}</p>
                    </div>
                  </div>
                )}
                {caseData.scraped_from_url && (
                  <div className="flex items-start space-x-2.5">
                    <ExternalLink className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Source URL</p>
                      <a 
                        href={caseData.scraped_from_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 mt-0.5 inline-block break-all hover:underline text-xs sm:text-sm"
                      >
                        {caseData.scraped_from_url}
                      </a>
                    </div>
                  </div>
                )}
                {typeof caseData.justiceServed !== 'undefined' && (
                  <div className="flex items-start space-x-2.5">
                    <Scale className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Justice Status</p>
                      <p className={`mt-0.5 font-medium ${caseData.justiceServed ? 'text-emerald-400' : 'text-red-400'}`}>
                        {caseData.justiceServed ? '✓ Justice Served' : '✗ Justice Not Served'}
                      </p>
                    </div>
                  </div>
                )}
                {caseData.confidence_score !== undefined && (
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Confidence Score</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-white/10 rounded-full h-2">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              caseData.confidence_score >= 80 ? 'bg-emerald-500' : 
                              caseData.confidence_score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${caseData.confidence_score}%` }}
                          />
                        </div>
                        <span className="text-white font-semibold text-sm">{caseData.confidence_score}%</span>
                      </div>
                    </div>
            </div>
          )}
              </div>
                </div>

            {/* Community Verification Section */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <ThumbsUp className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                  <h3 className="text-base sm:text-lg font-bold text-white">Community Verification</h3>
                </div>
                {localCommunityVerified && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 border flex items-center space-x-1 px-2.5 py-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </Badge>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">
                    {localConfirmationCount < 2 
                      ? `Needs ${2 - localConfirmationCount} more confirmation${2 - localConfirmationCount === 1 ? '' : 's'}`
                      : `${localConfirmationCount} confirmations`}
                  </span>
                  <span className="text-sm font-semibold text-cyan-400">
                    {localConfirmationCount}/2
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      localCommunityVerified ? 'bg-emerald-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.min((localConfirmationCount / 2) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Info Message */}
              <div className="flex items-start space-x-2 mb-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {localCommunityVerified 
                    ? 'This incident has been verified by the community. Multiple people have confirmed its authenticity.'
                    : 'Help verify this incident by confirming if you have knowledge about it. Cases need 2 confirmations to be community-verified.'}
                </p>
              </div>

              {/* Confirm Button */}
              {localConfirmationCount >= 2 || localCommunityVerified ? (
                <div className="flex items-center justify-center space-x-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg py-3 px-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-300">Case fully verified</span>
                </div>
              ) : !userHasConfirmed ? (
                <Button
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  className="w-full max-w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  {isConfirming ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 flex-shrink-0" />
                      <span className="truncate">Confirming...</span>
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Confirm This Case</span>
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center justify-center space-x-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg py-3 px-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-300">You've confirmed this case</span>
                </div>
              )}
            </div>

            {/* Footer timestamp */}
            <div className="text-center text-xs text-gray-500 pt-1 pb-2">
              Case ID: {caseData.id.slice(0, 8)} {caseData.created_at && `• Added ${new Date(caseData.created_at).toLocaleDateString()}`}
              {caseData.auto_approved && <span className="ml-2 text-emerald-400">• Auto-approved</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseModal;
