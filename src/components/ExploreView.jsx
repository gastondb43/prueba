import React, { useState, useMemo, useCallback } from 'react'
import { ArrowLeft, CheckCircle2, Circle, List, Map as MapIcon, Loader2, X } from 'lucide-react'
import { CATEGORIES } from '../utils/overpass'
import MapPanel from './MapPanel'

/* ─── Place Card ─────────────────────────────────────────────── */
function PlaceCard({ place, selected, onToggle }) {
  const catMeta = CATEGORIES[place.category] ?? { label: place.category, emoji: '📍' }
  return (
    <div
      onClick={onToggle}
      className={`relative bg-white rounded-xl p-4 cursor-pointer border-2 transition-all hover:shadow-md select-none ${
        selected
          ? 'border-teal-500 bg-teal-50 shadow'
          : 'border-transparent shadow-sm hover:border-gray-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl leading-none mt-0.5 flex-shrink-0">{place.emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-snug truncate">{place.name}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: selected ? '#ccfbf1' : '#f3f4f6',
                color: selected ? '#0f766e' : '#4b5563',
              }}
            >
              {catMeta.label}
            </span>
          </div>
          {place.address && (
            <p className="text-xs text-gray-400 mt-1 truncate">{place.address}</p>
          )}
          {place.hours && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">🕐 {place.hours.slice(0, 35)}</p>
          )}
        </div>
        <div className="flex-shrink-0 mt-0.5">
          {selected ? (
            <CheckCircle2 className="w-5 h-5 text-teal-500" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300" />
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── ExploreView ────────────────────────────────────────────── */
export default function ExploreView({
  city,
  places,
  loading,
  error,
  selectedIds,
  days,
  onTogglePlace,
  onClearSelection,
  onDaysChange,
  onGenerateItinerary,
  onBack,
}) {
  const [activeCategory, setActiveCategory] = useState(null)
  const [tab, setTab] = useState('list') // 'list' | 'map'
  const [search, setSearch] = useState('')

  const categories = useMemo(() => {
    const counts = {}
    places.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1 })
    return Object.entries(CATEGORIES)
      .filter(([key]) => counts[key] > 0)
      .map(([key, meta]) => ({ key, ...meta, count: counts[key] || 0 }))
  }, [places])

  const visible = useMemo(() => {
    let list = activeCategory ? places.filter((p) => p.category === activeCategory) : places
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q))
    }
    return list
  }, [places, activeCategory, search])

  const selectAll = useCallback(() => {
    visible.forEach((p) => {
      if (!selectedIds.has(p.id)) onTogglePlace(p.id)
    })
  }, [visible, selectedIds, onTogglePlace])

  const selectedCount = selectedIds.size
  const canGenerate = selectedCount > 0

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Volver"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">📍</span>
            <h1 className="font-bold text-gray-900 truncate">{city?.name}</h1>
            <span className="text-gray-400 text-sm hidden sm:inline">{city?.country}</span>
          </div>
          {!loading && (
            <p className="text-xs text-gray-400 ml-8">
              {places.length} lugares encontrados
            </p>
          )}
        </div>

        {/* Tab toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 flex-shrink-0">
          <button
            onClick={() => setTab('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lista</span>
          </button>
          <button
            onClick={() => setTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === 'map' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mapa</span>
          </button>
        </div>
      </header>

      {/* ── Category pills ── */}
      {!loading && places.length > 0 && (
        <div className="bg-white border-b px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0 no-scrollbar">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeCategory === null
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({places.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === cat.key
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
              <span className="opacity-70">({cat.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
            <div className="text-center">
              <p className="font-semibold text-gray-700">Cargando lugares de {city?.name}…</p>
              <p className="text-sm text-gray-400 mt-1">Esto puede tardar hasta 30 segundos</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
            <span className="text-5xl">😞</span>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={onBack}
              className="text-teal-600 font-semibold hover:underline"
            >
              ← Volver a buscar
            </button>
          </div>
        ) : tab === 'map' ? (
          <MapPanel
            places={visible}
            selectedIds={selectedIds}
            onTogglePlace={onTogglePlace}
            center={[city?.lat, city?.lng]}
          />
        ) : (
          <div className="h-full flex flex-col">
            {/* Inline search */}
            <div className="px-4 py-2 bg-white border-b flex-shrink-0">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar entre los lugares…"
                  className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 pr-8"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Select all / count for visible */}
            {visible.length > 0 && (
              <div className="px-4 py-1.5 bg-gray-50 border-b flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-gray-500">{visible.length} lugares</span>
                <button
                  onClick={selectAll}
                  className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                >
                  Seleccionar todos
                </button>
              </div>
            )}

            {/* Grid */}
            <div className="flex-1 overflow-y-auto places-scroll px-4 py-3">
              {visible.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-4xl mb-3">🔍</p>
                  <p>No se encontraron lugares</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {visible.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      selected={selectedIds.has(place.id)}
                      onToggle={() => onTogglePlace(place.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom action bar ── */}
      <div className="bg-white border-t px-4 py-3 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 font-medium">
              {selectedCount > 0 ? (
                <>
                  <span className="text-teal-600 font-bold">{selectedCount}</span> lugares seleccionados
                </>
              ) : (
                <span className="text-gray-400">Seleccioná lugares para visitar</span>
              )}
            </span>
            {selectedCount > 0 && (
              <button
                onClick={onClearSelection}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-medium"
              >
                <X className="w-3 h-3" />
                Limpiar
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 hidden sm:inline">Días:</label>
              <select
                value={days}
                onChange={(e) => onDaysChange(Number(e.target.value))}
                className="border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 10, 14].map((d) => (
                  <option key={d} value={d}>
                    {d} {d === 1 ? 'día' : 'días'}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onGenerateItinerary}
              disabled={!canGenerate}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                canGenerate
                  ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-md hover:shadow-lg active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Generar itinerario →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
