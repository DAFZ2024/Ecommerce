import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

const CompetitiveAdvantages = () => {
  const [activeCard, setActiveCard] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const navigate = useNavigate();

  const advantages = [
    {
      icon: "🏆",
      title: "Calidad Garantizada",
      subtitle: "Repuestos Originales",
      description: "Trabajamos solo con marcas reconocidas mundialmente. Cada repuesto viene con garantía de fábrica y certificación de calidad.",
      stats: "98% satisfacción",
      color: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-50 to-orange-50",
      borderColor: "border-amber-200"
    },
    {
      icon: "🚀",
      title: "Entrega Rápida",
      subtitle: "Distribución Nacional",
      description: "Red de distribución en todo el país. Entregas en 24-48 horas en ciudades principales y envíos seguros a todo Colombia.",
      stats: "24-48 hrs entrega",
      color: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200"
    },
    {
      icon: "💰",
      title: "Precios Competitivos",
      subtitle: "Mejor Relación Precio-Calidad",
      description: "Precios directos de fábrica sin intermediarios. Ofrecemos la mejor relación calidad-precio del mercado con ofertas exclusivas.",
      stats: "Hasta 30% ahorro",
      color: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
      borderColor: "border-green-200"
    },
    {
      icon: "🔧",
      title: "Soporte Técnico",
      subtitle: "Expertos en Autopartes",
      description: "Equipo de expertos disponible para asesorarte. Te ayudamos a encontrar el repuesto exacto para tu vehículo.",
      stats: "Soporte 24/7",
      color: "from-purple-500 to-violet-600",
      bgGradient: "from-purple-50 to-violet-50",
      borderColor: "border-purple-200"
    },
    {
      icon: "🛡️",
      title: "Garantía Extendida",
      subtitle: "Protección Total",
      description: "Garantía extendida en todos nuestros productos. Si algo sale mal, nosotros nos hacemos cargo sin complicaciones.",
      stats: "Garantía 12 meses",
      color: "from-red-500 to-pink-600",
      bgGradient: "from-red-50 to-pink-50",
      borderColor: "border-red-200"
    },
    {
      icon: "📱",
      title: "Experiencia Digital",
      subtitle: "Compra Online Fácil",
      description: "Plataforma moderna y fácil de usar. Catálogo digital completo con búsqueda inteligente y proceso de compra simplificado.",
      stats: "Interface moderna",
      color: "from-indigo-500 to-blue-600",
      bgGradient: "from-indigo-50 to-blue-50",
      borderColor: "border-indigo-200"
    }
  ];

  const FloatingElement = ({ delay = 0, className = "" }) => (
    <div 
      className={`absolute opacity-10 animate-pulse ${className}`}
      style={{ 
        animationDelay: `${delay}s`,
        animationDuration: '3s'
      }}
    >
      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 py-20 px-4 overflow-hidden">
      {/* Elementos flotantes decorativos */}
      <FloatingElement delay={0} className="top-20 left-10" />
      <FloatingElement delay={1} className="top-32 right-20" />
      <FloatingElement delay={2} className="bottom-40 left-20" />
      <FloatingElement delay={3} className="bottom-20 right-10" />
      
      {/* Formas geométricas de fondo */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-amber-100/30 to-orange-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-200/30 mb-6">
            <span className="text-sm font-semibold text-blue-600 tracking-wide">¿POR QUÉ ELEGIRNOS?</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Ventajas que nos
            </span>
            <br />
            <span className="text-gray-800">Hacen Únicos</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Descubre por qué miles de clientes confían en nosotros para sus repuestos automotrices. 
            Calidad, rapidez y servicio excepcional en cada compra.
          </p>
        </div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {advantages.map((advantage, index) => (
            <div
              key={index}
              className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 ${advantage.borderColor} transform hover:-translate-y-2 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onMouseEnter={() => setActiveCard(index)}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${advantage.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              {/* Content */}
              <div className="relative p-8">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-white to-gray-50 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {advantage.icon}
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                    {advantage.title}
                  </h3>
                  <p className={`text-sm font-semibold bg-gradient-to-r ${advantage.color} bg-clip-text text-transparent`}>
                    {advantage.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700 transition-colors">
                  {advantage.description}
                </p>

                {/* Stats Badge */}
                <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${advantage.color} text-white text-sm font-bold rounded-full shadow-lg`}>
                  <span className="mr-2">✨</span>
                  {advantage.stats}
                </div>

                {/* Hover Effect Border */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${advantage.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className={`text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 shadow-2xl transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-6">
              ¿Listo para Experimentar la Diferencia?
            </h3>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Únete a miles de clientes satisfechos que ya disfrutan de nuestro servicio excepcional. 
              Tu vehículo merece lo mejor.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button onClick={() => navigate('/Productos')}
                className="group px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-full hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-xl transform active:scale-95"
              >
                <span className="mr-2">🛒</span>
                Ver Productos
                <svg className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button onClick={() => navigate('/Contacto')}
                className="group px-8 py-4 bg-transparent text-white font-bold text-lg rounded-full border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105"
              >
                <span className="mr-2">📞</span>
                Contáctanos
              </button>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className={`mt-16 text-center transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="font-semibold">4.9/5 Estrellas</span>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <span className="font-semibold">+10,000 Clientes</span>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚚</span>
              <span className="font-semibold">Envío Nacional</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitiveAdvantages;