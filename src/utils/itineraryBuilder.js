/**
 * Builds an optimized itinerary from a list of places and a number of days.
 * Uses k-means++ clustering to group nearby places by day, then orders
 * each day's places using a nearest-neighbor heuristic.
 */

function haversine(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lng - a.lng) * Math.PI) / 180
  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa))
}

function kmeanspp(places, k, maxIter = 100) {
  if (places.length === 0) return []
  k = Math.min(k, places.length)

  // k-means++ initialisation
  const seed = places[Math.floor(Math.random() * places.length)]
  const centroids = [{ lat: seed.lat, lng: seed.lng }]

  while (centroids.length < k) {
    const dists = places.map((p) =>
      Math.min(...centroids.map((c) => haversine(p, c)))
    )
    const total = dists.reduce((s, d) => s + d * d, 0)
    let r = Math.random() * total
    for (let i = 0; i < places.length; i++) {
      r -= dists[i] * dists[i]
      if (r <= 0) {
        centroids.push({ lat: places[i].lat, lng: places[i].lng })
        break
      }
    }
    // guard: if loop exhausted without pushing, add last place
    if (centroids.length < k && centroids.length === k - 1) {
      centroids.push({ lat: places[places.length - 1].lat, lng: places[places.length - 1].lng })
    }
  }

  let assignments = new Array(places.length).fill(0)

  for (let iter = 0; iter < maxIter; iter++) {
    const next = places.map((p) => {
      let min = Infinity
      let idx = 0
      centroids.forEach((c, i) => {
        const d = haversine(p, c)
        if (d < min) {
          min = d
          idx = i
        }
      })
      return idx
    })

    if (next.every((a, i) => a === assignments[i])) break
    assignments = next

    // update centroids
    for (let i = 0; i < k; i++) {
      const grp = places.filter((_, j) => assignments[j] === i)
      if (grp.length > 0) {
        centroids[i] = {
          lat: grp.reduce((s, p) => s + p.lat, 0) / grp.length,
          lng: grp.reduce((s, p) => s + p.lng, 0) / grp.length,
        }
      }
    }
  }

  return assignments
}

function nearestNeighbor(places) {
  if (places.length <= 1) return [...places]
  const unvisited = [...places]
  const route = [unvisited.shift()]
  while (unvisited.length > 0) {
    const last = route[route.length - 1]
    let nearestIdx = 0
    let minDist = Infinity
    unvisited.forEach((p, i) => {
      const d = haversine(last, p)
      if (d < minDist) {
        minDist = d
        nearestIdx = i
      }
    })
    route.push(unvisited.splice(nearestIdx, 1)[0])
  }
  return route
}

/**
 * @param {object[]} places  - selected places with lat/lng
 * @param {number}   days    - desired number of days
 * @returns {{ day: number, places: object[] }[]}
 */
export function buildItinerary(places, days) {
  if (places.length === 0) return []

  const k = Math.min(days, places.length)
  const assignments = kmeanspp(places, k)

  const groups = Array.from({ length: k }, () => [])
  places.forEach((p, i) => groups[assignments[i]].push(p))

  return groups
    .map((g, i) => ({ day: i + 1, places: nearestNeighbor(g) }))
    .filter((d) => d.places.length > 0)
}
