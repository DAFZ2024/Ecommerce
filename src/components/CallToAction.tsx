import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

export const CallToAction = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = e.currentTarget?.getBoundingClientRect();
      if (rect) {
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const section = document.getElementById('cta-section');
    section?.addEventListener('mousemove', handleMouseMove);
    return () => section?.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section 
      id="cta-section"
      className="relative h-[500px] sm:h-[600px] w-full my-20 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagen de fondo con efectos parallax */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-110 transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: "url('/auto.png')" }}
        />
        {/* Overlay con gradiente más sofisticado */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-blue-900/60 to-black/80" />
        
        {/* Efectos de luz dinámicos */}
        <div 
          className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl transition-all duration-500"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            opacity: isHovered ? 0.6 : 0.3
          }}
        />
      </div>

      {/* Elementos decorativos flotantes */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
        <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full animate-pulse" />
        <div className="absolute bottom-20 left-20 w-3 h-3 bg-blue-300/50 rounded-full animate-bounce" />
        
        {/* Líneas decorativas */}
        <div className="absolute top-0 left-1/4 w-px h-32 bg-gradient-to-b from-blue-400/50 to-transparent" />
        <div className="absolute bottom-0 right-1/3 w-px h-40 bg-gradient-to-t from-blue-400/50 to-transparent" />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-6">
        {/* Badge superior */}
        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-6 hover:bg-white/20 transition-all duration-300">
          <Icon icon="lucide:zap" className="w-4 h-4 text-yellow-400" />
          <span className="text-white/90 text-sm font-medium">Ofertas Exclusivas</span>
        </div>

        {/* Título principal con efecto gradiente */}
        <h2 className="text-white text-4xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
          <span className="block bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent drop-shadow-2xl">
            ¡Equipa tu vehículo
          </span>
          <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl">
            con lo mejor!
          </span>
        </h2>

        {/* Subtítulo mejorado */}
        <p className="mt-4 text-white/90 text-xl max-w-2xl leading-relaxed font-light">
          Descubre repuestos de calidad premium, accesorios exclusivos y ofertas irresistibles 
          <span className="text-blue-300 font-medium"> solo para ti</span>
        </p>

        {/* Estadísticas rápidas */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-8 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">1000+</div>
            <div className="text-blue-200 text-sm">Productos</div>
          </div>
          <div className="w-px h-12 bg-white/20" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">24h</div>
            <div className="text-blue-200 text-sm">Envío rápido</div>
          </div>
          <div className="w-px h-12 bg-white/20" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">5⭐</div>
            <div className="text-blue-200 text-sm">Calificación</div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          {/* Botón principal */}
          <a
            href="/productos"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Icon icon="lucide:shopping-bag" className="text-xl relative z-10" />
            <span className="relative z-10">Ver Productos</span>
            <Icon icon="lucide:arrow-right" className="text-lg relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
          </a>

          {/* Botón secundario */}
          <a
            href="/ofertas"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-2xl border-2 border-white/20 hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-300"
          >
            <Icon icon="lucide:percent" className="text-xl" />
            <span>Ver Ofertas</span>
          </a>
        </div>

        {/* Indicador de scroll */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center space-y-2 opacity-60 hover:opacity-100 transition-opacity duration-300">
            
          </div>
        </div>
      </div>

      {/* Efecto de brillo en los bordes */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 border-t border-white/10" />
        <div className="absolute inset-0 border-t border-white/5" />
      </div>
    </section>
  );
};