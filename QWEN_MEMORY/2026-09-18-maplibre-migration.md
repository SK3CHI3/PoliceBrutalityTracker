# Map Library: MapLibre GL JS with OpenFreeMap Bright

**Date:** 2026-09-18
**Status:** Active
**Related Files:** `src/components/MapView.tsx`, `src/components/LocationPickerModal.tsx`

## Context

Migrated from Leaflet to MapLibre GL JS to provide better street-level detail and vector tile rendering for the police brutality tracker's interactive map.

## Decision

- **Library:** MapLibre GL JS (open-source, vector tiles)
- **React Wrapper:** `react-map-gl@7` with `/maplibre` import path
- **Map Style:** OpenFreeMap Bright (`https://tiles.openfreemap.org/styles/bright`)
  - Chosen for clean, street-focused rendering
  - No API key required
  - Shows actual streets and place names where incidents occurred

## Kenya Bounds Configuration

The map is constrained to Kenya's geographic area to prevent users from panning to irrelevant locations:

```typescript
const kenyaBounds: [[number, number], [number, number]] = [
  [33.0, -5.5],  // [min longitude, min latitude] (southwest)
  [42.5, 6.0]    // [max longitude, max latitude] (northeast)
];
```

**Key Implementation Details:**
- `maxBounds` prop constrains panning
- Initial load uses `fitBounds()` with padding (40px desktop, 20px mobile)
- Small delay (100ms) ensures map is fully initialized before fitting bounds
- Bounds are slightly wider than Kenya's actual extent to ensure full coverage

## Technical Notes

- Coordinates format: `[[minLng, minLat], [maxLng, maxLat]]`
- MapLibre uses `[longitude, latitude]` order (opposite of Leaflet's `[lat, lng]`)
- Vector tiles provide smooth zooming and crisp rendering at all zoom levels
- OpenFreeMap tiles are free and don't require attribution beyond OpenStreetMap

## Rejected Alternatives

- **Leaflet:** Raster tiles, less detailed at street level
- **MapLibre Demo Tiles:** User rejected as "colorful" and not showing real streets
- **Mapbox GL JS:** Requires API key and has usage limits
- **Google Maps:** Requires API key and has costs

## Future Considerations

- Could add custom tile sources if needed (e.g., satellite imagery)
- May want to add county boundary overlays in the future
- Could implement heatmap visualization for incident density
