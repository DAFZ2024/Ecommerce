import React from "react";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";

const categories = [
  {
    id: 1,
    name: "Aceites para Motos",
    icon: "lucide:droplet",
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  {
    id: 2,
    name: "Aceites para Autos",
    icon: "lucide:fuel",
    color: "text-green-500",
    bgColor: "bg-green-100",
  },
  {
    id: 3,
    name: "Filtros",
    icon: "lucide:filter",
    color: "text-amber-500",
    bgColor: "bg-amber-100",
  },
  {
    id: 4,
    name: "Baterías",
    icon: "lucide:battery-charging",
    color: "text-red-500",
    bgColor: "bg-red-100",
  },
  {
    id: 5,
    name: "Neumáticos",
    icon: "lucide:circle-dot",
    color: "text-purple-500",
    bgColor: "bg-purple-100",
  },
  {
    id: 6,
    name: "Herramientas",
    icon: "lucide:wrench",
    color: "text-gray-500",
    bgColor: "bg-gray-100",
  },
];

export const Categories: React.FC = () => {
  return (
    <section className="py-12 px-4 bg-content1">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">Categorías Populares</h2>
        <p className="text-default-500 text-center mb-8">Explora nuestras categorías más buscadas</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Card 
              key={category.id} 
              isPressable 
              className="border border-default-200 transition-transform hover:scale-105"
            >
              <CardBody className="flex flex-col items-center justify-center p-6 text-center">
                <div className={`w-14 h-14 rounded-full ${category.bgColor} flex items-center justify-center mb-4`}>
                  <Icon icon={category.icon} className={`text-2xl ${category.color}`} />
                </div>
                <h3 className="font-medium text-sm md:text-base">{category.name}</h3>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};