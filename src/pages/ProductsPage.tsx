import React, { useState, useEffect } from "react";
import { Card, CardBody, CardFooter, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";

const categories = [
  { id: 1, name: "Aceites para Motos", icon: "lucide:droplet", color: "text-blue-500", bgColor: "bg-blue-100" },
  { id: 2, name: "Aceites para Autos", icon: "lucide:fuel", color: "text-green-500", bgColor: "bg-green-100" },
  { id: 3, name: "Filtros", icon: "lucide:filter", color: "text-amber-500", bgColor: "bg-amber-100" },
  { id: 4, name: "Baterías", icon: "lucide:battery-charging", color: "text-red-500", bgColor: "bg-red-100" },
  { id: 5, name: "Neumáticos", icon: "lucide:circle-dot", color: "text-purple-500", bgColor: "bg-purple-100" },
  { id: 6, name: "Herramientas", icon: "lucide:wrench", color: "text-gray-500", bgColor: "bg-gray-100" },
  // Nuevas categorías
  { id: 7, name: "Lubricantes", icon: "lucide:oil-can", color: "text-yellow-600", bgColor: "bg-yellow-100" },
  { id: 8, name: "Accesorios", icon: "lucide:tool", color: "text-pink-500", bgColor: "bg-pink-100" },
  { id: 9, name: "Repuestos", icon: "lucide:settings", color: "text-cyan-500", bgColor: "bg-cyan-100" },
  { id: 10, name: "Electrónica", icon: "lucide:cpu", color: "text-indigo-500", bgColor: "bg-indigo-100" },
];

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedCategoryId) {
      setProducts([]);
      return;
    }
    setLoading(true);
    axios
      .get(`http://localhost:3001/api/productos/categoria/${selectedCategoryId}`)
      .then((res) => setProducts(res.data))
      .catch((err) => {
        console.error(err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [selectedCategoryId]);

  const handleCategoryClick = (id: number) => {
    if (selectedCategoryId === id) {
      setSelectedCategoryId(null);
      setProducts([]);
    } else {
      setSelectedCategoryId(id);
    }
  };

  return (
    <section className="py-12 px-4 bg-content1">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">Categorías Populares</h2>
        <p className="text-default-500 text-center mb-8">Selecciona una categoría para ver los productos</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {categories.map((category) => (
            <Card
              key={category.id}
              isPressable
              className={`border border-default-200 transition-transform hover:scale-105 cursor-pointer ${
                selectedCategoryId === category.id ? "border-primary bg-primary-100" : ""
              }`}
              onClick={() => handleCategoryClick(category.id)}
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

        {loading && <p className="text-center text-default-500">Cargando productos...</p>}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id_producto} className="border border-default-200">
                <CardBody className="p-0 overflow-hidden">
                  <div className="relative h-48 bg-white flex items-center justify-center">
                    <img
                      src={`http://localhost:3001${product.imagen_url}`}
                      alt={product.nombre}
                      className="max-h-full max-w-full object-contain transition-transform hover:scale-105 duration-300"
                    />
                    <Chip color="primary" variant="flat" className="absolute top-2 left-2" size="sm">
                      {product.nombre_categoria}
                    </Chip>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-base mb-1 line-clamp-2">{product.nombre}</h3>
                    <div className="flex items-center mb-2">
                      <Icon icon="lucide:star" className="text-amber-500 text-sm" />
                      <span className="text-sm ml-1">{product.puntuacion}</span>
                    </div>
                    <p className="text-primary font-semibold">${Number(product.precio).toFixed(2)}</p>
                  </div>
                </CardBody>
                <CardFooter className="pt-0">
                  <Button
                    color="primary"
                    variant="flat"
                    fullWidth
                    onPress={() => alert(`Añadido al carrito: ${product.nombre}`)}
                    startContent={<Icon icon="lucide:shopping-cart" />}
                  >
                    Añadir al Carrito
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!loading && selectedCategoryId && products.length === 0 && (
          <p className="text-center text-default-500">No hay productos para esta categoría.</p>
        )}
      </div>
    </section>
  );
};
