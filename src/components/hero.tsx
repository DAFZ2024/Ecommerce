import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 to-primary-800 text-white">
      {/* Fondo opaco con imagen */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('https://img.heroui.chat/image/car?w=1200&h=800&u=1')] bg-cover bg-center"></div>
      </div>

      {/* Imágenes flotantes */}
      <img
        src="/tire.png"
        alt="Motor"
        className="absolute top-10 left-10 w-20 md:w-32 animate-float"
      />
      <img
        src="moto.png"
        alt="Aceite"
        className="absolute bottom-20 right-40 w-16 md:w-28 animate-float-slow"
      />
      <img
        src="car.png"
        alt="Llanta"
        className="absolute top-1/2 left-1/2 w-24 md:w-36 transform -translate-x-1/2 -translate-y-1/2 animate-float-reverse"
      />
      <img
        src="tool.png"
        alt="Repuesto"
        className="absolute bottom-70 right-80 w-40 md:w-40 animate-float"
      />


      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Todo para tu Vehículo en un Solo Lugar
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Descubre nuestra amplia selección de aceites, repuestos y accesorios
            para motos y automóviles. Calidad garantizada y los mejores precios
            del mercado.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/Productos">
              <Button
                color="default"
                size="lg"
                className="bg-white text-primary-800 font-medium"
                endContent={<Icon icon="lucide:arrow-right" />}
              >
                Ver Productos
              </Button>
            </Link>

            <Link to="/ofertas">
              <Button
                variant="bordered"
                size="lg"
                className="border-white text-white"
              >
                Ofertas Especiales
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
