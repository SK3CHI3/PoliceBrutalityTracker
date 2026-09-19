import React, { useState, useRef, useEffect } from 'react';
import Map, { Marker, NavigationControl, useMap } from 'react-map-gl/maplibre';
import { X, MapPin, Check, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import 'maplibre-gl/dist/maplibre-gl.css';

interface LocationData {
  latitude: number;
  longitude: number;
  location: string;
  county: string;
}

interface LocationPickerModalProps {
  onClose: () => void;
  onLocationSelect: (locationData: LocationData) => void;
  initialLocation?: LocationData;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    suburb?: string;
    neighbourhood?: string;
    village?: string;
    town?: string;
    city?: string;
    county?: string;
    state?: string;
  };
}

// Component to handle map clicks
const MapClickHandler = ({ onLocationClick }: { onLocationClick: (lat: number, lng: number) => void }) => {
  const { current: map } = useMap();

  useEffect(() => {
    if (!map) return;

    const handleClick = (e: any) => {
      onLocationClick(e.lngLat.lat, e.lngLat.lng);
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onLocationClick]);

  return null;
};

// Component to fly map to a location
const FlyToLocation = ({ position }: { position: [number, number] | null }) => {
  const { current: map } = useMap();

  useEffect(() => {
    if (position && map) {
      map.flyTo({
        center: [position[1], position[0]], // [longitude, latitude]
        zoom: 14,
        duration: 1500,
      });
    }
  }, [position, map]);

  return null;
};

const LocationPickerModal = ({ onClose, onLocationSelect, initialLocation }: LocationPickerModalProps) => {
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(
    initialLocation ? [initialLocation.latitude, initialLocation.longitude] : null
  );
  const [locationName, setLocationName] = useState(initialLocation?.location || '');
  const [countyName, setCountyName] = useState(initialLocation?.county || '');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Nairobi center coordinates (more precise)
  const nairobCenter: [number, number] = [36.8219, -1.2921]; // [longitude, latitude]

  // Kenya's bounding box (for reference, but we'll make it less restrictive)
  const kenyaBounds: [number, number, number, number] = [
    33.0,  // min longitude (west)
    -5.0,  // min latitude (south)
    42.0,  // max longitude (east)
    6.0    // max latitude (north)
  ];

  // Search for locations using Nominatim API
  const searchLocation = async (query: string) => {
    if (query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&` +
        `countrycodes=ke&` +
        `format=json&` +
        `limit=5&` +
        `addressdetails=1`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(data.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: "Unable to search for locations. Please try again.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search handler
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocation(searchQuery);
      }, 500);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle clicking a search result
  const handleSearchResultClick = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setSelectedPosition([lat, lng]);
    
    // Extract location and county from result
    const address = result.address;
    const location = address.suburb || address.neighbourhood || address.village || address.town || address.city || 'Unknown Location';
    const county = address.state || address.county || 'Unknown County';
    
    setLocationName(location);
    setCountyName(county);
    setSearchQuery('');
    setShowResults(false);
    setSearchResults([]);
  };

  const handleMapClick = async (lat: number, lng: number) => {
    // Validate coordinates are within Kenya bounds
    if (lat < -4.7 || lat > 5.0 || lng < 33.9 || lng > 41.9) {
      toast({
        variant: "destructive",
        title: "Location Outside Kenya",
        description: "Please select a location within Kenya borders. You can pan the map freely, but incident locations must be within Kenya.",
        duration: 5000,
      });
      return;
    }

    setSelectedPosition([lat, lng]);
    setIsGeocoding(true);
    
    try {
      // Use Nominatim for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.address) {
        // Extract location and county from the response
        const address = data.address;
        const location = address.suburb || address.neighbourhood || address.village || address.town || address.city || 'Unknown Location';
        const county = address.state || address.county || 'Unknown County';
        
        setLocationName(location);
        setCountyName(county);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Keep the manual input fields available if geocoding fails
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedPosition || !locationName.trim() || !countyName.trim()) {
      return;
    }

    onLocationSelect({
      latitude: selectedPosition[0],
      longitude: selectedPosition[1],
      location: locationName.trim(),
      county: countyName.trim(),
    });
  };

  const isValidSelection = selectedPosition && locationName.trim() && countyName.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <Card className="flex-1 overflow-hidden">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-red-500" />
                <span>Select Incident Location</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Search for a location or click on the map to select the exact incident location.
            </p>
            
            {/* Search Bar */}
            <div className="mt-4 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for a location in Kenya (e.g., Kibera, Nairobi CBD, Mombasa)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{result.display_name}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {showResults && searchResults.length === 0 && !isSearching && searchQuery.length >= 3 && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                  <p className="text-sm text-gray-500 text-center">No locations found. Try a different search term.</p>
                </div>
              )}
            </div>
          </CardHeader>
        
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-[500px]">
            {/* Map */}
            <div className="lg:col-span-2 relative">
              <Map
                initialViewState={{
                  longitude: selectedPosition ? selectedPosition[1] : nairobCenter[0],
                  latitude: selectedPosition ? selectedPosition[0] : nairobCenter[1],
                  zoom: selectedPosition ? 14 : 10,
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="https://tiles.openfreemap.org/styles/bright"
                maxZoom={18}
                minZoom={2}
              >
                <NavigationControl position="top-right" />
                <MapClickHandler onLocationClick={handleMapClick} />
                <FlyToLocation position={selectedPosition} />

                {selectedPosition && (
                  <Marker
                    longitude={selectedPosition[1]}
                    latitude={selectedPosition[0]}
                    anchor="bottom"
                  >
                    <svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 19.404 12.5 41 12.5 41S25 19.404 25 12.5C25 5.596 19.404 0 12.5 0ZM12.5 17C10.015 17 8 14.985 8 12.5C8 10.015 10.015 8 12.5 8C14.985 8 17 10.015 17 12.5C17 14.985 14.985 17 12.5 17Z" fill="#EF4444"/>
                    </svg>
                  </Marker>
                )}
              </Map>
              
              {/* Instructions overlay */}
              {!selectedPosition && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-200 max-w-sm text-center">
                    <MapPin className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">Click anywhere on the map</p>
                    <p className="text-xs text-gray-600">to select the incident location</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Location Details */}
            <div className="p-6 border-l border-border bg-gray-50/50">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-3">
                    Location Details
                  </h3>

                  {selectedPosition && (
                    <div className="text-xs text-gray-500 mb-4 p-2 bg-white rounded border">
                      <strong>Coordinates:</strong><br />
                      Lat: {selectedPosition[0].toFixed(6)}<br />
                      Lng: {selectedPosition[1].toFixed(6)}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="locationName">Location Name *</Label>
                    <Input
                      id="locationName"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="e.g., Kibera, CBD, etc."
                      disabled={isGeocoding}
                    />
                    {isGeocoding && (
                      <p className="text-xs text-gray-500 mt-1">Looking up location...</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="countyName">County *</Label>
                    <Input
                      id="countyName"
                      value={countyName}
                      onChange={(e) => setCountyName(e.target.value)}
                      placeholder="e.g., Nairobi, Mombasa, etc."
                      disabled={isGeocoding}
                    />
                  </div>
                </div>

                {!selectedPosition && (
                  <div className="text-xs text-gray-500 text-center pt-4">
                    Please select a location on the map first
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        </Card>

        {/* Action Buttons - Outside the card to prevent map interaction conflicts */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3 px-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValidSelection || isGeocoding}
            className="flex-1 order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            Confirm Location
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
