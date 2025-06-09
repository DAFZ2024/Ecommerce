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
        // Ordenar por descuento de mayor a menor
        const sortedOffers = data.sort((a: Product, b: Product) => 
          (b.descuento ?? 0) - (a.descuento ?? 0)
        );
        setOffers(sortedOffers);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar ofertas:", err);
        setLoading(false);
      });
  }, []);

  const topOffers = offers.slice(0, 3);
  const regularOffers = offers.slice(3);

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
          <>
            {/* Mejores 3 ofertas - Destacadas */}
            {topOffers.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Icon icon="lucide:crown" className="text-amber-500 text-2xl" />
                  <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    ¡MEJORES OFERTAS!
                  </h3>
                  <Icon icon="lucide:crown" className="text-amber-500 text-2xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topOffers.map((product, index) => (
                    <FeaturedOfferCard 
                      key={product.id_producto} 
                      product={product} 
                      addToCart={addToCart}
                      rank={index + 1}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Resto de ofertas */}
            {regularOffers.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-6 text-center text-default-700">
                  Más Ofertas Disponibles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularOffers.map((product) => (
                    <OfferCard key={product.id_producto} product={product} addToCart={addToCart} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

interface FeaturedOfferCardProps {
  product: Product;
  addToCart: (product: Product) => void;
  rank: number;
}

const FeaturedOfferCard: React.FC<FeaturedOfferCardProps> = ({ product, addToCart, rank }) => {
  const discountPercentage = product.descuento ?? 0;
  const stockLeft = product.stock ?? 10;
  const stockPercentage = Math.min((stockLeft / 20) * 100, 100);

  const rankColors = {
    1: "from-amber-400 to-amber-600",
    2: "from-gray-300 to-gray-500", 
    3: "from-amber-600 to-amber-800"
  };

  const rankIcons = {
    1: "lucide:trophy",
    2: "lucide:medal", 
    3: "lucide:award"
  };

  return (
    <Card className="border-2 border-amber-300 shadow-2xl relative overflow-hidden transform hover:scale-105 transition-all duration-300">
      {/* Efecto de brillo animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-pulse duration-1000"></div>
      
      {/* Badge de ranking */}
      <div className={`absolute top-2 right-2 w-8 h-8 bg-gradient-to-br ${rankColors[rank as keyof typeof rankColors]} rounded-full flex items-center justify-center z-10 shadow-lg`}>
        <Icon icon={rankIcons[rank as keyof typeof rankIcons]} className="text-white text-sm" />
      </div>

      <CardBody className="p-0 overflow-hidden">
        <div className="relative h-52 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
          <img
            src={`http://localhost:3001${product.imagen_url}`}
            alt={product.nombre}
            className="max-h-full max-w-full object-contain transition-transform hover:scale-110 duration-300"
          />
          <Chip 
            color="danger" 
            className="absolute top-2 left-2 font-bold text-white shadow-lg animate-pulse" 
            size="lg"
          >
            -{discountPercentage}% OFF
          </Chip>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-white to-amber-50">
          <h3 className="font-bold text-lg mb-2 text-gray-800">{product.nombre}</h3>
          
          <div className="flex items-center mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Icon 
                  key={i}
                  icon="lucide:star" 
                  className={`text-lg ${i < Math.floor(product.puntuacion) ? 'text-amber-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-sm ml-2 font-medium">({product.puntuacion})</span>
          </div>
          
          <div className="flex items-center gap-3 mb-3">
            <p className="text-2xl font-bold text-green-600">
              ${Number(product.precio).toFixed(2)}
            </p>
            {discountPercentage > 0 && (
              <div className="flex flex-col">
                <p className="text-gray-500 text-sm line-through">
                  ${(product.precio / (1 - discountPercentage / 100)).toFixed(2)}
                </p>
                <p className="text-green-600 text-xs font-semibold">
                  Ahorras ${((product.precio / (1 - discountPercentage / 100)) - product.precio).toFixed(2)}
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Stock disponible</span>
              <span className="text-red-600 font-bold animate-pulse">
                ¡Solo {stockLeft} restantes!
              </span>
            </div>
            <Progress
              size="md"
              value={stockPercentage}
              color={stockPercentage < 30 ? "danger" : "warning"}
              className="h-2"
            />
          </div>
        </div>
      </CardBody>
      
      <CardFooter className="pt-0 bg-gradient-to-r from-amber-50 to-orange-50">
        <Button
          color="warning"
          variant="solid"
          fullWidth
          size="lg"
          onPress={() => addToCart(product)}
          startContent={<Icon icon="lucide:shopping-cart" />}
          className="font-bold text-white shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          ¡COMPRAR AHORA!
        </Button>
      </CardFooter>
    </Card>
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
    <Card className="border border-default-200 hover:shadow-lg transition-shadow duration-300">
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
