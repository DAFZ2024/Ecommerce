import React, { useEffect, useState } from "react";
import { Card, CardBody, CardFooter, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { Product } from "../App";

interface FeaturedProductsProps {
  addToCart: (product: Product) => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ addToCart }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    axios
      .get("/api/productos/destacados")
      .then((res) => setFeaturedProducts(res.data))
      .catch((err) => console.error("Error al cargar productos destacados:", err));
  }, []);

  const visibleProducts = showAll ? featuredProducts : featuredProducts.slice(0, 4);

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Productos Destacados</h2>
            <p className="text-default-500">Los productos más populares entre nuestros clientes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id_producto} product={product} addToCart={addToCart} />
          ))}
        </div>

        {featuredProducts.length > 4 && (
          <div className="flex justify-center mt-6">
            {!showAll ? (
              <Button
                variant="solid"
                color="primary"
                endContent={<Icon icon="lucide:arrow-down" />}
                onClick={() => setShowAll(true)}
              >
                Ver todos
              </Button>
            ) : (
              <Button
                variant="light"
                color="primary"
                endContent={<Icon icon="lucide:arrow-up" />}
                onClick={() => setShowAll(false)}
              >
                Mostrar menos
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

interface ProductCardProps {
  product: Product;
  addToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, addToCart }) => {
  return (
    <Card className="border border-default-200">
      <CardBody className="p-0 overflow-hidden">
        <div className="relative h-48 bg-white flex items-center justify-center">
          <img
            src={`http://localhost:3001${product.imagen_url}`}
            alt={product.nombre}
            className="max-h-full max-w-full object-contain transition-transform hover:scale-105 duration-300"
          />
          <Chip
            color="primary"
            variant="flat"
            className="absolute top-2 left-2"
            size="sm"
          >
            {product.nombre_categoria}
          </Chip>
        </div>
        <div className="p-4">
          <h3 className="font-medium text-base mb-1 line-clamp-2">{product.nombre}</h3>
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <Icon icon="lucide:star" className="text-amber-500 text-sm" />
              <span className="text-sm ml-1">{product.puntuacion}</span>
            </div>
          </div>
          <p className="text-primary font-semibold">${Number(product.precio).toFixed(2)}</p>
        </div>
      </CardBody>
      <CardFooter className="pt-0">
        <Button
          color="primary"
          variant="flat"
          fullWidth
          onPress={() => addToCart(product)}
          startContent={<Icon icon="lucide:shopping-cart" />}
        >
          Añadir al Carrito
        </Button>
      </CardFooter>
    </Card>
  );
};
