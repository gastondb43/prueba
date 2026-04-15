const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

export const CATEGORIES = {
  museums:       { label: 'Museos',          emoji: '🏛️', color: '#8B5CF6' },
  monuments:     { label: 'Monumentos',      emoji: '🗿', color: '#F59E0B' },
  parks:         { label: 'Parques',         emoji: '🌳', color: '#10B981' },
  restaurants:   { label: 'Gastronomía',     emoji: '🍽️', color: '#EF4444' },
  entertainment: { label: 'Entretenimiento', emoji: '🎭', color: '#EC4899' },
  shopping:      { label: 'Compras',         emoji: '🛍️', color: '#3B82F6' },
  religious:     { label: 'Religioso',       emoji: '⛪', color: '#6B7280' },
}

function buildQuery(bbox, limit = 250) {
  // bbox: [south, north, west, east]
  const [s, n, w, e] = bbox
  const b = `${s},${w},${n},${e}`

  return `[out:json][timeout:30];
(
  node["tourism"~"museum|attraction|gallery|viewpoint|zoo|theme_park|aquarium|artwork"]["name"](${b});
  node["historic"~"monument|memorial|castle|ruins|archaeological_site|fort|building"]["name"](${b});
  node["leisure"~"park|garden|nature_reserve"]["name"](${b});
  node["amenity"~"restaurant|cafe"]["name"](${b});
  node["amenity"~"theatre|cinema"]["name"](${b});
  node["shop"~"mall|market|department_store"]["name"](${b});
  node["amenity"="place_of_worship"]["name"](${b});
);
out ${limit};`
}

function categorize(tags) {
  if (tags.tourism === 'museum') return 'museums'
  if (tags.tourism) return 'monuments'
  if (tags.historic) return 'monuments'
  if (tags.leisure === 'park' || tags.leisure === 'garden' || tags.leisure === 'nature_reserve') return 'parks'
  if (tags.amenity === 'restaurant' || tags.amenity === 'cafe') return 'restaurants'
  if (tags.amenity === 'theatre' || tags.amenity === 'cinema') return 'entertainment'
  if (tags.shop) return 'shopping'
  if (tags.amenity === 'place_of_worship') return 'religious'
  return 'monuments'
}

export async function fetchPOIs(bbox) {
  const query = buildQuery(bbox)

  const resp = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  })

  if (!resp.ok) throw new Error('Error al cargar los lugares')

  const data = await resp.json()

  // Deduplicate by name+coords to avoid near-duplicates
  const seen = new Set()

  return data.elements
    .filter((el) => el.tags?.name && el.lat != null && el.lon != null)
    .map((el) => {
      const category = categorize(el.tags)
      return {
        id: String(el.id),
        name: el.tags.name,
        lat: el.lat,
        lng: el.lon,
        category,
        emoji: CATEGORIES[category]?.emoji ?? '📍',
        address: [el.tags['addr:street'], el.tags['addr:housenumber']]
          .filter(Boolean)
          .join(' '),
        website: el.tags.website || el.tags['contact:website'] || null,
        phone: el.tags.phone || el.tags['contact:phone'] || null,
        hours: el.tags.opening_hours || null,
        cuisine: el.tags.cuisine || null,
        wikipedia: el.tags.wikipedia || null,
      }
    })
    .filter((p) => {
      const key = p.name.toLowerCase().trim()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}
