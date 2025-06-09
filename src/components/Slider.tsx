import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const images = [
  {
    url: "/frenos.png",
    title: "Calidad en Frenos",
    description: "Descubre nuestra amplia gama de discos y pastillas de freno para tu seguridad.",
    bgColor: "from-blue-900/90 via-blue-800/80 to-blue-600/70",
    accentColor: "blue"
  },
  {
    url: "/motor.png",
    title: "Motores Potentes",
    description: "Repuestos confiables para mantener el corazón de tu vehículo siempre en marcha.",
    bgColor: "from-red-900/90 via-red-800/80 to-red-600/70",
    accentColor: "red"
  },
  {
    url: "/led.png",
    title: "Luces LED Modernas",
    description: "Ilumina tu camino con nuestra selección de faros y luces traseras de última generación.",
    bgColor: "from-amber-900/90 via-amber-800/80 to-amber-600/70",
    accentColor: "amber"
  },
];

export default function ModernElegantCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleTransition = (newIndex) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(newIndex);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const handlePrev = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    handleTransition(newIndex);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % images.length;
    handleTransition(newIndex);
  };

  const getAccentColor = (color) => {
    const colors = {
      blue: "border-blue-400 bg-blue-500",
      red: "border-red-400 bg-red-500",
      amber: "border-amber-400 bg-amber-500"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="relative w-full h-[500px] lg:h-[650px] overflow-hidden bg-black">
      {/* Contenedor principal con efecto de profundidad */}
      <div className="relative w-full h-full">
        {images.map((image, idx) => (
          <div 
            key={idx}
            className={`absolute inset-0 transition-all duration-1000 ease-out
              ${idx === currentIndex 
                ? "opacity-100 scale-100 z-10" 
                : "opacity-0 scale-105 z-0"
              }`}
          >
            {/* Imagen con efectos parallax - CAMBIO AQUÍ */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={image.url}
                alt={image.title}
                className={`w-full h-full object-contain transition-transform duration-1000 ease-out
                  ${idx === currentIndex ? "scale-100" : "scale-110"}
                `}
                draggable={false}
              />
            </div>
            
            {/* Gradiente sofisticado con múltiples capas */}
            <div className={`absolute inset-0 bg-gradient-to-br ${image.bgColor}`}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent"></div>
            
            {/* Efecto de brillo sutil */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Contenido con animaciones staggered */}
      <div className="absolute inset-0 flex flex-col justify-center items-start px-8 md:px-16 lg:px-24 xl:px-32 z-20">
        <div className="max-w-3xl space-y-6">
          {/* Badge decorativo */}
          <div className={`inline-flex items-center px-4 py-2 rounded-full border backdrop-blur-md
            ${getAccentColor(images[currentIndex].accentColor)} bg-opacity-20 border-opacity-30
            transform transition-all duration-700 delay-200
            ${currentIndex >= 0 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
          `}>
            <div className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse"></div>
            <span className="text-white text-sm font-medium tracking-wide">
              PREMIUM QUALITY
            </span>
          </div>

          {/* Título con efecto typewriter */}
          <h2 className={`text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight
            transform transition-all duration-700 delay-300
            ${currentIndex >= 0 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
          `}>
            <span className="block bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
              {images[currentIndex].title}
            </span>
          </h2>

          {/* Descripción elegante */}
          <p className={`text-lg md:text-xl lg:text-2xl text-gray-200 leading-relaxed max-w-2xl
            transform transition-all duration-700 delay-500
            ${currentIndex >= 0 ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}
          `}>
            {images[currentIndex].description}
          </p>

          {/* Botón con efectos avanzados */}
          <div className={`flex items-center space-x-4 pt-4
            transform transition-all duration-700 delay-700
            ${currentIndex >= 0 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
          `}>
            <button 
              onClick={() => navigate('/Productos')}
              className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-full 
              hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl
              transform active:scale-95">
              <span className="relative z-10">Ver Catálogo Completo</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-100 rounded-full opacity-0 
                group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button 
              onClick={() => navigate('/Productos')}
              className="group flex items-center space-x-2 text-white/80 hover:text-white 
              transition-colors duration-300">
              <span className="text-sm font-medium tracking-wide">EXPLORAR MÁS</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Indicadores modernos con efectos glassmorphism */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center space-x-2 px-4 py-3 rounded-full backdrop-blur-md bg-white/10 border border-white/20">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleTransition(idx)}
              className={`relative overflow-hidden rounded-full transition-all duration-500 hover:scale-110
                ${idx === currentIndex 
                  ? "w-8 h-3 bg-white shadow-lg" 
                  : "w-3 h-3 bg-white/40 hover:bg-white/60"
                }`}
              aria-label={`Ir a slide ${idx + 1}`}
            >
              {idx === currentIndex && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent 
                  animate-pulse"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Navegación con efectos premium */}
      <button
        onClick={handlePrev}
        disabled={isTransitioning}
        className="absolute top-1/2 left-6 -translate-y-1/2 z-30 group
          w-14 h-14 rounded-full backdrop-blur-md bg-white/10 border border-white/20
          hover:bg-white/20 hover:border-white/30 hover:scale-110
          transition-all duration-300 disabled:opacity-50"
        aria-label="Anterior"
      >
        <svg className="w-6 h-6 text-white mx-auto group-hover:-translate-x-0.5 transition-transform duration-300" 
          fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={handleNext}
        disabled={isTransitioning}
        className="absolute top-1/2 right-6 -translate-y-1/2 z-30 group
          w-14 h-14 rounded-full backdrop-blur-md bg-white/10 border border-white/20
          hover:bg-white/20 hover:border-white/30 hover:scale-110
          transition-all duration-300 disabled:opacity-50"
        aria-label="Siguiente"
      >
        <svg className="w-6 h-6 text-white mx-auto group-hover:translate-x-0.5 transition-transform duration-300" 
          fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Decoración de esquinas */}
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-white/20 z-20"></div>
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-white/20 z-20"></div>
    </div>
  );
}