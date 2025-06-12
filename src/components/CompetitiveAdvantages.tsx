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
      color: "from-gray-700 to-gray-900",
      bgGradient: "from-gray-50 to-gray-100",
      borderColor: "border-gray-200"
    },
    {
      icon: "🚀",
      title: "Entrega Rápida",
      subtitle: "Distribución Nacional",
      description: "Red de distribución en todo el país. Entregas en 24-48 horas en ciudades principales y envíos seguros a todo Colombia.",
      stats: "24-48 hrs entrega",
      color: "from-blue-700 to-blue-900",
      bgGradient: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200"
    },
    {
      icon: "💰",
      title: "Precios Competitivos",
      subtitle: "Mejor Relación Precio-Calidad",
      description: "Precios directos de fábrica sin intermediarios. Ofrecemos la mejor relación calidad-precio del mercado con ofertas exclusivas.",
      stats: "Hasta 30% ahorro",
      color: "from-green-700 to-green-900",
      bgGradient: "from-green-50 to-green-100",
      borderColor: "border-green-200"
    },
    {
      icon: "🔧",
      title: "Soporte Técnico",
      subtitle: "Expertos en Autopartes",
      description: "Equipo de expertos disponible para asesorarte. Te ayudamos a encontrar el repuesto exacto para tu vehículo.",
      stats: "Soporte 24/7",
      color: "from-indigo-700 to-indigo-900",
      bgGradient: "from-indigo-50 to-indigo-100",
      borderColor: "border-indigo-200"
    },
    {
      icon: "🛡️",
      title: "Garantía Extendida",
      subtitle: "Protección Total",
      description: "Garantía extendida en todos nuestros productos. Si algo sale mal, nosotros nos hacemos cargo sin complicaciones.",
      stats: "Garantía 12 meses",
      color: "from-teal-700 to-teal-900",
      bgGradient: "from-teal-50 to-teal-100",
      borderColor: "border-teal-200"
    },
    {
      icon: "📱",
      title: "Experiencia Digital",
      subtitle: "Compra Online Fácil",
      description: "Plataforma moderna y fácil de usar. Catálogo digital completo con búsqueda inteligente y proceso de compra simplificado.",
      stats: "Interface moderna",
      color: "from-slate-700 to-slate-900",
      bgGradient: "from-slate-50 to-slate-100",
      borderColor: "border-slate-200"
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
      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gray-50 py-20 px-4 overflow-hidden">
      {/* Elementos flotantes decorativos */}
      <FloatingElement delay={0} className="top-20 left-10" />
      <FloatingElement delay={1} className="top-32 right-20" />
      <FloatingElement delay={2} className="bottom-40 left-20" />
      <FloatingElement delay={3} className="bottom-20 right-10" />
      
      {/* Formas geométricas de fondo */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gray-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gray-300/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center px-4 py-2 bg-gray-200/50 rounded-full border border-gray-300 mb-6">
            <span className="text-sm font-semibold text-gray-700 tracking-wide">¿POR QUÉ ELEGIRNOS?</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="text-gray-800">Ventajas que nos</span>
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
              className={`group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-500 overflow-hidden border ${advantage.borderColor} transform hover:-translate-y-1 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onMouseEnter={() => setActiveCard(index)}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${advantage.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              {/* Content */}
              <div className="relative p-6">
                {/* Icon */}
                <div className="mb-4">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform duration-300">
                    {advantage.icon}
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-gray-800 transition-colors">
                    {advantage.title}
                  </h3>
                  <p className={`text-sm font-medium text-gray-500`}>
                    {advantage.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4 group-hover:text-gray-700 transition-colors">
                  {advantage.description}
                </p>

                {/* Stats Badge */}
                <div className={`inline-flex items-center px-3 py-1 bg-gradient-to-r ${advantage.color} text-white text-xs font-semibold rounded-full shadow`}>
                  {advantage.stats}
                </div>

                {/* Hover Effect Border */}
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${advantage.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className={`text-center bg-gray-800 rounded-xl p-8 shadow-lg transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              ¿Listo para Experimentar la Diferencia?
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Únete a miles de clientes satisfechos que ya disfrutan de nuestro servicio excepcional. 
              Tu vehículo merece lo mejor.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button onClick={() => navigate('/Productos')}
                className="group px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow transform active:scale-95"
              >
                <span className="mr-2">🛒</span>
                Ver Productos
                <svg className="w-4 h-4 ml-2 inline group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button onClick={() => navigate('/Contacto')}
                className="group px-6 py-3 bg-transparent text-white font-semibold rounded-lg border border-white hover:bg-white hover:text-gray-800 transition-all duration-300 hover:scale-105"
              >
                <span className="mr-2">📞</span>
                Contáctanos
              </button>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className={`mt-12 text-center transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex flex-wrap justify-center items-center gap-6 text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <span className="font-medium">4.9/5 Estrellas</span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👥</span>
              <span className="font-medium">+10,000 Clientes</span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🚚</span>
              <span className="font-medium">Envío Nacional</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitiveAdvantages;