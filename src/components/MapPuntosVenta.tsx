import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Phone, Clock, Maximize2 } from "lucide-react";

interface PuntoDeVenta {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  horario: string;
  especialidad: string;
  rating: number;
  color: string;
  zona: string;
}

const puntosDeVenta: PuntoDeVenta[] = [
  {
    id: 1,
    nombre: "Autopartes Central - Chapinero",
    direccion: "Calle 63 #11-45, Chapinero, Bogotá",
    telefono: "+57 1 234-5678",
    horario: "Lun-Vie: 8:00-18:00, Sáb: 8:00-16:00",
    especialidad: "Repuestos originales y de colisión",
    rating: 4.8,
    color: "blue",
    zona: "Norte"
  },
  {
    id: 2,
    nombre: "Repuestos Norte - Suba",
    direccion: "Av. Suba #104-23, Suba, Bogotá",
    telefono: "+57 1 234-5679",
    horario: "Lun-Sáb: 7:30-19:00, Dom: 9:00-15:00",
    especialidad: "Accesorios, llantas y lubricantes",
    rating: 4.6,
    color: "green",
    zona: "Norte"
  },
  {
    id: 3,
    nombre: "Autopartes Sur - Kennedy",
    direccion: "Av. 1ro de Mayo #68-45, Kennedy, Bogotá",
    telefono: "+57 1 234-5680",
    horario: "Lun-Dom: 8:00-20:00",
    especialidad: "Servicio técnico y mecánica",
    rating: 4.9,
    color: "purple",
    zona: "Sur"
  },
];

interface PuntoDeVentaConCoord extends PuntoDeVenta {
  position?: [number, number];
}

// Icono personalizado para los marcadores
const customMarker = (color: string) =>
  new L.DivIcon({
    className: "custom-marker",
    html: `<div style="background:${color};border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.15)"><svg width='20' height='20' fill='white' viewBox='0 0 24 24'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

const colorMap: Record<string, string> = {
  blue: "#3b82f6",
  green: "#22c55e",
  purple: "#a855f7",
  indigo: "#6366f1"
};

function simplifyAddress(address: string): string {
  // Quita el número y deja solo la avenida y barrio
  // Ejemplo: "Av. 1ro de Mayo #68-45, Kennedy, Bogotá" => "Av. 1ro de Mayo, Kennedy, Bogotá"
  return address.replace(/#\d+-?\d*,?/, '').replace(/\s+,/g, ',').trim();
}

function extractBarrio(address: string): string {
  // Extrae el barrio si está después de una coma y antes de Bogotá
  // Ejemplo: "Av. 1ro de Mayo #68-45, Kennedy, Bogotá" => "Kennedy"
  const match = address.match(/,\s*([^,]+),\s*Bogot[aá]/i);
  return match ? match[1].trim() : '';
}

function useGeocodedStores(stores: PuntoDeVenta[]) {
  const [storesWithCoords, setStoresWithCoords] = useState<PuntoDeVentaConCoord[]>([]);
  useEffect(() => {
    let cancelled = false;
    async function geocodeAll() {
      const results: PuntoDeVentaConCoord[] = [];
      for (const store of stores) {
        let found = false;
        let position: [number, number] | undefined = undefined;
        // 1. Prueba con la dirección completa
        let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(store.direccion + ', Bogotá, Colombia')}`;
        try {
          let res = await fetch(url, { headers: { 'Accept-Language': 'es' } });
          let data = await res.json();
          if (data && data.length > 0) {
            position = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            found = true;
          }
        } catch {}
        // 2. Si no encontró, prueba con dirección simplificada
        if (!found) {
          const simple = simplifyAddress(store.direccion);
          url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(simple + ', Bogotá, Colombia')}`;
          try {
            let res = await fetch(url, { headers: { 'Accept-Language': 'es' } });
            let data = await res.json();
            if (data && data.length > 0) {
              position = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
              found = true;
            }
          } catch {}
        }
        // 3. Si aún no encontró, prueba solo con el barrio y la ciudad
        if (!found) {
          const barrio = extractBarrio(store.direccion);
          if (barrio) {
            url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(barrio + ', Bogotá, Colombia')}`;
            try {
              let res = await fetch(url, { headers: { 'Accept-Language': 'es' } });
              let data = await res.json();
              if (data && data.length > 0) {
                position = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                found = true;
              }
            } catch {}
          }
        }
        if (found && position) {
          results.push({ ...store, position });
        } else {
          results.push({ ...store }); // Sin coordenadas
        }
        // Espera breve para evitar rate limit
        await new Promise(r => setTimeout(r, 800));
      }
      if (!cancelled) setStoresWithCoords(results);
    }
    geocodeAll();
    return () => { cancelled = true; };
  }, [stores]);
  return storesWithCoords;
}

function ChangeMapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function MapPuntosVenta() {
  const storesWithCoords = useGeocodedStores(puntosDeVenta);
  const [selectedStore, setSelectedStore] = useState<PuntoDeVentaConCoord | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Centro inicial: Bogotá
  const [mapCenter, setMapCenter] = useState<[number, number]>([4.6486, -74.0653]);

  useEffect(() => {
    if (selectedStore?.position) {
      setMapCenter(selectedStore.position);
    }
  }, [selectedStore]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="w-full max-w-7xl mx-auto my-6 bg-white rounded-2xl shadow-xl overflow-hidden border border-indigo-200">
      {/* Header con gradiente colorido */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-5 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-1">Nuestros Puntos de Venta</h2>
                <p className="text-indigo-200 text-sm">📍 Bogotá, Colombia - Encuentra tu sucursal más cercana</p>
              </div>
            </div>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/25 transition-all duration-300 backdrop-blur-sm border border-white/20"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <div className={`grid transition-all duration-500 ${isFullscreen ? 'grid-cols-1' : 'lg:grid-cols-3'} gap-4`}>
        {/* Lista de tiendas */}
        <div className={`bg-gradient-to-b from-slate-50 to-indigo-50 px-4 py-4 sm:p-6 overflow-y-auto transition-all duration-500 ${
          isFullscreen ? 'hidden' : 'lg:col-span-1 max-h-[60vh] sm:max-h-[700px]'
        }`}>
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Navigation className="w-4 h-4 text-white" />
            </div>
            Ubicaciones en Bogotá
          </h3>
          <div className="space-y-4">
            {storesWithCoords.map((store) => (
              <div
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border hover:shadow-lg ${
                  selectedStore?.id === store.id
                    ? 'bg-white border-indigo-300 shadow-md ring-2 ring-indigo-200'
                    : 'bg-white border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full`} style={{ background: colorMap[store.color] || colorMap.indigo }}></div>
                    <h4 className="font-medium text-gray-800">{store.nombre}</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(store.rating)}
                    <span className="text-sm text-gray-600 ml-1 font-medium">{store.rating}</span>
                  </div>
                </div>
                <p className="text-gray-500 mb-3 flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {store.direccion}
                </p>
                <div className="mb-3">
                  <div className={`inline-block px-3 py-1 rounded-lg text-white text-xs font-medium`} style={{ background: colorMap[store.color] || colorMap.indigo }}>
                    {store.especialidad}
                  </div>
                  <span className={`ml-2 px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700`}>
                    Zona {store.zona}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className={`w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center`}>
                      <Phone className={`w-3 h-3 text-blue-500`} />
                    </div>
                    <span className="font-medium">{store.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className={`w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center`}>
                      <Clock className={`w-3 h-3 text-green-500`} />
                    </div>
                    <span>{store.horario}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 font-mono">
                    {store.position ? (
                      <>📍 GPS: {store.position[0].toFixed(4)}, {store.position[1].toFixed(4)}</>
                    ) : (
                      <>📍 Sin coordenadas</>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Mapa real con React Leaflet */}
        <div className={`relative transition-all duration-500 ${
          isFullscreen ? 'col-span-1 h-[85vh]' : 'lg:col-span-2 h-[420px] sm:h-[520px] lg:h-[700px]'
        }`}>
          <MapContainer
            center={mapCenter}
            zoom={12}
            scrollWheelZoom={false}
            className="w-full h-full rounded-none z-10"
            style={{ height: "100%", width: "100%" }}
          >
            <ChangeMapCenter center={mapCenter} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {storesWithCoords.map((store) =>
              store.position ? (
                <Marker
                  key={store.id}
                  position={store.position}
                  icon={customMarker(colorMap[store.color] || colorMap.indigo)}
                  eventHandlers={{
                    click: () => setSelectedStore(store)
                  }}
                >
                  <Popup>
                    <div className="text-center">
                      <div className="font-bold text-lg mb-1">{store.nombre}</div>
                      <div className="text-gray-600 mb-1 text-sm">{store.direccion}</div>
                      <div className="mb-2">
                        <span className="inline-block px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium mr-2">{store.especialidad}</span>
                        <span className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium">Zona {store.zona}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {renderStars(store.rating)}
                        <span className="text-gray-600 ml-1 font-medium text-sm">{store.rating}</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center text-sm text-gray-600 mb-1">
                        <Phone className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{store.telefono}</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-green-500" />
                        <span>{store.horario}</span>
                      </div>
                      <div className="text-xs text-gray-400 font-mono mt-2 pt-2 border-t border-gray-100">
                        📍 {store.position[0].toFixed(4)}, {store.position[1].toFixed(4)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            )}
          </MapContainer>
          {/* Panel de información del mapa */}
          <div className="hidden sm:block absolute top-4 right-4 z-40">
            <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-indigo-200">
              <div className="text-center">
                <h4 className="font-medium text-gray-800 mb-1">🛰️ Vista Satelital</h4>
                <p className="text-gray-500 text-xs mb-2">Bogotá D.C., Colombia</p>
                <p className="text-gray-700 font-medium text-xs">
                  {selectedStore ? (
                    `📍 ${selectedStore.nombre}`
                  ) : (
                    'Selecciona una ubicación'
                  )}
                </p>
                <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400">
                  <p>Zoom: 12 | GPS</p>
                </div>
              </div>
            </div>
          </div>
          {/* Versión compacta del panel para pantallas pequeñas */}
          <div className="sm:hidden absolute top-4 left-1/2 transform -translate-x-1/2 z-40 w-[92%]">
            <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-indigo-100 text-center text-xs">
              <div className="font-medium text-gray-800 truncate">{selectedStore ? `📍 ${selectedStore.nombre}` : 'Selecciona una ubicación'}</div>
              <div className="text-gray-500 text-[11px] mt-1">Bogotá D.C., Colombia • Zoom: 12</div>
            </div>
          </div>
          {/* Indicador GPS */}
          <div className="hidden sm:block absolute bottom-4 left-4 z-40">
            <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-xs text-gray-600 border border-green-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">GPS Activo</span>
              </div>
            </div>
          </div>
          <div className="sm:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40">
            <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow text-[12px] text-gray-700 border border-green-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">GPS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer colorido */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-4 py-6 sm:p-8 border-t border-indigo-200">
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center group">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-medium text-gray-800 mb-1">3 Sucursales</h4>
            <p className="text-gray-500 text-sm">Bogotá D.C.</p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:from-green-600 group-hover:to-emerald-600 transition-all duration-300">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Horarios Amplios</h4>
            <p className="text-gray-500 text-sm">7 días a la semana</p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Atención Directa</h4>
            <p className="text-gray-500 text-sm">Llamadas y WhatsApp</p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:from-yellow-600 group-hover:to-orange-600 transition-all duration-300 text-white text-xl">
              ⭐
            </div>
            <h4 className="font-medium text-gray-800 mb-1">4.8/5 Rating</h4>
            <p className="text-gray-500 text-sm">Clientes satisfechos</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-indigo-200 text-center">
          <p className="text-gray-500 text-sm">
            <span className="font-medium">🏙️ Bogotá D.C.</span> | 
            <span className="ml-2">📍 Coordenadas: 4.6486° N, 74.0653° W</span> | 
            <span className="ml-2">🌄 Altitud: 2,640 msnm</span>
          </p>
        </div>
      </div>
    </div>
  );
}
