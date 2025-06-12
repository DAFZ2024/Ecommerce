import React, { useState, useRef, useEffect } from "react";
import { MapPin, Navigation, Phone, Clock, Maximize2 } from "lucide-react";

// Datos reales de puntos de venta en Bogotá con colores más vibrantes
const puntosDeVenta = [
  {
    id: 1,
    nombre: "Autopartes Central - Chapinero",
    direccion: "Calle 63 #11-45, Chapinero, Bogotá",
    telefono: "+57 1 234-5678",
    horario: "Lun-Vie: 8:00-18:00, Sáb: 8:00-16:00",
    position: [4.6486, -74.0653], // Zona Chapinero
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
    position: [4.7569, -74.0830], // Zona Suba
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
    position: [4.6097, -74.1378], // Zona Kennedy
    especialidad: "Servicio técnico y mecánica",
    rating: 4.9,
    color: "purple",
    zona: "Sur"
  },
];

// Componente simulado del mapa
const MapContainer = ({ children, center, zoom, className, scrollWheelZoom }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Aquí iría la inicialización de Leaflet
    // L.map(mapRef.current).setView(center, zoom);
  }, [center, zoom]);

  return (
    <div ref={mapRef} className={className}>
      {/* Vista satelital simulada de Bogotá con colores más vibrantes */}
      <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-emerald-800 via-teal-700 to-cyan-600">
        {/* Simulación de vista satelital */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.25) 0%, transparent 50%),
            radial-gradient(circle at 60% 20%, rgba(168, 85, 247, 0.2) 0%, transparent 50%),
            linear-gradient(45deg, rgba(6, 78, 59, 0.8), rgba(21, 94, 117, 0.6))
          `
        }}>
          {/* Simulación de calles principales */}
          <div className="absolute top-1/3 left-0 right-0 h-1 bg-yellow-400 opacity-60 transform rotate-12 shadow-sm"></div>
          <div className="absolute top-2/3 left-0 right-0 h-1 bg-orange-400 opacity-60 transform -rotate-6 shadow-sm"></div>
          <div className="absolute top-0 bottom-0 left-1/4 w-1 bg-red-400 opacity-60 transform rotate-3 shadow-sm"></div>
          <div className="absolute top-0 bottom-0 right-1/3 w-1 bg-pink-400 opacity-60 transform -rotate-2 shadow-sm"></div>
          
          {/* Simulación de edificaciones */}
          <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-indigo-500 opacity-40 rounded shadow-lg"></div>
          <div className="absolute top-3/4 right-1/4 w-6 h-6 bg-purple-500 opacity-45 rounded shadow-lg"></div>
          <div className="absolute bottom-1/4 left-3/4 w-10 h-4 bg-blue-500 opacity-35 rounded shadow-lg"></div>
          
          {/* Simulación de parques/zonas verdes */}
          <div className="absolute top-1/2 left-1/2 w-16 h-12 bg-green-500 opacity-30 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg"></div>
          <div className="absolute top-1/4 right-1/4 w-12 h-8 bg-emerald-500 opacity-35 rounded-full shadow-lg"></div>
        </div>
        
        {children}
      </div>
    </div>
  );
};

const TileLayer = ({ attribution, url }) => {
  return null;
};

const Marker = ({ position, icon, children, eventHandlers, color }) => {
  const [lat, lng] = position;
  
  const getScreenPosition = (lat, lng) => {
    const minLat = 4.55, maxLat = 4.80;
    const minLng = -74.20, maxLng = -74.00;
    
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    
    return [Math.max(5, Math.min(95, y)), Math.max(5, Math.min(95, x))];
  };
  
  const [top, left] = getScreenPosition(lat, lng);
  
  const getMarkerColor = (color) => {
    switch(color) {
      case 'blue': return 'bg-blue-500 hover:bg-blue-600 border-blue-300';
      case 'green': return 'bg-green-500 hover:bg-green-600 border-green-300';
      case 'purple': return 'bg-purple-500 hover:bg-purple-600 border-purple-300';
      default: return 'bg-indigo-500 hover:bg-indigo-600 border-indigo-300';
    }
  };
  
  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110 z-20"
      style={{ top: `${top}%`, left: `${left}%` }}
      onClick={eventHandlers?.click}
    >
      <div className="relative">
        <div className="relative">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg border-2 border-white transition-colors ${getMarkerColor(color)}`}>
            <MapPin className="w-5 h-5" />
          </div>
          <div className={`absolute inset-0 w-10 h-10 border-2 rounded-full animate-ping opacity-30 ${
            color === 'blue' ? 'border-blue-400' :
            color === 'green' ? 'border-green-400' :
            color === 'purple' ? 'border-purple-400' : 'border-indigo-400'
          }`}></div>
        </div>
      </div>
      {children}
    </div>
  );
};

const Popup = ({ children }) => {
  return (
    <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 bg-white/98 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-indigo-200 min-w-72 z-30 animate-fadeIn">
      {children}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent border-t-white/98"></div>
    </div>
  );
};

export default function MapPuntosVenta() {
  const [selectedStore, setSelectedStore] = useState(null);
  const [mapCenter, setMapCenter] = useState([4.6486, -74.0653]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleStoreClick = (store) => {
    setSelectedStore(selectedStore?.id === store.id ? null : store);
    setMapCenter(store.position);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const getStoreColors = (color) => {
    switch(color) {
      case 'blue':
        return {
          dot: 'bg-blue-400',
          badge: 'bg-blue-500',
          zone: 'bg-blue-100 text-blue-700',
          icon: 'bg-blue-100',
          iconText: 'text-blue-500'
        };
      case 'green':
        return {
          dot: 'bg-green-400',
          badge: 'bg-green-500',
          zone: 'bg-green-100 text-green-700',
          icon: 'bg-green-100',
          iconText: 'text-green-500'
        };
      case 'purple':
        return {
          dot: 'bg-purple-400',
          badge: 'bg-purple-500',
          zone: 'bg-purple-100 text-purple-700',
          icon: 'bg-purple-100',
          iconText: 'text-purple-500'
        };
      default:
        return {
          dot: 'bg-indigo-400',
          badge: 'bg-indigo-500',
          zone: 'bg-indigo-100 text-indigo-700',
          icon: 'bg-indigo-100',
          iconText: 'text-indigo-500'
        };
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto my-6 bg-white rounded-2xl shadow-xl overflow-hidden border border-indigo-200">
      {/* Header con gradiente colorido */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-1">Nuestros Puntos de Venta</h2>
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

      <div className={`grid transition-all duration-500 ${isFullscreen ? 'grid-cols-1' : 'lg:grid-cols-3'} gap-0`}>
        {/* Lista de tiendas con colores vibrantes */}
        <div className={`bg-gradient-to-b from-slate-50 to-indigo-50 p-6 overflow-y-auto transition-all duration-500 ${
          isFullscreen ? 'hidden' : 'lg:col-span-1 max-h-[700px]'
        }`}>
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Navigation className="w-4 h-4 text-white" />
            </div>
            Ubicaciones en Bogotá
          </h3>
          
          <div className="space-y-4">
            {puntosDeVenta.map((store) => {
              const colors = getStoreColors(store.color);
              return (
                <div
                  key={store.id}
                  onClick={() => handleStoreClick(store)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border hover:shadow-lg ${
                    selectedStore?.id === store.id
                      ? 'bg-white border-indigo-300 shadow-md ring-2 ring-indigo-200'
                      : 'bg-white border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${colors.dot}`}></div>
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
                    <div className={`inline-block px-3 py-1 rounded-lg text-white text-xs font-medium ${colors.badge}`}>
                      {store.especialidad}
                    </div>
                    <span className={`ml-2 px-2 py-1 rounded-md text-xs font-medium ${colors.zone}`}>
                      Zona {store.zona}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className={`w-6 h-6 ${colors.icon} rounded-lg flex items-center justify-center`}>
                        <Phone className={`w-3 h-3 ${colors.iconText}`} />
                      </div>
                      <span className="font-medium">{store.telefono}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className={`w-6 h-6 ${colors.icon} rounded-lg flex items-center justify-center`}>
                        <Clock className={`w-3 h-3 ${colors.iconText}`} />
                      </div>
                      <span>{store.horario}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-mono">
                      📍 GPS: {store.position[0].toFixed(4)}, {store.position[1].toFixed(4)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mapa */}
        <div className={`relative transition-all duration-500 ${
          isFullscreen ? 'col-span-1 h-[85vh]' : 'lg:col-span-2 h-[700px]'
        }`}>
          <MapContainer
            center={mapCenter}
            zoom={12}
            scrollWheelZoom={false}
            className="w-full h-full rounded-none"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            
            {puntosDeVenta.map((store) => (
              <Marker
                key={store.id}
                position={store.position}
                color={store.color}
                eventHandlers={{
                  click: () => handleStoreClick(store)
                }}
              >
                {selectedStore?.id === store.id && (
                  <Popup>
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-medium mx-auto mb-3 shadow-lg ${
                        getStoreColors(store.color).badge
                      }`}>
                        {store.id}
                      </div>
                      <h5 className="font-medium text-gray-800 mb-2">{store.nombre}</h5>
                      <p className="text-gray-600 mb-3 text-sm">{store.direccion}</p>
                      <div className={`inline-block px-3 py-1 rounded-lg text-white text-xs font-medium mb-3 ${
                        getStoreColors(store.color).badge
                      }`}>
                        {store.especialidad}
                      </div>
                      <div className="flex items-center justify-center gap-1 mb-3">
                        {renderStars(store.rating)}
                        <span className="text-gray-600 ml-1 font-medium text-sm">{store.rating}</span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2 justify-center">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{store.telefono}</span>
                        </div>
                        <div className="flex items-center gap-2 justify-center">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{store.horario}</span>
                        </div>
                        <div className="text-xs text-gray-400 font-mono mt-2 pt-2 border-t border-gray-100">
                          📍 {store.position[0].toFixed(4)}, {store.position[1].toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </Popup>
                )}
              </Marker>
            ))}
          </MapContainer>

          {/* Panel de información del mapa */}
          <div className="absolute top-4 right-4 z-40">
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

          {/* Indicador GPS */}
          <div className="absolute bottom-4 left-4 z-40">
            <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-xs text-gray-600 border border-green-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">GPS Activo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer colorido */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-8 border-t border-indigo-200">
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
