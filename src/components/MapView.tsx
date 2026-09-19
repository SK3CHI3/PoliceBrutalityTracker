import React, { useRef, useState } from 'react';
import Map, { Marker, Popup, NavigationControl, MapRef } from 'react-map-gl/maplibre';
import { Case } from '@/types';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useIsMobile } from '@/hooks/use-mobile';

interface MapViewProps {
  cases: Case[];
  onCaseHover?: (caseItem: Case, position: { x: number; y: number }) => void;
  onCaseLeave?: () => void;
  onCaseClick?: (caseItem: Case, position: { x: number; y: number }) => void;
  onCaseSelect?: (caseItem: Case) => void;
  onViewDetails?: (caseItem: Case) => void;
}

const MapView = ({ cases, onCaseHover, onCaseLeave, onCaseClick, onCaseSelect, onViewDetails }: MapViewProps) => {
  const kenyaCenter: [number, number] = [37.9062, -0.0236]; // [longitude, latitude]
  const isMobile = useIsMobile();
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [clickedPin, setClickedPin] = useState<string | null>(null);
  const mapRef = useRef<MapRef>(null);
  const hoverShowTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const kenyaBounds: [[number, number], [number, number]] = [
    [32, -6],
    [43, 7]
  ];

  const handleMapLoad = () => {
    if (mapRef.current) {
      mapRef.current.fitBounds(kenyaBounds, {
        padding: isMobile ? 30 : 50,
        duration: 0
      });
    }
  };

  const getTypeLabel = (type: Case['type']) => {
    const labels: Record<Case['type'], string> = {
      'death': 'Death',
      'assault': 'Assault',
      'harassment': 'Harassment',
      'unlawful_arrest': 'Unlawful Arrest',
      'abduction': 'Abduction',
      'other': 'Other'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: Case['type']) => {
    const colors: Record<Case['type'], string> = {
      'death': 'bg-red-100 text-red-700',
      'assault': 'bg-orange-100 text-orange-700',
      'harassment': 'bg-yellow-100 text-yellow-700',
      'unlawful_arrest': 'bg-purple-100 text-purple-700',
      'abduction': 'bg-violet-100 text-violet-700',
      'other': 'bg-gray-100 text-gray-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'confirmed': 'Confirmed',
      'unconfirmed': 'Pending Verification',
      'rejected': 'Rejected'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'confirmed': 'bg-green-100 text-green-700',
      'unconfirmed': 'bg-amber-100 text-amber-700',
      'rejected': 'bg-gray-100 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatLocation = (location: string, county: string) => {
    // Deduplicate if location and county are the same
    if (location.toLowerCase() === county.toLowerCase()) {
      return county;
    }
    return `${location}, ${county}`;
  };

  const formatVictimName = (name: string) => {
    if (!name || name.toLowerCase() === 'unknown' || name.trim() === '') {
      return 'Name not available';
    }
    return name;
  };

  return (
    <div className="absolute inset-0">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: kenyaCenter[0],
          latitude: kenyaCenter[1],
          zoom: 5.5,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://tiles.openfreemap.org/styles/bright"
        minZoom={5}
        maxZoom={18}
        onLoad={handleMapLoad}
      >
        <NavigationControl position="bottom-right" />

        {cases.map((caseItem) => {
          const isVerified = caseItem.community_verified;
          const needsVerification = caseItem.needs_verification ?? true;
          const isHovered = hoveredPin === caseItem.id;
          const isClicked = clickedPin === caseItem.id;
          const isActive = isHovered || isClicked;

          return (
            <Marker
              key={caseItem.id}
              longitude={caseItem.coordinates[1]}
              latitude={caseItem.coordinates[0]}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                if (mapRef.current) {
                  mapRef.current.flyTo({
                    center: [caseItem.coordinates[1], caseItem.coordinates[0]],
                    zoom: 15,
                    duration: 700
                  });
                }
                setClickedPin(caseItem.id);
                setHoveredPin(null);
                if (onCaseClick) {
                  onCaseClick(caseItem, { x: 0, y: 0 });
                }
              }}
            >
              {/* Buffer zone around marker for stable hover */}
              <div
                className="relative"
                style={{ padding: '12px', margin: '-12px' }}
                onMouseEnter={() => {
                  if (!isMobile && !clickedPin) {
                    // Clear any pending hide timeout
                    if (hoverHideTimeoutRef.current) {
                      clearTimeout(hoverHideTimeoutRef.current);
                      hoverHideTimeoutRef.current = null;
                    }
                    // Clear any pending show timeout
                    if (hoverShowTimeoutRef.current) {
                      clearTimeout(hoverShowTimeoutRef.current);
                    }
                    // Add delay before showing popup (300ms)
                    hoverShowTimeoutRef.current = setTimeout(() => {
                      setHoveredPin(caseItem.id);
                      hoverShowTimeoutRef.current = null;
                    }, 300);
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile && !clickedPin) {
                    // Clear any pending show timeout
                    if (hoverShowTimeoutRef.current) {
                      clearTimeout(hoverShowTimeoutRef.current);
                      hoverShowTimeoutRef.current = null;
                    }
                    // Delay hiding popup to allow cursor to move to popup (100ms)
                    if (hoverHideTimeoutRef.current) {
                      clearTimeout(hoverHideTimeoutRef.current);
                    }
                    hoverHideTimeoutRef.current = setTimeout(() => {
                      setHoveredPin(null);
                      hoverHideTimeoutRef.current = null;
                    }, 100);
                  }
                }}
              >
                <div
                  className={`cursor-pointer ${isActive ? 'scale-125' : ''} transition-transform`}
                  style={{ width: isMobile ? 14 : 18, height: isMobile ? 14 : 18 }}
                >
                  <svg viewBox="0 0 24 24" fill="#EF4444" className="w-full h-full">
                    <circle cx="12" cy="8" r="5" />
                    <rect x="4" y="15" width="16" height="6" rx="3" />
                  </svg>
                  {needsVerification && !isVerified && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                      ?
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-75" />
                  )}
                </div>
              </div>
            </Marker>
          );
        })}

        {/* Popup for hovered or clicked marker */}
        {(hoveredPin || clickedPin) && (() => {
          const activePin = clickedPin || hoveredPin;
          const caseItem = cases.find(c => c.id === activePin);
          if (!caseItem) return null;
          const isClickedState = clickedPin === caseItem.id;

          return (
            <Popup
              longitude={caseItem.coordinates[1]}
              latitude={caseItem.coordinates[0]}
              anchor="bottom"
              onClose={() => {
                setClickedPin(null);
                setHoveredPin(null);
              }}
              closeButton={false}
              closeOnClick={false}
              className="custom-popup"
              maxWidth="280px"
            >
              <div
                className="p-4 overflow-hidden relative"
                onMouseEnter={() => {
                  // Clear any pending hide timeout
                  if (hoverHideTimeoutRef.current) {
                    clearTimeout(hoverHideTimeoutRef.current);
                    hoverHideTimeoutRef.current = null;
                  }
                }}
                onMouseLeave={() => {
                  // Clear hover when cursor leaves popup (only if not clicked)
                  if (!clickedPin) {
                    if (hoverHideTimeoutRef.current) {
                      clearTimeout(hoverHideTimeoutRef.current);
                    }
                    hoverHideTimeoutRef.current = setTimeout(() => {
                      setHoveredPin(null);
                      hoverHideTimeoutRef.current = null;
                    }, 100);
                  }
                }}
              >
                {/* Close button (X) - always visible */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setClickedPin(null);
                    setHoveredPin(null);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition z-10"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Same card for both hover and click */}
                <div className="flex items-start justify-between gap-2 mb-3 pr-6">
                  <h3 className="font-bold text-base text-gray-900 leading-tight flex-1">
                    {formatVictimName(caseItem.victimName)}
                  </h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${getStatusColor(caseItem.status)}`}>
                    {getStatusLabel(caseItem.status)}
                  </span>
                </div>

                <div className="mb-3">
                  <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${getTypeColor(caseItem.type)}`}>
                    {getTypeLabel(caseItem.type)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 flex-shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{formatLocation(caseItem.location, caseItem.county)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 flex-shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(caseItem.date)}</span>
                  </div>
                </div>

                <button
                  className="w-full bg-red-600 text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-red-700 transition"
                  onClick={() => {
                    if (onViewDetails) {
                      onViewDetails(caseItem);
                    } else if (onCaseSelect) {
                      onCaseSelect(caseItem);
                    }
                  }}
                >
                  See More Details
                </button>
              </div>
            </Popup>
          );
        })()}
      </Map>

      {/* Empty state overlay */}
      {cases.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="text-center p-6 mx-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 max-w-sm">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">No cases found</h3>
            <p className="text-gray-600 text-sm">Try adjusting your filter criteria to see more cases</p>
          </div>
        </div>
      )}

      {/* Attribution */}
      <div className="absolute bottom-1 right-1 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded pointer-events-none z-20">
        © MapLibre | © OpenStreetMap
      </div>
    </div>
  );
};

export default MapView;
