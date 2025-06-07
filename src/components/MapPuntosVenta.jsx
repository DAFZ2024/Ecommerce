import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const puntosDeVenta = [
  {
    id: 1,
    nombre: "Autopartes Central",
    direccion: "Av. Principal 123, Ciudad",
    position: [4.5887, -74.1995],
  },
  {
    id: 2,
    nombre: "Tienda Repuestos Norte",
    direccion: "Calle Norte 456, Ciudad",
    position: [4.5815, -74.1996],
  },
  {
    id: 3,
    nombre: "Sucursal Sur",
    direccion: "Av. Sur 789, Ciudad",
    position: [4.5840, -74.1930],
  },
];

export const MapPuntosVenta = () => {
  return (
    <div className="w-full h-64 sm:h-[400px] my-10 rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={[4.5887, -74.1995]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
  attribution='Tiles &copy; Esri'
  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
/>
        {puntosDeVenta.map(({ id, nombre, direccion, position }) => (
          <Marker key={id} position={position} icon={customIcon}>
            <Popup>
              <div className="text-sm">
                <h3 className="font-semibold text-base">{nombre}</h3>
                <p className="text-gray-700">{direccion}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
