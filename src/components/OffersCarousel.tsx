import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Star, Gift, Tag } from 'lucide-react';

interface Offer {
  id: number;
  image: string;
  title: string;
  discount: number;
  description?: string;
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
      description: "Los mejores dispositivos con tecnología de vanguardia"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop",
      title: "Moda Exclusiva",
      discount: 60,
      description: "Colección limitada de diseñadores reconocidos"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop",
      title: "Hogar & Decoración",
      discount: 35,
      description: "Transforma tu espacio con estilo contemporáneo"
    }
  ];

  const displayOffers = offers.length > 0 ? offers : demoOffers;
  const totalItems = displayOffers.length;

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
    <div className="w-screen max-w-none p-0 relative">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-30"></div>
        <div className="absolute bottom-32 left-20 w-2 h-2 bg-pink-400 rounded-full animate-pulse opacity-35"></div>
      </div>

      <div 
        className="relative overflow-hidden rounded-3xl shadow-2xl bg-white border border-gray-200 group transition-all duration-700 hover:shadow-xl hover:shadow-blue-500/10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Subtle gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute inset-[1px] bg-white rounded-3xl"></div>
        
        {/* Header with clean design */}
        <div className="relative z-10 flex items-center justify-between px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
              Ofertas Especiales
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-gray-700 font-medium text-sm">{current + 1} / {totalItems}</span>
          </div>
        </div>

        {/* Main carousel container */}
        <div className="relative h-[500px] overflow-hidden bg-gray-50">
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
                  className="max-h-[400px] max-w-full object-contain mx-auto my-auto"
                />
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <button
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 group/btn bg-white/95 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-full p-4 transition-all duration-300 hover:scale-110 hover:shadow-lg shadow-md"
            onClick={prev}
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 group-hover/btn:text-blue-600 transition-colors" />
          </button>
          
          <button
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 group/btn bg-white/95 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-full p-4 transition-all duration-300 hover:scale-110 hover:shadow-lg shadow-md"
            onClick={next}
            aria-label="Siguiente"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 group-hover/btn:text-blue-600 transition-colors" />
          </button>

          {/* Content overlay */}
          <div className="absolute inset-0 flex items-end justify-center z-10">
            <div className="text-center p-8 mb-8 max-w-2xl">
              {/* Discount badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-200 to-orange-200 text-blue-900 px-6 py-3 rounded-full font-bold text-xl mb-4 shadow-lg border border-yellow-400">
                <Sparkles className="w-6 h-6 text-yellow-600" />
                <span>¡{displayOffers[current].discount}% OFF!</span>
              </div>
              {/* Title */}
              <h3 className="text-4xl font-bold text-blue-900 mb-4">
                {displayOffers[current].title}
              </h3>
              {/* Description */}
              {displayOffers[current].description && (
                <p className="text-gray-800 text-lg font-medium max-w-md mx-auto leading-relaxed">
                  {displayOffers[current].description}
                </p>
              )}
            </div>
          </div>

          {/* Progress indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {displayOffers.map((_, idx) => (
              <button
                key={idx}
                className={`relative overflow-hidden rounded-full transition-all duration-300 ${
                  idx === current 
                    ? 'w-12 h-3 bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg' 
                    : 'w-3 h-3 bg-white/80 hover:bg-white border border-white/50 shadow-md'
                }`}
                onClick={() => goTo(idx)}
                aria-label={`Ir a la oferta ${idx + 1}`}
              >
                {idx === current && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </div>

          {/* Auto-play progress bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-transform duration-75 ease-linear"
              style={{
                transform: isHovered ? 'scaleX(0)' : 'scaleX(1)',
                transformOrigin: 'left',
                animation: isHovered ? 'none' : 'progressBar 4s linear infinite'
              }}
            ></div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-b-3xl"></div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes progressBar {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
};

export default OffersCarousel;