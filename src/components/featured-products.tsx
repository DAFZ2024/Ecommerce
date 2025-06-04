import React from "react";
import { Card, CardBody, CardFooter, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Product } from "../App";

interface FeaturedProductsProps {
  addToCart: (product: Product) => void;
}

const featuredProducts: Product[] = [
  {
    id: 1,
    name: "Aceite Sintético 10W-40 para Motos",
    price: 24.99,
    image: "https://img.heroui.chat/image/car?w=400&h=300&u=10",
    category: "Aceites para Motos",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Aceite de Motor 5W-30 Sintético",
    price: 32.99,
    image: "https://img.heroui.chat/image/car?w=400&h=300&u=11",
    category: "Aceites para Autos",
    rating: 4.9,
  },
  {
    id: 3,
    name: "Kit de Filtros de Aire Premium",
    price: 18.50,
    image: "https://img.heroui.chat/image/car?w=400&h=300&u=12",
    category: "Filtros",
    rating: 4.7,
  },
  {
    id: 4,
    name: "Batería de Alto Rendimiento 12V",
    price: 89.99,
    image: "https://img.heroui.chat/image/car?w=400&h=300&u=13",
    category: "Baterías",
    rating: 4.6,
  },
];

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ addToCart }) => {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Productos Destacados</h2>
            <p className="text-default-500">Los productos más populares entre nuestros clientes</p>
          </div>
          <Button 
            variant="light" 
            color="primary" 
            endContent={<Icon icon="lucide:arrow-right" />}
          >
            Ver todos
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} />
          ))}
        </div>
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
        <div className="relative h-48 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
          />
          <Chip 
            color="primary" 
            variant="flat" 
            className="absolute top-2 left-2"
            size="sm"
          >
            {product.category}
          </Chip>
        </div>
        <div className="p-4">
          <h3 className="font-medium text-base mb-1 line-clamp-2">{product.name}</h3>
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <Icon icon="lucide:star" className="text-amber-500 text-sm" />
              <span className="text-sm ml-1">{product.rating}</span>
            </div>
          </div>
          <p className="text-primary font-semibold">${product.price.toFixed(2)}</p>
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