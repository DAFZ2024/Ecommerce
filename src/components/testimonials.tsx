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

export const Testimonials: React.FC = () => {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">Lo que dicen nuestros clientes</h2>
        <p className="text-default-500 text-center mb-8">Testimonios de clientes satisfechos</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border border-default-200">
              <CardBody className="p-6">
                <div className="flex items-center mb-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Icon 
                      key={i} 
                      icon="lucide:star" 
                      className={i < testimonial.rating ? "text-amber-500" : "text-default-300"}
                    />
                  ))}
                </div>
                <p className="text-default-700 mb-6 italic">"{testimonial.comment}"</p>
                <div className="flex items-center">
                  <Avatar src={testimonial.avatar} className="mr-4" size="md" />
                  <div>
                    <h4 className="font-medium">{testimonial.name}</h4>
                    <p className="text-default-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};