import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

export const CallToAction = () => {
  return (
    <section className="relative h-[200px] sm:h-[400px] w-full my-20 overflow-hidden">
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/auto.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col justify-center items-center h-full text-center px-6"
      >
        <h2 className="text-white text-4xl sm:text-5xl font-extrabold drop-shadow-lg">
          ¡Equipa tu vehículo con lo mejor!
        </h2>
        <p className="mt-4 text-white/90 text-lg max-w-xl">
          Encuentra repuestos, accesorios y ofertas exclusivas para ti.
        </p>
        <a
          href="/productos"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl shadow-md hover:scale-105 transition-transform"
        >
          <Icon icon="lucide:shopping-bag" className="text-xl" />
          Ver Productos
        </a>
      </motion.div>
    </section>
  );
};

