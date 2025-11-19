import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Star, Gift, Tag, ShoppingCart } from 'lucide-react';

interface Offer {
  id: number;
  image: string;
  title: string;
  discount: number;
  description?: string;
  precio?: number;
}

interface OffersCarouselProps {
  offers: Offer[];
}

const OffersCarousel: React.FC<OffersCarouselProps> = ({ offers = [] }) => {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const total = offers.length;

  // Auto-play functionality
  useEffect(() => {
    if (!isHovered && total > 1) {
      const interval = setInterval(() => {
        setCurrent((prev) => (prev + 1) % total);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isHovered, total]);

  const next = () => setCurrent((prev) => (prev + 1) % total);
  const prev = () => setCurrent((prev) => (prev - 1 + total) % total);
  const goTo = (idx: number) => setCurrent(idx);

  // Demo data if no offers provided
  const demoOffers = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop",
      title: "Electrónicos Premium",
      discount: 40,
      description: "Los mejores dispositivos con tecnología de vanguardia",
      precio: 299000
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop",
      title: "Moda Exclusiva",
      discount: 60,
      description: "Colección limitada de diseñadores reconocidos",
      precio: 199000
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop",
      title: "Hogar & Decoración",
      discount: 35,
      description: "Transforma tu espacio con estilo contemporáneo",
      precio: 149000
    }
  ];

  const displayOffers = offers.length > 0 ? offers : demoOffers;
  const totalItems = displayOffers.length;

  // Obtener los 2 primeros productos con descuento para los laterales
  const sideProducts = displayOffers.slice(0, 2);

  if (totalItems === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto h-96 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-200 shadow-lg">
          <Gift className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <p className="text-xl text-gray-600 font-medium">No hay ofertas disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-0 relative">
      {/* Floating particles background (hidden on small screens) */}
      <div className="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-30"></div>
        <div className="absolute bottom-32 left-20 w-2 h-2 bg-pink-400 rounded-full animate-pulse opacity-35"></div>
      </div>

      <div className="flex gap-4 items-stretch">
        {/* Lateral izquierdo - Producto 1 */}
        {sideProducts[0] && (
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 h-full">
              {/* Imagen del producto */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                <img
                  src={sideProducts[0].image}
                  alt={sideProducts[0].title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
                {/* Badge de descuento */}
                <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                  -{sideProducts[0].discount}%
                </div>
              </div>
              
              {/* Contenido */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                  {sideProducts[0].title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {sideProducts[0].description}
                </p>
                
                {/* Precio */}
                {sideProducts[0].precio && (
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-green-600">
                        ${Math.round(sideProducts[0].precio * (1 - sideProducts[0].discount / 100)).toLocaleString('es-CO')}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        ${sideProducts[0].precio.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      Ahorras ${Math.round(sideProducts[0].precio * (sideProducts[0].discount / 100)).toLocaleString('es-CO')}
                    </p>
                  </div>
                )}
                
                {/* Botón */}
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                  <ShoppingCart className="w-4 h-4" />
                  Ver Oferta
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Carousel central */}
        <div className="flex-1">
          <div 
            className="relative overflow-hidden rounded-3xl shadow-2xl bg-white border border-gray-200 group transition-all duration-700 hover:shadow-xl hover:shadow-blue-500/10"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Subtle gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-[1px] bg-white rounded-3xl"></div>
            
            {/* Header with clean design */}
            <div className="relative z-10 flex items-center justify-center px-4 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                </div>
                <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
                  Ofertas Especiales
                </h2>
              </div>
              <div className="absolute right-4 sm:right-8 hidden sm:flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-gray-700 font-medium text-sm">{current + 1} / {totalItems}</span>
              </div>
            </div>

            {/* Main carousel container */}
            <div className="relative h-[320px] sm:h-[420px] md:h-[500px] overflow-hidden bg-gray-50">
              {/* Background image with parallax effect */}
              <div className="absolute inset-0 transition-transform duration-700 ease-out" style={{
                transform: `translateX(-${current * 100}%)`
              }}>
                {displayOffers.map((offer, idx) => (
                  <div
                    key={offer.id}
                    className="absolute inset-0 w-full h-full flex items-center justify-center"
                    style={{ left: `${idx * 100}%` }}
                  >
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="max-h-[240px] sm:max-h-[360px] md:max-h-[400px] max-w-full object-contain mx-auto my-auto"
                    />
                  </div>
                ))}
              </div>

              {/* Navigation buttons (smaller on mobile) */}
              <button
                className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 group/btn bg-white/95 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-full p-2 sm:p-4 transition-all duration-300 hover:scale-110 hover:shadow-lg shadow-md"
                onClick={prev}
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 group-hover/btn:text-blue-600 transition-colors" />
              </button>
              
              <button
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 group/btn bg-white/95 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-full p-2 sm:p-4 transition-all duration-300 hover:scale-110 hover:shadow-lg shadow-md"
                onClick={next}
                aria-label="Siguiente"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 group-hover/btn:text-blue-600 transition-colors" />
              </button>

              {/* Content overlay */}
              <div className="absolute inset-0 flex items-end justify-center z-10">
                <div className="text-center p-4 sm:p-8 mb-6 sm:mb-8 max-w-full sm:max-w-2xl">
                  {/* Discount badge */}
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-200 to-orange-200 text-blue-900 px-4 py-2 rounded-full font-bold text-sm sm:text-xl mb-3 sm:mb-4 shadow-lg border border-yellow-400">
                    <Sparkles className="w-5 h-5 text-yellow-600" />
                    <span>¡{displayOffers[current].discount}% OFF!</span>
                  </div>
                  {/* Title */}
                  <h3 className="text-2xl sm:text-4xl font-bold text-blue-900 mb-3 sm:mb-4">
                    {displayOffers[current].title}
                  </h3>
                  {/* Description */}
                  {displayOffers[current].description && (
                    <p className="text-gray-800 text-sm sm:text-lg font-medium max-w-md mx-auto leading-relaxed">
                      {displayOffers[current].description}
                    </p>
                  )}
                </div>
              </div>

              {/* Progress indicators with circular progress */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {displayOffers.map((_, idx) => (
                  <button
                    key={idx}
                    className="relative group/indicator"
                    onClick={() => goTo(idx)}
                    aria-label={`Ir a la oferta ${idx + 1}`}
                  >
                    {/* Outer glow ring */}
                    <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                      idx === current 
                        ? 'bg-gradient-to-r from-blue-400 to-purple-400 blur-md opacity-60 scale-110' 
                        : 'opacity-0 group-hover/indicator:opacity-30 group-hover/indicator:bg-blue-300 group-hover/indicator:blur-sm'
                    }`}></div>
                    
                    {/* Main circle container */}
                    <div className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-300 ${
                      idx === current 
                        ? 'scale-100' 
                        : 'scale-75 group-hover/indicator:scale-85'
                    }`}>
                      {/* Background circle */}
                      <div className="absolute inset-0 rounded-full bg-white/90 backdrop-blur-sm border-2 border-white/50 shadow-lg"></div>
                      
                      {/* Progress ring (SVG) */}
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                        {/* Background ring */}
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="rgba(200, 200, 200, 0.3)"
                          strokeWidth="2.5"
                        />
                        {/* Progress ring */}
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="2.5"
                          strokeDasharray="94.25"
                          strokeDashoffset={idx === current && !isHovered ? 0 : 94.25}
                          strokeLinecap="round"
                          className="transition-all duration-75 ease-linear"
                          style={{
                            animation: idx === current && !isHovered ? 'progressRing 4s linear infinite' : 'none'
                          }}
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="50%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      {/* Center dot */}
                      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300`}>
                        <div className={`rounded-full transition-all duration-300 ${
                          idx === current
                            ? 'w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 shadow-md'
                            : 'w-2 h-2 bg-gray-400 group-hover/indicator:bg-blue-400 group-hover/indicator:w-2.5 group-hover/indicator:h-2.5'
                        }`}></div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lateral derecho - Producto 2 */}
        {sideProducts[1] && (
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 h-full">
              {/* Imagen del producto */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
                <img
                  src={sideProducts[1].image}
                  alt={sideProducts[1].title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
                {/* Badge de descuento */}
                <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                  -{sideProducts[1].discount}%
                </div>
              </div>
              
              {/* Contenido */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                  {sideProducts[1].title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {sideProducts[1].description}
                </p>
                
                {/* Precio */}
                {sideProducts[1].precio && (
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-green-600">
                        ${Math.round(sideProducts[1].precio * (1 - sideProducts[1].discount / 100)).toLocaleString('es-CO')}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        ${sideProducts[1].precio.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      Ahorras ${Math.round(sideProducts[1].precio * (sideProducts[1].discount / 100)).toLocaleString('es-CO')}
                    </p>
                  </div>
                )}
                
                {/* Botón */}
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                  <ShoppingCart className="w-4 h-4" />
                  Ver Oferta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes progressRing {
          0% { stroke-dashoffset: 94.25; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default OffersCarousel;