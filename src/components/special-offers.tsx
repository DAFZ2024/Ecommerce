import React, { useEffect, useState } from "react";
import { Card, CardBody, CardFooter, Button, Chip, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { supabase } from "../lib/supabaseClient";
import { Product } from "../App";
import { Link } from "react-router-dom";

interface SpecialOffersProps {
  addToCart: (product: Product) => void;
}

export const SpecialOffers: React.FC<SpecialOffersProps> = ({ addToCart }) => {
  const [offers, setOffers] = useState<Product[]>([]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select(`*, categorias!inner(id_categoria, nombre_categoria)`)
          .eq('en_oferta', true)
          .gt('descuento', 0)
          .order('descuento', { ascending: false });
        if (error) throw error;
        const transformed: Product[] = (data || []).map((item: any) => ({
          id_producto: item.id_producto,
          nombre: item.nombre,
          descripcion: item.descripcion,
          precio: Number(item.precio),
          stock: item.stock,
          puntuacion: Number(item.puntuacion) || 0,
          imagen_url: item.imagen_url,
          id_categoria: item.id_categoria,
          nombre_categoria: item.categorias.nombre_categoria,
          en_oferta: Boolean(item.en_oferta),
          descuento: Number(item.descuento) || 0
        }));
        setOffers(transformed);
      } catch (err) {
        console.error("Error cargando ofertas:", err);
      }
    };
    fetchOffers();
  }, []);

  const topOffers = offers.slice(0, 3);
  const regularOffers = offers.slice(3, 6);

  return (
    <section className="py-12 px-4 bg-gradient-to-r from-primary-50 to-primary-100">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Ofertas Especiales</h2>
            <p className="text-default-500">¡Aprovecha estos descuentos por tiempo limitado!</p>
          </div>
          <Link to="/ofertas">
            <Button variant="light" color="primary" endContent={<Icon icon="lucide:arrow-right" />}>
              Ver todas las ofertas
            </Button>
          </Link>
        </div>

        {/* Top 3 ofertas destacadas */}
        {topOffers.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Icon icon="lucide:zap" className="text-amber-500 text-xl animate-pulse" />
              <h3 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                ¡OFERTAS IMPERDIBLES!
              </h3>
              <Icon icon="lucide:zap" className="text-amber-500 text-xl animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Ofertas regulares */}
        {regularOffers.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center text-default-700">
              Más Ofertas Disponibles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {regularOffers.map((product) => (
                <OfferCard key={product.id_producto} product={product} addToCart={addToCart} />
              ))}
            </div>
          </div>
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
  const discountPercentage = product.descuento || 0;
  const stockLeft = product.stock;
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

  const cardGradients = {
    1: "from-amber-100 to-amber-200",
    2: "from-gray-100 to-gray-200",
    3: "from-orange-100 to-orange-200"
  };

  return (
    <Card className="border-2 border-amber-300 shadow-xl relative overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
      {/* Efecto de brillo animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-pulse duration-1500"></div>
      
      {/* Badge de ranking */}
      <div className={`absolute top-2 right-2 w-7 h-7 bg-gradient-to-br ${rankColors[rank as keyof typeof rankColors]} rounded-full flex items-center justify-center z-10 shadow-lg`}>
        <Icon icon={rankIcons[rank as keyof typeof rankIcons]} className="text-white text-xs" />
      </div>

      <CardBody className="p-0 overflow-hidden">
        <div className={`relative h-48 bg-gradient-to-br ${cardGradients[rank as keyof typeof cardGradients]} flex items-center justify-center`}>
          <img
            src={product.imagen_url}
            alt={product.nombre}
            className="max-h-full max-w-full object-contain transition-transform hover:scale-110 duration-300"
          />
          <Chip 
            color="danger" 
            className="absolute top-2 left-2 font-bold text-white shadow-lg animate-pulse" 
            size="md"
          >
            -{discountPercentage}% OFF
          </Chip>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-white to-amber-50">
          <h3 className="font-bold text-base mb-2 text-gray-800">{product.nombre}</h3>
          
          <div className="flex items-center mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Icon 
                  key={i}
                  icon="lucide:star" 
                  className={`text-sm ${i < Math.floor(product.puntuacion) ? 'text-amber-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-xs ml-1 font-medium">({product.puntuacion})</span>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <p className="text-lg font-bold text-green-600">
              ${Number(product.precio).toFixed(2)}
            </p>
            {discountPercentage > 0 && (
              <div className="flex flex-col">
                <p className="text-gray-500 text-xs line-through">
                  ${(Number(product.precio) / (1 - discountPercentage / 100)).toFixed(2)}
                </p>
                <p className="text-green-600 text-xs font-semibold">
                  Ahorras ${((Number(product.precio) / (1 - discountPercentage / 100)) - Number(product.precio)).toFixed(2)}
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium">Stock</span>
              <span className="text-red-600 font-bold animate-pulse">
                ¡{stockLeft} restantes!
              </span>
            </div>
            <Progress
              size="sm"
              value={stockPercentage}
              color={stockPercentage < 30 ? "danger" : "warning"}
              className="h-1.5"
            />
          </div>
        </div>
      </CardBody>
      
      <CardFooter className="pt-0 bg-gradient-to-r from-amber-50 to-orange-50">
        <Button
          color="warning"
          variant="solid"
          fullWidth
          onPress={() => addToCart(product)}
          startContent={<Icon icon="lucide:shopping-cart" />}
          className="font-bold text-white shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          ¡AGREGAR YA!
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
  const discountPercentage = product.descuento || 0;
  const stockLeft = product.stock;
  const stockPercentage = Math.min((stockLeft / 20) * 100, 100);

  return (
    <Card className="border border-default-200 hover:shadow-lg transition-shadow duration-300">
      <CardBody className="p-0 overflow-hidden">
        <div className="relative h-48 bg-white flex items-center justify-center">
          <img
            src={product.imagen_url}
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
            <div className="flex items-center">
              <Icon icon="lucide:star" className="text-amber-500 text-sm" />
              <span className="text-sm ml-1">{product.puntuacion}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-primary font-semibold">${Number(product.precio).toFixed(2)}</p>
            {product.descuento > 0 && (
              <p className="text-default-400 text-sm line-through">
                {(Number(product.precio) / (1 - product.descuento / 100)).toFixed(2)}
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