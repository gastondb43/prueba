import React, { useState, useCallback, useRef } from 'react'
import { searchCities } from '../utils/nominatim'
import { MapPin, Search, Plane, Map, Calendar, Sparkles } from 'lucide-react'

export default function LandingView({ onCitySelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  const handleInput = useCallback(async (e) => {
    const val = e.target.value
    setQuery(val)
    setError(null)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (val.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const cities = await searchCities(val)
        setResults(cities)
        setOpen(cities.length > 0)
        if (cities.length === 0) setError('No se encontró ninguna ciudad. Probá con otro nombre.')
      } catch {
        setError('Error al buscar. Verificá tu conexión.')
      } finally {
        setLoading(false)
      }
    }, 450)
  }, [])

  const handleSelect = useCallback(
    (city) => {
      setQuery(city.name)
      setOpen(false)
      onCitySelect(city)
    },
    [onCitySelect]
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-500 flex flex-col">
      {/* Nav */}
      <header className="px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="bg-white rounded-xl p-2 shadow">
            <Plane className="w-6 h-6 text-teal-600" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">TripFlow</span>
          <span className="text-teal-200 text-sm hidden sm:inline">— 100% gratuito</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-teal-100 text-sm px-4 py-2 rounded-full mb-6 border border-white/20">
          <Sparkles className="w-4 h-4" />
          Itinerarios optimizados por proximidad
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold text-white mb-5 leading-tight max-w-2xl">
          Tu viaje perfecto,<br />
          <span className="text-teal-200">gratis y en minutos</span>
        </h1>

        <p className="text-teal-100 text-lg sm:text-xl mb-10 max-w-lg leading-relaxed">
          Elegí una ciudad, seleccioná los lugares que querés visitar
          y generamos el recorrido día por día optimizado.
        </p>

        {/* Search */}
        <div className="relative w-full max-w-xl">
          <div className="flex items-center bg-white rounded-2xl shadow-2xl ring-4 ring-white/20">
            <div className="pl-5">
              <MapPin className="w-5 h-5 text-teal-500" />
            </div>
            <input
              type="text"
              value={query}
              onChange={handleInput}
              placeholder="¿A qué ciudad vas? (ej: Buenos Aires, Roma…)"
              className="flex-1 px-4 py-4 text-gray-800 text-base sm:text-lg focus:outline-none bg-transparent placeholder-gray-400"
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
            <div className="pr-5 text-teal-400">
              {loading ? (
                <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </div>
          </div>

          {/* Results dropdown */}
          {open && results.length > 0 && (
            <ul className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden text-left border border-gray-100">
              {results.map((city) => (
                <li
                  key={city.id}
                  onMouseDown={() => handleSelect(city)}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-teal-50 cursor-pointer border-b last:border-0 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{city.name}</div>
                    <div className="text-xs text-gray-400 truncate">{city.country}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {error && !open && (
            <p className="mt-2 text-sm text-red-200 bg-red-900/30 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-3xl w-full">
          {[
            {
              icon: MapPin,
              title: 'Lugares reales',
              desc: 'Datos de OpenStreetMap con museos, monumentos, parques, restaurantes y más',
            },
            {
              icon: Calendar,
              title: 'Por días',
              desc: 'Agrupamos los sitios por proximidad para que no pierdas tiempo en traslados',
            },
            {
              icon: Map,
              title: 'Mapa interactivo',
              desc: 'Visualizá el recorrido en el mapa y compartí el plan con un link',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-left"
            >
              <Icon className="w-7 h-7 text-teal-200 mb-3" />
              <h3 className="text-white font-semibold mb-1.5">{title}</h3>
              <p className="text-teal-100 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-teal-300 text-xs">
          Datos de{' '}
          <a
            href="https://www.openstreetmap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            OpenStreetMap
          </a>{' '}
          · Sin publicidad · Sin registro
        </p>
      </main>
    </div>
  )
}
