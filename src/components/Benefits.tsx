import React from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: "lucide:truck",
    title: "Envío Rápido",
    description: "Recibe tus productos en tiempo récord, directo a tu puerta.",
  },
  {
    icon: "lucide:shield-check",
    title: "Compra Segura",
    description: "Tus pagos están protegidos con tecnología de seguridad avanzada.",
  },
  {
    icon: "lucide:refresh-ccw",
    title: "Fácil Devolver",
    description: "¿No estás satisfecho? Devoluciones sin complicaciones.",
  },
  {
    icon: "lucide:star",
    title: "Productos de Calidad",
    description: "Solo trabajamos con marcas reconocidas y confiables.",
  },
];

export const Benefits = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-gray-800">
          ¿Por qué elegirnos?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-center mb-4 text-primary">
                <Icon icon={benefit.icon} className="text-4xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                {benefit.title}
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
