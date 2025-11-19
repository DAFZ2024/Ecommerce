import React from "react";
import { ShoppingCart, Zap, Shield, Truck, Clock, Percent, ChevronDown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white min-h-screen flex items-center">
      {/* Fondo con múltiples capas y efectos */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('https://img.heroui.chat/image/car?w=1200&h=800&u=1')] bg-cover bg-center opacity-15"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30"></div>
        {/* Efectos de luz */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Imágenes flotantes mejoradas */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/tire.png"
          alt="Motor"
          className="absolute top-16 left-12 w-20 md:w-32 animate-float drop-shadow-2xl hover:scale-110 transition-transform duration-300"
        />
        <img
          src="/moto.png"
          alt="Aceite"
          className="absolute bottom-24 right-40 w-16 md:w-28 animate-float-slow drop-shadow-2xl hover:scale-110 transition-transform duration-300"
        />
        <img
          src="/car.png"
          alt="Llanta"
          className="absolute top-1/2 left-1/2 w-24 md:w-36 transform -translate-x-1/2 -translate-y-1/2 animate-float-reverse drop-shadow-2xl hover:scale-110 transition-transform duration-300"
        />
        <img
          src="/tool.png"
          alt="Repuesto"
          className="absolute bottom-46 right-20 w-32 md:w-40 animate-float drop-shadow-2xl hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-6 py-16 md:py-24 relative z-10">
        <div className="max-w-4xl">
          {/* Badge de oferta */}
          <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-bounce">
            <Zap className="w-4 h-4 mr-2" />
            ¡Ofertas hasta 50% OFF!
          </div>

          <h1 className="text-4xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
            Todo para tu Vehículo
            <span className="block text-3xl md:text-5xl mt-2 text-blue-400">
              en un Solo Lugar
            </span>
          </h1>

          <p className="text-lg md:text-2xl mb-8 opacity-90 leading-relaxed max-w-2xl">
            Descubre nuestra amplia selección de aceites, repuestos y accesorios
            para motos y automóviles. 
            <span className="text-yellow-400 font-semibold"> Calidad garantizada</span> y 
            <span className="text-green-400 font-semibold"> los mejores precios</span> del mercado.
          </p>

          {/* Características destacadas */}
          <div className="flex flex-wrap gap-4 mb-10">
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Shield className="w-5 h-5 mr-2 text-green-400" />
              <span className="text-sm font-medium">Garantía Total</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Truck className="w-5 h-5 mr-2 text-blue-400" />
              <span className="text-sm font-medium">Envío Gratis</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Clock className="w-5 h-5 mr-2 text-purple-400" />
              <span className="text-sm font-medium">Entrega Rápida</span>
            </div>
          </div>

          {/* Botones mejorados */}
          <div className="flex flex-wrap gap-4">
            <Link to="/productos" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold px-8 py-4 text-lg rounded-lg hover:from-blue-600 hover:to-purple-700 shadow-2xl shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Ver Productos
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>

            <Link to="/ofertas" className="border-2 border-white text-white font-bold px-8 py-4 text-lg rounded-lg hover:bg-white hover:text-black backdrop-blur-sm bg-white/10 shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center">
              <Percent className="w-5 h-5 mr-2" />
              Ofertas Especiales
            </Link>
          </div>

          {/* Indicadores de confianza */}
          <div className="flex flex-wrap items-center gap-8 mt-12 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-yellow-400">15K+</div>
              <div className="text-sm opacity-80">Clientes Satisfechos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-400">500+</div>
              <div className="text-sm opacity-80">Productos Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-400">24/7</div>
              <div className="text-sm opacity-80">Soporte Técnico</div>
            </div>
          </div>
        </div>
      </div>

      {/* Efecto de scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-white/60" />
      </div>

      {/* Estilos para las animaciones */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes float-reverse {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-25px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
        
        .animate-float-reverse {
          animation: float-reverse 3.5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};