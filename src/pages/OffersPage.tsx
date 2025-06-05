import React, { useEffect, useState } from "react";
import { Card, CardBody, CardFooter, Button, Chip, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Product } from "../App";

interface OffersPageProps {
  addToCart: (product: Product) => void;
}

export const OffersPage: React.FC<OffersPageProps> = ({ addToCart }) => {
  const [offers, setOffers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/productos/ofertas")
      .then((res) => res.json())
      .then((data) => {
        setOffers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar ofertas:", err);
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-12 px-4 bg-gradient-to-br from-primary-50 to-primary-100 min-h-screen">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-2 text-center">Todas las Ofertas Especiales</h2>
        <p className="text-default-500 text-center mb-10">
          Encuentra descuentos exclusivos por tiempo limitado
        </p>

        {loading ? (
          <p className="text-center">Cargando ofertas...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((product) => (
              <OfferCard key={product.id_producto} product={product} addToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

interface OfferCardProps {
  product: Product;
  addToCart: (product: Product) => void;
}

const OfferCard: React.FC<OfferCardProps> = ({ product, addToCart }) => {
  const discountPercentage = product.descuento ?? 0;

  const stockLeft = product.stock ?? 10;
  const stockPercentage = Math.min((stockLeft / 20) * 100, 100);

  return (
    <Card className="border border-default-200">
      <CardBody className="p-0 overflow-hidden">
        <div className="relative h-48 bg-white flex items-center justify-center">
          <img
            src={`http://localhost:3001${product.imagen_url}`}
            alt={product.nombre}
            className="max-h-full max-w-full object-contain transition-transform hover:scale-105 duration-300"
          />
          {discountPercentage > 0 && (
            <Chip color="danger" className="absolute top-2 left-2 font-medium" size="sm">
              -{discountPercentage}%
            </Chip>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-base mb-1">{product.nombre}</h3>
          <div className="flex items-center mb-2">
            <Icon icon="lucide:star" className="text-amber-500 text-sm" />
            <span className="text-sm ml-1">{product.puntuacion}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-primary font-semibold">${Number(product.precio).toFixed(2)}</p>
            {discountPercentage > 0 && (
              <p className="text-default-400 text-sm line-through">
                ${(product.precio / (1 - discountPercentage / 100)).toFixed(2)}
              </p>
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

