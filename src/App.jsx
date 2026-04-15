import React, { useState, useCallback, useEffect } from 'react'
import LandingView from './components/LandingView'
import ExploreView from './components/ExploreView'
import ItineraryView from './components/ItineraryView'
import { fetchPOIs } from './utils/overpass'
import { buildItinerary } from './utils/itineraryBuilder'

const NOTES_KEY = 'tripflow_notes'

export default function App() {
  const [view, setView] = useState('landing')
  const [city, setCity] = useState(null)
  const [allPlaces, setAllPlaces] = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [days, setDays] = useState(3)
  const [itinerary, setItinerary] = useState([])
  const [loadingPlaces, setLoadingPlaces] = useState(false)
  const [placesError, setPlacesError] = useState(null)
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(NOTES_KEY) ?? '{}')
    } catch {
      return {}
    }
  })

  const saveNote = useCallback((placeId, note) => {
    setNotes((prev) => {
      const next = { ...prev, [placeId]: note }
      try { localStorage.setItem(NOTES_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const handleCitySelect = useCallback(async (cityData) => {
    setCity(cityData)
    setAllPlaces([])
    setSelectedIds(new Set())
    setItinerary([])
    setPlacesError(null)
    setLoadingPlaces(true)
    setView('explore')

    try {
      const places = await fetchPOIs(cityData.bbox)
      setAllPlaces(places)
      if (places.length === 0) {
        setPlacesError(
          `No encontramos lugares registrados en "${cityData.name}". Probá con una ciudad más grande.`
        )
      }
    } catch (err) {
      console.error(err)
      setPlacesError('No se pudieron cargar los lugares. Verificá tu conexión e intentá de nuevo.')
    } finally {
      setLoadingPlaces(false)
    }
  }, [])

  const togglePlace = useCallback((placeId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(placeId)) next.delete(placeId)
      else next.add(placeId)
      return next
    })
  }, [])

  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])

  const handleGenerateItinerary = useCallback(() => {
    const selected = allPlaces.filter((p) => selectedIds.has(p.id))
    if (selected.length === 0) return
    const built = buildItinerary(selected, days)
    setItinerary(built)
    setView('itinerary')
  }, [allPlaces, selectedIds, days])

  const handleBack = useCallback(() => {
    if (view === 'itinerary') setView('explore')
    else if (view === 'explore') setView('landing')
  }, [view])

  if (view === 'landing') {
    return <LandingView onCitySelect={handleCitySelect} />
  }

  if (view === 'explore') {
    return (
      <ExploreView
        city={city}
        places={allPlaces}
        loading={loadingPlaces}
        error={placesError}
        selectedIds={selectedIds}
        days={days}
        onTogglePlace={togglePlace}
        onClearSelection={clearSelection}
        onDaysChange={setDays}
        onGenerateItinerary={handleGenerateItinerary}
        onBack={handleBack}
      />
    )
  }

  if (view === 'itinerary') {
    return (
      <ItineraryView
        city={city}
        itinerary={itinerary}
        notes={notes}
        onSaveNote={saveNote}
        onBack={handleBack}
      />
    )
  }

  return null
}
