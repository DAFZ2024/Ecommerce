import React from "react";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";

export const ContactPage: React.FC = () => {
  return (
    <section className="py-12 px-4 bg-content1">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
          Contáctanos
        </h2>
        <p className="text-default-500 text-center mb-8">
          ¿Tienes preguntas o deseas más información? Estamos aquí para
          ayudarte.
        </p>

        <Card className="border border-default-200 shadow-md">
          <CardBody className="p-8">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-default-600 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  className="w-full p-3 border border-default-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-default-600 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="tucorreo@example.com"
                  className="w-full p-3 border border-default-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-default-600 mb-1">
                  Mensaje
                </label>
                <textarea
                  rows={5}
                  placeholder="Escribe tu mensaje aquí..."
                  className="w-full p-3 border border-default-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Enviar mensaje
                </button>
              </div>
            </form>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <Card className="border border-default-200 text-center">
            <CardBody className="flex flex-col items-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Icon icon="lucide:mail" className="text-xl text-blue-500" />
              </div>
              <h4 className="font-semibold mb-1">Correo</h4>
              <p className="text-default-500 text-sm">
                soporte@autopartesbogota.com
              </p>
            </CardBody>
          </Card>
          <Card className="border border-default-200 text-center">
            <CardBody className="flex flex-col items-center p-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                <Icon icon="lucide:phone" className="text-xl text-amber-500" />
              </div>
              <h4 className="font-semibold mb-1">Teléfono</h4>
              <p className="text-default-500 text-sm">+57 3114996440</p>
            </CardBody>
          </Card>
          <Card className="border border-default-200 text-center">
            <CardBody className="flex flex-col items-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Icon
                  icon="lucide:map-pin"
                  className="text-xl text-purple-500"
                />
              </div>
              <h4 className="font-semibold mb-1">Ubicación</h4>
              <p className="text-default-500 text-sm">BOGOTA, Colombia</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
};
