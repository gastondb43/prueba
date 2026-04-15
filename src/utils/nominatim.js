const BASE = 'https://nominatim.openstreetmap.org'

/**
 * Search for cities/places matching the query.
 * Returns an array of city objects with bbox for Overpass queries.
 */
export async function searchCities(query) {
  if (!query || query.trim().length < 2) return []

  const url =
    `${BASE}/search?q=${encodeURIComponent(query)}` +
    `&format=json&addressdetails=1&limit=10`

  const resp = await fetch(url, {
    headers: { 'Accept-Language': 'es,en' },
  })

  if (!resp.ok) throw new Error('Error al buscar ciudades')

  const data = await resp.json()

  return data
    .filter((r) =>
      ['city', 'town', 'municipality', 'administrative', 'village', 'hamlet'].includes(r.type) ||
      r.class === 'boundary' ||
      (r.class === 'place' && ['city', 'town', 'village'].includes(r.type))
    )
    .slice(0, 6)
    .map((r) => {
      const lat = parseFloat(r.lat)
      const lng = parseFloat(r.lon)
      // boundingbox from Nominatim is [south, north, west, east]
      const bb = r.boundingbox?.map(parseFloat) ?? [lat - 0.05, lat + 0.05, lng - 0.05, lng + 0.05]
      return {
        id: r.place_id,
        displayName: r.display_name,
        name:
          r.address?.city ||
          r.address?.town ||
          r.address?.municipality ||
          r.address?.village ||
          r.name,
        country: r.address?.country ?? '',
        countryCode: r.address?.country_code ?? '',
        lat,
        lng,
        bbox: bb, // [south, north, west, east]
      }
    })
}
