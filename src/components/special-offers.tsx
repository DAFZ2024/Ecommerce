import React from "react";
import { Card, CardBody, CardFooter, Button, Chip, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Product } from "../App";
import { Link } from "react-router-dom";

interface SpecialOffersProps {
  addToCart: (product: Product) => void;
}

const specialOffers: Product[] = [
  {
    id: 5,
    name: "Kit Completo de Aceite y Filtros",
    price: 49.99,
    originalPrice: 79.99,
    image: "https://img.heroui.chat/image/car?w=400&h=300&u=14",
    category: "Kits",
    rating: 4.9,
    isOnSale: true,
  },
  {
    id: 6,
    name: "Aceite Sintético Premium 5W-40",
    price: 27.99,
    originalPrice: 39.99,
    image: "https://img.heroui.chat/image/car?w=400&h=300&u=15",
    category: "Aceites para Autos",
    rating: 4.7,
    isOnSale: true,
  },
  {
    id: 7,
    name: "Set de Herramientas para Motocicletas",
    price: 45.50,
    originalPrice: 65.99,
    image: "https://img.heroui.chat/image/car?w=400&h=300&u=16",
    category: "Herramientas",
    rating: 4.6,
    isOnSale: true,
  },
];

export const SpecialOffers: React.FC<SpecialOffersProps> = ({ addToCart }) => {
  return (
    <section className="py-12 px-4 bg-gradient-to-r from-primary-50 to-primary-100">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Ofertas Especiales</h2>
            <p className="text-default-500">¡Aprovecha estos descuentos por tiempo limitado!</p>
          </div>
          <Link to="/ofertas">
          <Button 
            variant="light" 
            color="primary" 
            endContent={<Icon icon="lucide:arrow-right" />}
          >
            Ver todas las ofertas
          </Button></Link>
          
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {specialOffers.map((product) => (
            <OfferCard key={product.id} product={product} addToCart={addToCart} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface OfferCardProps {
  product: Product;
  addToCart: (product: Product) => void;
}

const OfferCard: React.FC<OfferCardProps> = ({ product, addToCart }) => {
  // Calculate discount percentage
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;
  
  // Use a static value instead of React.useMemo for stock
  const stockLeft = 5 + Math.floor(Math.random() * 15);
  const stockPercentage = (stockLeft / 20) * 100;
  
  return (
    <Card className="border border-default-200">
      <CardBody className="p-0 overflow-hidden">
        <div className="relative h-48 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
          />
          {discountPercentage > 0 && (
            <Chip 
              color="danger" 
              className="absolute top-2 left-2 font-medium"
              size="sm"
            >
              -{discountPercentage}%
            </Chip>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-base mb-1">{product.name}</h3>
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <Icon icon="lucide:star" className="text-amber-500 text-sm" />
              <span className="text-sm ml-1">{product.rating}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-primary font-semibold">${product.price.toFixed(2)}</p>
            {product.originalPrice && (
              <p className="text-default-400 text-sm line-through">${product.originalPrice.toFixed(2)}</p>
            )}
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Stock disponible</span>
              <span className="text-danger font-medium">{stockLeft} restantes</span>
            </div>
            <Progress 
              size="sm" 
              value={stockPercentage} 
              color={stockPercentage < 30 ? "danger" : "primary"}
              className="h-1"
            />
          </div>
        </div>
      </CardBody>
      <CardFooter className="pt-0">
        <Button 
          color="primary" 
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