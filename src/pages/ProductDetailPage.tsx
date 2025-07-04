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
          .eq("id_producto", id)
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
    <div className="max-w-4xl mx-auto p-4">
      <Card className="border border-default-200">
        <CardBody className="p-0 overflow-hidden">
          <div className="relative h-96 bg-white flex items-center justify-center">
            <img
              src={product.imagen_url || "/placeholder-product.jpg"}
              alt={product.nombre}
              className="max-h-full max-w-full object-contain transition-transform hover:scale-105 duration-300"
              onError={e => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder-product.jpg";
              }}
            />
            <Chip color="primary" variant="flat" className="absolute top-2 left-2" size="sm">
              {product.nombre_categoria}
            </Chip>
          </div>
          <div className="p-6">
            <h1 className="text-xl font-bold mb-2">{product.nombre}</h1>
            <div className="flex items-center mb-4">
              <Icon icon="lucide:star" className="text-amber-500" />
              <span className="ml-2">{product.puntuacion}</span>
            </div>
            <p className="text-default-700 mb-4">{product.descripcion}</p>
            <p className="text-primary text-2xl font-semibold mb-4">
              ${Number(product.precio).toFixed(2)}
              {product.en_oferta && product.descuento > 0 && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  ${(Number(product.precio) / (1 - product.descuento / 100)).toFixed(2)}
                </span>
              )}
            </p>
            <p className="text-sm text-gray-500">Stock disponible: {product.stock}</p>
          </div>
        </CardBody>
        <CardFooter className="pt-0 px-6 pb-6">
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
    </div>
  );
};

