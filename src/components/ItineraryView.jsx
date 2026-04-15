import React, { useState } from 'react'
import {
  ArrowLeft,
  Share2,
  MapPin,
  Clock,
  Globe,
  Phone,
  Check,
  Map as MapIcon,
  List,
  Pencil,
  X,
} from 'lucide-react'
import { CATEGORIES } from '../utils/overpass'
import MapPanel from './MapPanel'

/* ─── Note editor ─────────────────────────────────────────────── */
function NoteEditor({ value, onSave, onCancel }) {
  const [draft, setDraft] = useState(value)
  return (
    <div className="mt-3">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Agregá un consejo, horario, precio de entrada…"
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none bg-yellow-50"
        rows={3}
        autoFocus
      />
      <div className="flex gap-2 mt-1.5">
        <button
          onClick={() => onSave(draft)}
          className="text-xs bg-teal-500 text-white px-3 py-1.5 rounded-lg hover:bg-teal-600 font-medium"
        >
          Guardar
        </button>
        <button
          onClick={onCancel}
          className="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

/* ─── Place item in itinerary ─────────────────────────────────── */
function PlaceItem({ place, index, note, onSaveNote }) {
  const [editing, setEditing] = useState(false)
  const catMeta = CATEGORIES[place.category] ?? { label: place.category }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="flex items-start gap-4 p-4">
        {/* Step number */}
        <div className="flex-shrink-0 w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow">
          {index}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 flex items-center gap-1.5 flex-wrap">
                <span>{place.emoji}</span>
                <span className="truncate">{place.name}</span>
              </h3>
              <span className="text-xs text-gray-500 font-medium">{catMeta.label}</span>
            </div>
          </div>

          {/* Details row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
            {place.address && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {place.address}
              </span>
            )}
            {place.hours && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {place.hours.slice(0, 45)}
              </span>
            )}
            {place.cuisine && (
              <span className="text-orange-500 font-medium">🍴 {place.cuisine}</span>
            )}
            {place.phone && (
              <a href={`tel:${place.phone}`} className="flex items-center gap-1 hover:text-teal-600">
                <Phone className="w-3 h-3" />
                {place.phone}
              </a>
            )}
            {place.website && (
              <a
                href={place.website.startsWith('http') ? place.website : `https://${place.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-teal-600 hover:text-teal-700 font-medium"
              >
                <Globe className="w-3 h-3" />
                Web
              </a>
            )}
          </div>

          {/* Note */}
          {editing ? (
            <NoteEditor
              value={note}
              onSave={(val) => { onSaveNote(place.id, val); setEditing(false) }}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <div className="mt-2">
              {note && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm text-gray-700 mb-1.5">
                  {note}
                </div>
              )}
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                <Pencil className="w-3 h-3" />
                {note ? 'Editar nota' : 'Agregar nota'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── ItineraryView ───────────────────────────────────────────── */
export default function ItineraryView({ city, itinerary, notes, onSaveNote, onBack }) {
  const [activeDay, setActiveDay] = useState(0)
  const [showMap, setShowMap] = useState(false)
  const [shareState, setShareState] = useState('idle') // 'idle' | 'copied' | 'shared'

  const totalPlaces = itinerary.reduce((s, d) => s + d.places.length, 0)
  const currentDay = itinerary[activeDay] ?? { day: 1, places: [] }

  const handleShare = async () => {
    const text = `Mi itinerario de ${itinerary.length} días en ${city?.name} — creado con TripFlow 🗺️`
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url: window.location.href })
        setShareState('shared')
        setTimeout(() => setShareState('idle'), 2500)
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(window.location.href).catch(() => {})
      setShareState('copied')
      setTimeout(() => setShareState('idle'), 2500)
    }
  }

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
          <h1 className="font-bold text-gray-900 truncate">
            Itinerario — {city?.name}
          </h1>
          <p className="text-xs text-gray-400">
            {itinerary.length} {itinerary.length === 1 ? 'día' : 'días'} · {totalPlaces} lugares
          </p>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setShowMap((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showMap
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showMap ? <List className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
            <span className="hidden sm:inline">{showMap ? 'Lista' : 'Mapa'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors"
          >
            {shareState !== 'idle' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {shareState === 'copied' ? 'Copiado!' : shareState === 'shared' ? 'Compartido!' : 'Compartir'}
            </span>
          </button>
        </div>
      </header>

      {/* ── Day tabs ── */}
      <div className="bg-white border-b px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0 no-scrollbar">
        {itinerary.map((day, i) => (
          <button
            key={i}
            onClick={() => { setActiveDay(i); setShowMap(false) }}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeDay === i
                ? 'bg-teal-500 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Día {day.day}
            <span className="ml-1.5 text-xs opacity-70">({day.places.length})</span>
          </button>
        ))}
      </div>

      {/* ── Day summary ── */}
      {!showMap && (
        <div className="bg-teal-50 border-b border-teal-100 px-4 py-2 flex-shrink-0">
          <p className="text-sm text-teal-700">
            <span className="font-semibold">Día {currentDay.day}</span>
            {' · '}
            {currentDay.places.length} paradas
            {currentDay.places.length > 1 && ' · ruta optimizada por proximidad'}
          </p>
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex-1 overflow-hidden">
        {showMap ? (
          <MapPanel
            places={currentDay.places}
            selectedIds={new Set(currentDay.places.map((p) => p.id))}
            showRoute
            center={[city?.lat, city?.lng]}
          />
        ) : (
          <div className="h-full overflow-y-auto places-scroll px-4 py-4">
            <div className="max-w-2xl mx-auto space-y-3">
              {currentDay.places.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p>No hay lugares en este día</p>
                </div>
              ) : (
                currentDay.places.map((place, idx) => (
                  <PlaceItem
                    key={place.id}
                    place={place}
                    index={idx + 1}
                    note={notes[place.id] ?? ''}
                    onSaveNote={onSaveNote}
                  />
                ))
              )}

              {/* Day map CTA */}
              <button
                onClick={() => setShowMap(true)}
                className="w-full mt-2 py-3 border-2 border-dashed border-teal-200 rounded-xl text-teal-600 text-sm font-medium hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
              >
                <MapIcon className="w-4 h-4" />
                Ver Día {currentDay.day} en el mapa
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
