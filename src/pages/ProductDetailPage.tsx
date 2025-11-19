import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardBody, CardFooter, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { supabase } from "../lib/supabaseClient";

export interface Product {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  puntuacion: number;
  imagen_url: string;
  id_categoria: number;
  nombre_categoria: string;
  en_oferta: boolean;
  descuento: number;
}

interface ProductDetailPageProps {
  addToCart: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ addToCart }) => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from("productos")
          .select(`*, categorias(id_categoria, nombre_categoria)`)
          .eq("id_producto", Number(id))
          .single();
        if (error) throw error;
        if (!data) {
          setProduct(null);
        } else {
          setProduct({
            id_producto: data.id_producto,
            nombre: data.nombre,
            descripcion: data.descripcion,
            precio: Number(data.precio),
            stock: data.stock,
            puntuacion: Number(data.puntuacion) || 0,
            imagen_url: data.imagen_url,
            id_categoria: data.id_categoria,
            nombre_categoria: data.categorias?.nombre_categoria || "",
            en_oferta: Boolean(data.en_oferta),
            descuento: Number(data.descuento) || 0
          });
        }
      } catch (err) {
        console.error("Error al obtener producto:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <p className="text-center mt-8">Cargando producto...</p>;
  if (!product) return <p className="text-center mt-8">Producto no encontrado</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 md:pb-0">
      <Card className="border border-default-200">
        <CardBody className="p-0 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative bg-white flex items-center justify-center h-64 md:h-96">
              <img
                src={product.imagen_url || "/placeholder-product.jpg"}
                alt={product.nombre}
                loading="lazy"
                className="w-full h-full object-contain transition-transform hover:scale-105 duration-300"
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-product.jpg";
                }}
              />
              <Chip color="primary" variant="flat" className="absolute top-2 left-2" size="sm">
                {product.nombre_categoria}
              </Chip>
            </div>

            <div className="p-4 md:p-6 flex flex-col">
              <h1 className="text-lg md:text-2xl font-bold mb-2">{product.nombre}</h1>
              <div className="flex items-center mb-3">
                <Icon icon="lucide:star" className="text-amber-500" />
                <span className="ml-2 text-sm md:text-base">{product.puntuacion}</span>
              </div>
              <p className="text-default-700 mb-4 text-sm md:text-base">{product.descripcion}</p>

              <div className="mt-auto">
                <p className="text-primary text-2xl md:text-3xl font-semibold mb-2">
                  ${Number(product.precio).toFixed(2)}
                  {product.en_oferta && product.descuento > 0 && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ${(Number(product.precio) / (1 - product.descuento / 100)).toFixed(2)}
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500 mb-4">Stock disponible: {product.stock}</p>
              </div>
            </div>
          </div>
        </CardBody>

        {/* Footer: fijo en móvil para acceso rápido, estático en md+ */}
        <CardFooter className="pt-0 px-4 pb-4 md:pt-0 md:px-6 md:pb-6 md:relative fixed bottom-0 left-0 right-0 md:static bg-white md:bg-transparent border-t md:border-t-0">
          <div className="max-w-4xl mx-auto px-4 md:px-0">
            <Button
              color="primary"
              variant="flat"
              fullWidth
              onPress={() => addToCart(product)}
              startContent={<Icon icon="lucide:shopping-cart" />}
            >
              Añadir al Carrito
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

