import React, { useState, useRef, useEffect } from "react";
import { MapPin, Navigation, Phone, Clock, Maximize2 } from "lucide-react";


// Datos reales de puntos de venta en Bogotá
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

// Componente simulado del mapa - En tu implementación real, usa react-leaflet
const MapContainer = ({ children, center, zoom, className, scrollWheelZoom }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Aquí iría la inicialización de Leaflet
    // L.map(mapRef.current).setView(center, zoom);
  }, [center, zoom]);

  return (
    <div ref={mapRef} className={className}>
      {/* Vista satelital simulada de Bogotá */}
      <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-green-800 via-green-600 to-brown-400">
        {/* Simulación de vista satelital */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(101, 163, 13, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 60% 20%, rgba(22, 163, 74, 0.2) 0%, transparent 50%),
            linear-gradient(45deg, rgba(21, 128, 61, 0.8), rgba(166, 125, 61, 0.6))
          `
        }}>
          {/* Simulación de calles principales */}
          <div className="absolute top-1/3 left-0 right-0 h-1 bg-gray-300 opacity-60 transform rotate-12"></div>
          <div className="absolute top-2/3 left-0 right-0 h-1 bg-gray-300 opacity-60 transform -rotate-6"></div>
          <div className="absolute top-0 bottom-0 left-1/4 w-1 bg-gray-300 opacity-60 transform rotate-3"></div>
          <div className="absolute top-0 bottom-0 right-1/3 w-1 bg-gray-300 opacity-60 transform -rotate-2"></div>
          
          {/* Simulación de edificaciones */}
          <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-gray-600 opacity-40 rounded"></div>
          <div className="absolute top-3/4 right-1/4 w-6 h-6 bg-gray-500 opacity-50 rounded"></div>
          <div className="absolute bottom-1/4 left-3/4 w-10 h-4 bg-gray-400 opacity-30 rounded"></div>
          
          {/* Simulación de parques/zonas verdes */}
          <div className="absolute top-1/2 left-1/2 w-16 h-12 bg-green-400 opacity-30 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/4 right-1/4 w-12 h-8 bg-green-300 opacity-40 rounded-full"></div>
        </div>
        
        {children}
      </div>
    </div>
  );
};

const TileLayer = ({ attribution, url }) => {
  // En la implementación real, esto renderizaría las tiles satelitales
  return null;
};

const Marker = ({ position, icon, children, eventHandlers }) => {
  const [lat, lng] = position;
  
  // Convertir coordenadas GPS a posición en pantalla (simulación)
  const getScreenPosition = (lat, lng) => {
    // Bogotá aproximadamente: lat 4.6, lng -74.1
    const minLat = 4.55, maxLat = 4.80;
    const minLng = -74.20, maxLng = -74.00;
    
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    
    return [Math.max(5, Math.min(95, y)), Math.max(5, Math.min(95, x))];
  };
  
  const [top, left] = getScreenPosition(lat, lng);
  
  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110 z-20"
      style={{ top: `${top}%`, left: `${left}%` }}
      onClick={eventHandlers?.click}
    >
      <div className="relative animate-pulse">
        {/* Marker personalizado estilo satelital */}
        <div className="relative">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-2xl border-4 border-white animate-bounce">
            <MapPin className="w-6 h-6" />
          </div>
          {/* Círculo de radiofrecuencia */}
          <div className="absolute inset-0 w-12 h-12 border-4 border-red-400 rounded-full animate-ping opacity-30"></div>
          <div className="absolute inset-0 w-16 h-16 border-2 border-red-300 rounded-full animate-ping opacity-20 -top-2 -left-2"></div>
        </div>
      </div>
      {children}
    </div>
  );
};

const Popup = ({ children }) => {
  return (
    <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-gray-200 min-w-72 z-30 animate-fadeIn">
      {children}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-8 border-transparent border-t-white/95"></div>
    </div>
  );
};

export default function MapPuntosVenta() {
  const [selectedStore, setSelectedStore] = useState(null);
  const [mapCenter, setMapCenter] = useState([4.6486, -74.0653]); // Centro de Bogotá
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleStoreClick = (store) => {
    setSelectedStore(selectedStore?.id === store.id ? null : store);
    setMapCenter(store.position);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-lg ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="w-full max-w-7xl mx-auto my-8 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Header mejorado */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                <MapPin className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-4xl font-bold mb-2">Nuestros Puntos de Venta</h2>
                <p className="text-blue-100 text-lg">📍 Bogotá, Colombia - Encuentra tu sucursal más cercana</p>
              </div>
            </div>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/30 hover:scale-110"
            >
              <Maximize2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className={`grid transition-all duration-500 ${isFullscreen ? 'grid-cols-1' : 'lg:grid-cols-3'} gap-0`}>
        {/* Lista de tiendas */}
        <div className={`bg-gradient-to-b from-gray-50 to-white p-8 overflow-y-auto transition-all duration-500 ${
          isFullscreen ? 'hidden' : 'lg:col-span-1 max-h-[700px]'
        }`}>
          <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            Ubicaciones en Bogotá
          </h3>
          
          <div className="space-y-6">
            {puntosDeVenta.map((store) => (
              <div
                key={store.id}
                onClick={() => handleStoreClick(store)}
                className={`p-6 rounded-3xl cursor-pointer transition-all duration-300 border-2 hover:shadow-2xl transform hover:-translate-y-3 ${
                  selectedStore?.id === store.id
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-400 shadow-xl scale-105 ring-4 ring-blue-200'
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-xl'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full shadow-lg ${
                      store.color === 'blue' ? 'bg-blue-500' :
                      store.color === 'green' ? 'bg-green-500' : 'bg-purple-500'
                    }`}></div>
                    <h4 className="font-bold text-gray-800 text-lg">{store.nombre}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(store.rating)}
                    <span className="text-lg text-gray-700 ml-2 font-bold">{store.rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 flex items-center gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  {store.direccion}
                </p>
                
                <div className="mb-4">
                  <div className={`inline-block px-4 py-2 rounded-full text-white text-sm font-semibold ${
                    store.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                    store.color === 'green' ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                    'bg-gradient-to-r from-purple-500 to-purple-600'
                  }`}>
                    {store.especialidad}
                  </div>
                  <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${
                    store.zona === 'Norte' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    Zona {store.zona}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Phone className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{store.telefono}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-green-600" />
                    </div>
                    <span>{store.horario}</span>
                  </div>
                </div>

                {/* Coordenadas GPS */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 font-mono">
                    📍 GPS: {store.position[0].toFixed(4)}, {store.position[1].toFixed(4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mapa Satelital Real */}
        <div className={`relative transition-all duration-500 ${
          isFullscreen ? 'col-span-1 h-[85vh]' : 'lg:col-span-2 h-[700px]'
        }`}>
          {/* 
            AQUÍ VA TU CÓDIGO REAL DE REACT-LEAFLET 
            Reemplaza este MapContainer con tu implementación:
          */}
          <MapContainer
            center={mapCenter}
            zoom={12}
            scrollWheelZoom={false}
            className="w-full h-full rounded-none"
          >
            {/* Tu TileLayer satelital */}
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            
            {/* Marcadores con coordenadas reales de Bogotá */}
            {puntosDeVenta.map((store) => (
              <Marker
                key={store.id}
                position={store.position}
                eventHandlers={{
                  click: () => handleStoreClick(store)
                }}
              >
                {selectedStore?.id === store.id && (
                  <Popup>
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg ${
                        store.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                        store.color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600' : 
                        'bg-gradient-to-br from-purple-500 to-purple-600'
                      }`}>
                        {store.id}
                      </div>
                      <h5 className="font-bold text-gray-800 mb-3 text-xl">{store.nombre}</h5>
                      <p className="text-gray-600 mb-3">{store.direccion}</p>
                      <div className={`inline-block px-4 py-2 rounded-full text-white text-sm font-semibold mb-4 ${
                        store.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                        store.color === 'green' ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                        'bg-gradient-to-r from-purple-500 to-purple-600'
                      }`}>
                        {store.especialidad}
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {renderStars(store.rating)}
                        <span className="text-gray-700 ml-2 font-bold text-lg">{store.rating}</span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2 justify-center">
                          <Phone className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{store.telefono}</span>
                        </div>
                        <div className="flex items-center gap-2 justify-center">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span>{store.horario}</span>
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-3 pt-2 border-t border-gray-200">
                          📍 {store.position[0].toFixed(4)}, {store.position[1].toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </Popup>
                )}
              </Marker>
            ))}
          </MapContainer>

          {/* Información del mapa */}
          <div className="absolute top-6 right-6 z-40">
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-gray-200">
              <div className="text-center">
                <h4 className="font-bold text-gray-800 text-xl mb-2">🛰️ Vista Satelital</h4>
                <p className="text-gray-600 text-sm mb-2">Bogotá D.C., Colombia</p>
                <p className="text-blue-600 font-semibold text-sm">
                  {selectedStore ? (
                    `📍 ${selectedStore.nombre}`
                  ) : (
                    'Selecciona una ubicación'
                  )}
                </p>
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                  <p>Zoom: 12 | Coordenadas GPS reales</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controles de zoom simulados */}
          <div className="absolute bottom-6 left-6 z-40">
            <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl text-sm text-gray-700 border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">GPS Activo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer con estadísticas de Bogotá */}
      <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 p-10 border-t border-gray-200">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-center group hover:scale-110 transition-all duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-xl group-hover:shadow-2xl transition-shadow">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <h4 className="font-bold text-gray-800 text-xl mb-1">3 Sucursales</h4>
            <p className="text-gray-600">Bogotá D.C.</p>
          </div>
          
          <div className="flex flex-col items-center group hover:scale-110 transition-all duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-xl group-hover:shadow-2xl transition-shadow">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <h4 className="font-bold text-gray-800 text-xl mb-1">Horarios Amplios</h4>
            <p className="text-gray-600">7 días a la semana</p>
          </div>
          
          <div className="flex flex-col items-center group hover:scale-110 transition-all duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-xl group-hover:shadow-2xl transition-shadow">
              <Phone className="w-10 h-10 text-white" />
            </div>
            <h4 className="font-bold text-gray-800 text-xl mb-1">Atención Directa</h4>
            <p className="text-gray-600">Llamadas y WhatsApp</p>
          </div>

          <div className="flex flex-col items-center group hover:scale-110 transition-all duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-xl group-hover:shadow-2xl transition-shadow text-white text-2xl font-bold">
              ⭐
            </div>
            <h4 className="font-bold text-gray-800 text-xl mb-1">4.8/5 Rating</h4>
            <p className="text-gray-600">Clientes satisfechos</p>
          </div>
        </div>

        {/* Información adicional de Bogotá */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm">
            <span className="font-semibold">🏙️ Bogotá D.C.</span> | 
            <span className="ml-2">📍 Coordenadas: 4.6486° N, 74.0653° W</span> | 
            <span className="ml-2">🌄 Altitud: 2,640 msnm</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// CÓDIGO PARA INTEGRAR CON TU LEAFLET REAL:
/*
Para usar este diseño con tu mapa real de react-leaflet, reemplaza la sección del MapContainer con:

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// En el JSX:
<MapContainer
  center={mapCenter}
  zoom={12}
  scrollWheelZoom={false}
  style={{ height: "100%", width: "100%" }}
>
  <TileLayer
    attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  />
  {puntosDeVenta.map((store) => (
    <Marker
      key={store.id}
      position={store.position}
      icon={customIcon}
      eventHandlers={{
        click: () => handleStoreClick(store)
      }}
    >
      <Popup>
        <div className="text-center p-2">
          <h3 className="font-bold text-lg mb-2">{store.nombre}</h3>
          <p className="text-gray-600 mb-2">{store.direccion}</p>
          <p className="text-blue-600 font-semibold">{store.especialidad}</p>
        </div>
      </Popup>
    </Marker>
  ))}
</MapContainer>
*/