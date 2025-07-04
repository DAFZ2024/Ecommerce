import React, { useEffect, useState } from "react";
import { Card, CardBody, CardFooter, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { supabase } from "../lib/supabaseClient";
import { Product } from "../App";

interface FeaturedProductsProps {
  addToCart: (product: Product) => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ addToCart }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select(`*, categorias!inner(id_categoria, nombre_categoria)`)
          .order('puntuacion', { ascending: false })
          .limit(12); // Puedes ajustar el límite si quieres mostrar más
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
        setFeaturedProducts(transformed);
      } catch (err) {
        console.error("Error al cargar productos destacados:", err);
      }
    };
    fetchFeatured();
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
  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <Card className="border border-default-200">
      <CardBody className="p-0 overflow-hidden">
        <div className="relative h-48 bg-white flex items-center justify-center">
          <img
            src={product.imagen_url}
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
          onClick={handleAddToCart}
          startContent={<Icon icon="lucide:shopping-cart" />}
        >
          Añadir al Carrito
        </Button>
      </CardFooter>
    </Card>
  );
};