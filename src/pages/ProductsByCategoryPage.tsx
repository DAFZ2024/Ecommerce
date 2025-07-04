import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardBody, CardFooter, Button, Chip, Spinner } from "@heroui/react";
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

interface ProductsByCategoryPageProps {
  addToCart: (product: Product) => void;
}

// Mapeo completo de categorías para URLs amigables
const categorySlugMap: { [key: string]: string } = {
  // Categorías existentes
  'aceites-motos': 'aceites de moto',           // ID: 1
  'aceites-autos': 'Aceites para auto',         // ID: 2
  'filtros': 'Filtros',                         // ID: 3
  'baterias': 'Baterias',                       // ID: 4
  'neumaticos': 'Neumaticos',                   // ID: 5
  'herramientas': 'Herramientas',               // ID: 6
  
  // Categorías faltantes - AGREGA ESTAS
  'lubricantes': 'Lubricantes',                 // ID: 7
  'accesorios': 'Accesorios',                   // ID: 8
  'repuestos': 'Repuestos',                     // ID: 9
  'electronica': 'Electronica'                  // ID: 10
};

export const ProductsByCategoryPage: React.FC<ProductsByCategoryPageProps> = ({ addToCart }) => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryName = categorySlug ? categorySlugMap[categorySlug] : '';

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      if (!categoryName) {
        setError('Categoría no encontrada');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Consulta directa a Supabase filtrando por nombre de categoría
        const { data, error: supabaseError } = await supabase
          .from('productos')
          .select(`id_producto, nombre, descripcion, precio, stock, puntuacion, imagen_url, id_categoria, nombre_categoria, en_oferta, descuento`)
          .eq('nombre_categoria', categoryName);

        if (supabaseError) {
          throw supabaseError;
        }
        setProducts(data || []);
        setError(null);
      } catch (err) {
        console.error("Error al obtener productos por categoría:", err);
        setError('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByCategory();
  }, [categorySlug, categoryName]);

  const calculateOriginalPrice = (precio: number, descuento: number) => {
    return precio / (1 - descuento / 100);
  };

  // Restaurar función para navegación al detalle de producto
  const handleProductClick = (productId: number) => {
    navigate(`/producto/${productId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-12">
          <Icon icon="lucide:alert-circle" className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <Button 
            color="primary" 
            variant="flat" 
            className="mt-4"
            onPress={() => navigate('/')}
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header de la categoría */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <span 
            className="cursor-pointer hover:text-primary"
            onClick={() => navigate('/')}
          >
            Inicio
          </span>
          <Icon icon="lucide:chevron-right" className="text-xs" />
          <span className="text-primary font-medium">{categoryName}</span>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-slate-700 p-3 rounded-lg">
            <Icon icon="lucide:car" className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{categoryName}</h1>
            <p className="text-slate-600">
              {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <Icon icon="lucide:package-x" className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">No hay productos disponibles</h2>
          <p className="text-gray-500 mb-4">
            No encontramos productos en la categoría "{categoryName}" en este momento.
          </p>
          <Button 
            color="primary" 
            variant="flat"
            onPress={() => navigate('/')}
          >
            Ver todos los productos
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card 
              key={product.id_producto} 
              className="border border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
              isPressable
              onPress={() => handleProductClick(product.id_producto)}
            >
              <CardBody className="p-0 overflow-hidden">
                <div className="relative h-48 bg-white flex items-center justify-center p-4">
                  <img
                    src={product.imagen_url}
                    alt={product.nombre}
                    className="max-h-full max-w-full object-contain transition-transform hover:scale-105 duration-300"
                  />
                  {product.en_oferta && product.descuento > 0 && (
                    <Chip 
                      color="danger" 
                      variant="flat" 
                      className="absolute top-2 left-2" 
                      size="sm"
                    >
                      -{product.descuento}%
                    </Chip>
                  )}
                  <Chip 
                    color="primary" 
                    variant="flat" 
                    className="absolute top-2 right-2" 
                    size="sm"
                  >
                    {product.nombre_categoria}
                  </Chip>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2">
                    {product.nombre}
                  </h3>
                  
                  <div className="flex items-center mb-3">
                    <Icon icon="lucide:star" className="text-amber-500 text-sm" />
                    <span className="ml-1 text-sm text-slate-600">{product.puntuacion}</span>
                    <span className="ml-auto text-xs text-slate-500">
                      Stock: {product.stock}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-slate-800">
                        ${Number(product.precio).toFixed(2)}
                      </span>
                      {product.en_oferta && product.descuento > 0 && (
                        <span className="text-sm text-slate-500 line-through">
                          ${calculateOriginalPrice(product.precio, product.descuento).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
              
              <CardFooter className="pt-0 px-4 pb-4">
                <Button
                  color="primary"
                  variant="flat"
                  fullWidth
                  size="sm"
                  onPress={() => {
                    addToCart(product);
                  }}
                  startContent={<Icon icon="lucide:shopping-cart" className="text-sm" />}
                >
                  Añadir
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};