import React, { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { CATEGORIES } from '../utils/overpass'

// Fix default Leaflet marker icons (Vite doesn't bundle them automatically)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

/** Recenters the map when places change */
function FitBounds({ places, center }) {
  const map = useMap()

  useEffect(() => {
    if (places.length > 1) {
      const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]))
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 })
    } else if (places.length === 1) {
      map.setView([places[0].lat, places[0].lng], 15)
    } else if (center) {
      map.setView(center, 13)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places.map((p) => p.id).join(',')])

  return null
}

/**
 * @param {object[]} places        - places to show on map
 * @param {Set<string>} selectedIds - IDs of selected places (highlighted)
 * @param {function} [onTogglePlace] - callback for clicking a marker
 * @param {boolean}  [showRoute]   - draw a polyline connecting active places in order
 * @param {number[]} [center]      - [lat, lng] fallback center
 */
export default function MapPanel({ places, selectedIds, onTogglePlace, showRoute, center }) {
  const routeCoords = showRoute
    ? places.filter((p) => selectedIds?.has(p.id) ?? true).map((p) => [p.lat, p.lng])
    : []

  return (
    <MapContainer
      center={center ?? [0, 0]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds places={places} center={center} />

      {/* Route line for itinerary view */}
      {showRoute && routeCoords.length > 1 && (
        <Polyline
          positions={routeCoords}
          color="#0d9488"
          weight={3}
          dashArray="8, 10"
          opacity={0.75}
        />
      )}

      {places.map((place, idx) => {
        const isActive = selectedIds ? selectedIds.has(place.id) : true
        const catColor = CATEGORIES[place.category]?.color ?? '#6B7280'
        const radius = isActive ? 11 : 7

        return (
          <CircleMarker
            key={place.id}
            center={[place.lat, place.lng]}
            radius={radius}
            fillColor={isActive ? catColor : '#9CA3AF'}
            color="white"
            weight={2}
            fillOpacity={isActive ? 0.9 : 0.45}
            eventHandlers={
              onTogglePlace
                ? { click: () => onTogglePlace(place.id) }
                : {}
            }
          >
            <Popup>
              <div style={{ minWidth: 140 }}>
                <p style={{ fontWeight: 600, marginBottom: 2 }}>
                  {place.emoji} {place.name}
                </p>
                {place.address && (
                  <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                    {place.address}
                  </p>
                )}
                {showRoute && (
                  <p style={{ fontSize: 11, color: '#0d9488' }}>Parada {idx + 1}</p>
                )}
                {onTogglePlace && (
                  <button
                    onClick={() => onTogglePlace(place.id)}
                    style={{
                      marginTop: 6,
                      fontSize: 11,
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: 'none',
                      cursor: 'pointer',
                      background: isActive ? '#fee2e2' : '#ccfbf1',
                      color: isActive ? '#b91c1c' : '#0f766e',
                      fontWeight: 600,
                    }}
                  >
                    {isActive ? 'Quitar' : 'Agregar'}
                  </button>
                )}
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
