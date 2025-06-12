import React from "react";
import { Card, CardBody, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";

const testimonials = [
  {
    id: 1,
    name: "Carlos Rodríguez",
    role: "Mecánico Profesional",
    comment: "Los aceites sintéticos que compro aquí son de excelente calidad. Mis clientes siempre quedan satisfechos con el rendimiento de sus vehículos después del cambio de aceite.",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=1",
    rating: 5,
  },
  {
    id: 2,
    name: "María González",
    role: "Motociclista",
    comment: "Encontré todo lo que necesitaba para el mantenimiento de mi moto a precios increíbles. El envío fue rápido y el servicio al cliente excelente.",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=2",
    rating: 5,
  },
  {
    id: 3,
    name: "Juan Pérez",
    role: "Dueño de Taller",
    comment: "Como dueño de un taller, valoro la calidad y consistencia. Esta tienda siempre tiene stock de los productos que necesito y a precios competitivos.",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=3",
    rating: 4,
  },
];

export const Testimonials = () => {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-100/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        {/* Header elegante */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <Icon icon="lucide:message-circle-heart" className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-700 bg-clip-text text-transparent mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Más de 1,000 clientes confían en nosotros para el cuidado de sus vehículos
          </p>
        </div>
        
        {/* Grid de testimonios */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.id} 
              className={`group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm ${
                index === 1 ? 'lg:scale-105 lg:shadow-2xl' : ''
              }`}
            >
              {/* Gradiente decorativo superior */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              
              {/* Elemento decorativo flotante */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
              
              <CardBody className="p-8 relative">
                {/* Icono de comillas */}
                <div className="absolute top-4 right-6 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                  <Icon icon="lucide:quote" className="w-12 h-12 text-blue-600" />
                </div>
                
                {/* Rating con animación */}
                <div className="flex items-center mb-6 space-x-1">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="relative">
                      <Icon
                        icon="lucide:star"
                        className={`w-5 h-5 transition-all duration-300 ${
                          i < testimonial.rating 
                            ? "text-amber-400 drop-shadow-sm group-hover:scale-110" 
                            : "text-gray-200"
                        }`}
                      />
                    </div>
                  ))}
                  <span className="ml-2 text-sm font-medium text-gray-600">
                    {testimonial.rating}/5
                  </span>
                </div>
                
                {/* Comentario con tipografía mejorada */}
                <blockquote className="text-gray-700 mb-8 text-lg leading-relaxed font-medium relative z-10">
                  "{testimonial.comment}"
                </blockquote>
                
                {/* Información del cliente con diseño mejorado */}
                <div className="flex items-center">
                  <div className="relative">
                    <Avatar 
                      src={testimonial.avatar} 
                      className="mr-4 ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all duration-300" 
                      size="lg" 
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <Icon icon="lucide:check" className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">
                      {testimonial.name}
                    </h4>
                    <p className="text-blue-600 font-medium text-sm uppercase tracking-wide">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
        
        {/* CTA section */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <Icon icon="lucide:star" className="w-5 h-5 text-amber-400" />
            <span className="text-gray-700 font-medium">
              4.8/5 basado en 1,247 reseñas
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};