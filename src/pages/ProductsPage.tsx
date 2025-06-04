import React from "react";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";

const products = [
  {
    id: 1,
    name: "Aceite 10W-40",
    description: "Lubricante sintético para motores de alto rendimiento.",
    icon: "lucide:droplet",
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  {
    id: 2,
    name: "Filtro de Aire",
    description: "Filtro de alta eficiencia para autos compactos.",
    icon: "lucide:filter",
    color: "text-amber-500",
    bgColor: "bg-amber-100",
  },
  {
    id: 3,
    name: "Batería 12V",
    description: "Batería con 2 años de garantía.",
    icon: "lucide:battery-charging",
    color: "text-red-500",
    bgColor: "bg-red-100",
  },
  {
    id: 4,
    name: "Neumático 195/65R15",
    description: "Diseño para mejor tracción y durabilidad.",
    icon: "lucide:circle-dot",
    color: "text-purple-500",
    bgColor: "bg-purple-100",
  },
];

export const ProductsPage: React.FC = () => {
  return (
    <section className="py-12 px-4 bg-content1">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">Nuestros Productos</h2>
        <p className="text-default-500 text-center mb-8">Encuentra los mejores productos para tu vehículo</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              isPressable
              className="border border-default-200 transition-transform hover:scale-105"
            >
              <CardBody className="flex flex-col items-center justify-center p-6 text-center">
                <div className={`w-14 h-14 rounded-full ${product.bgColor} flex items-center justify-center mb-4`}>
                  <Icon icon={product.icon} className={`text-2xl ${product.color}`} />
                </div>
                <h3 className="font-semibold text-base mb-1">{product.name}</h3>
                <p className="text-sm text-default-500">{product.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
