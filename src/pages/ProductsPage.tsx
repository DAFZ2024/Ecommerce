import React, { useState, useEffect } from "react";
import { Card, CardBody, CardFooter, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { supabase } from "../lib/supabaseClient";
import { Product } from "../App"; // Importar la interfaz Product
import { Link } from "react-router-dom";

interface ProductsPageProps {
  addToCart: (product: Product) => void; // Agregar prop addToCart
}

const categories = [
  { id: 1, name: "Aceites para Motos", icon: "lucide:droplet", color: "text-blue-500", bgColor: "bg-blue-100", hoverBg: "hover:bg-blue-200", gradientFrom: "from-blue-400", gradientTo: "to-blue-600" },
  { id: 2, name: "Aceites para Autos", icon: "lucide:fuel", color: "text-green-500", bgColor: "bg-green-100", hoverBg: "hover:bg-green-200", gradientFrom: "from-green-400", gradientTo: "to-green-600" },
  { id: 3, name: "Filtros", icon: "lucide:filter", color: "text-amber-500", bgColor: "bg-amber-100", hoverBg: "hover:bg-amber-200", gradientFrom: "from-amber-400", gradientTo: "to-amber-600" },
  { id: 4, name: "Baterías", icon: "lucide:battery-charging", color: "text-red-500", bgColor: "bg-red-100", hoverBg: "hover:bg-red-200", gradientFrom: "from-red-400", gradientTo: "to-red-600" },
  { id: 5, name: "Neumáticos", icon: "lucide:circle-dot", color: "text-purple-500", bgColor: "bg-purple-100", hoverBg: "hover:bg-purple-200", gradientFrom: "from-purple-400", gradientTo: "to-purple-600" },
  { id: 6, name: "Herramientas", icon: "lucide:wrench", color: "text-gray-500", bgColor: "bg-gray-100", hoverBg: "hover:bg-gray-200", gradientFrom: "from-gray-400", gradientTo: "to-gray-600" },
  { id: 7, name: "Lubricantes", icon: "lucide:glass-water", color: "text-yellow-600", bgColor: "bg-yellow-100", hoverBg: "hover:bg-yellow-200", gradientFrom: "from-yellow-400", gradientTo: "to-yellow-600" },
  { id: 8, name: "Accesorios", icon: "lucide:store", color: "text-pink-500", bgColor: "bg-pink-100", hoverBg: "hover:bg-pink-200", gradientFrom: "from-pink-400", gradientTo: "to-pink-600" },
  { id: 9, name: "Repuestos", icon: "lucide:settings", color: "text-cyan-500", bgColor: "bg-cyan-100", hoverBg: "hover:bg-cyan-200", gradientFrom: "from-cyan-400", gradientTo: "to-cyan-600" },
  { id: 10, name: "Electrónica", icon: "lucide:cpu", color: "text-indigo-500", bgColor: "bg-indigo-100", hoverBg: "hover:bg-indigo-200", gradientFrom: "from-indigo-400", gradientTo: "to-indigo-600" },
];

export const ProductsPage: React.FC<ProductsPageProps> = ({ addToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedCategoryId) {
      setProducts([]);
      return;
    }
    
    const fetchProductsByCategory = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('productos')
          .select(`
            *,
            categorias!inner(
              id_categoria,
              nombre_categoria
            )
          `)
          .eq('id_categoria', selectedCategoryId);

        if (error) {
          console.error('Error fetching products:', error);
          setProducts([]);
        } else {
          // Transformar los datos para mantener compatibilidad con la interfaz Product
          const transformedProducts: Product[] = data.map((item: any) => ({
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
          setProducts(transformedProducts);
        }
      } catch (err) {
        console.error('Error:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByCategory();
  }, [selectedCategoryId]);

  const handleCategoryClick = (id: number) => {
    if (selectedCategoryId === id) {
      setSelectedCategoryId(null);
      setProducts([]);
    } else {
      setSelectedCategoryId(id);
    }
  };

  const handleAddToCart = (product: Product) => {
    try {
      console.log("🛒 Agregando producto desde página de productos:", product);
      addToCart(product);
      // Opcional: mostrar una notificación de éxito
      //alert(`✅ ${product.nombre} agregado al carrito`);
    } catch (error) {
      console.error("❌ Error al agregar producto al carrito:", error);
      alert("Error al agregar el producto al carrito");
    }
  };

  return (
    <section className="py-12 px-4 bg-gradient-to-br from-content1 to-default-50">
      <div className="container mx-auto">
        {/* Header con efectos mejorados */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Categorías Populares
          </h2>
          <p className="text-default-500 text-lg">Selecciona una categoría para ver los productos</p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Grid de categorías con efectos mejorados */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          {categories.map((category) => (
            <Card
              key={category.id}
              isPressable
              className={`
                group relative overflow-hidden border-2 transition-all duration-500 ease-out cursor-pointer
                hover:shadow-2xl hover:-translate-y-2 hover:rotate-1
                ${selectedCategoryId === category.id 
                  ? `border-primary shadow-lg bg-gradient-to-br ${category.gradientFrom} ${category.gradientTo} text-white` 
                  : `border-default-200 hover:border-primary/50 bg-white/80 backdrop-blur-sm ${category.hoverBg}`
                }
              `}
              onClick={() => handleCategoryClick(category.id)}
            >
              {/* Efecto de brillo animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {/* Partículas decorativas */}
              <div className="absolute top-2 right-2 w-2 h-2 bg-primary/30 rounded-full animate-pulse"></div>
              <div className="absolute bottom-2 left-2 w-1 h-1 bg-secondary/40 rounded-full animate-bounce"></div>
              
              <CardBody className="relative flex flex-col items-center justify-center p-6 text-center z-10">
                {/* Contenedor del icono con efectos mejorados */}
                <div className={`
                  relative w-16 h-16 rounded-full flex items-center justify-center mb-4
                  transition-all duration-300 group-hover:scale-110 group-hover:rotate-12
                  ${selectedCategoryId === category.id 
                    ? 'bg-white/20 backdrop-blur-sm' 
                    : `${category.bgColor} group-hover:shadow-lg`
                  }
                `}>
                  {/* Anillo exterior animado */}
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20 animate-spin" style={{ animationDuration: '3s' }}></div>
                  
                  <Icon 
                    icon={category.icon} 
                    className={`
                      text-3xl transition-all duration-300 group-hover:scale-110
                      ${selectedCategoryId === category.id 
                        ? 'text-white drop-shadow-lg' 
                        : `${category.color} group-hover:drop-shadow-md`
                      }
                    `} 
                  />
                </div>
                
                <h3 className={`
                  font-semibold text-sm md:text-base transition-all duration-300
                  ${selectedCategoryId === category.id 
                    ? 'text-white drop-shadow-sm' 
                    : 'text-default-700 group-hover:text-primary'
                  }
                `}>
                  {category.name}
                </h3>
                
                {/* Indicador de selección */}
                {selectedCategoryId === category.id && (
                  <div className="absolute top-3 right-3">
                    <Icon icon="lucide:check-circle" className="text-white text-lg drop-shadow-md" />
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Loading state mejorado */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-default-500 text-lg">Cargando productos...</p>
          </div>
        )}

        {/* Grid de productos con efectos mejorados */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Card 
                key={product.id_producto} 
                className="
                  group border border-default-200 transition-all duration-500 ease-out
                  hover:shadow-2xl hover:-translate-y-3 hover:border-primary/50
                  bg-white/90 backdrop-blur-sm overflow-hidden
                "
              >
                <CardBody className="p-0 overflow-hidden">
                  {/* Container de imagen con efectos mejorados */}
                  <div className="relative h-48 bg-gradient-to-br from-white to-default-50 flex items-center justify-center overflow-hidden">
                    {/* Efecto de overlay en hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Imagen del producto */}
                    <img
                      src={product.imagen_url}
                      alt={product.nombre}
                      className="
                        max-h-full max-w-full object-contain transition-all duration-500
                        group-hover:scale-110 group-hover:rotate-2 z-10 relative
                        filter group-hover:brightness-110 group-hover:contrast-110
                      "
                    />
                    
                    {/* Chip de categoría mejorado */}
                    <Chip 
                      color="primary" 
                      variant="flat" 
                      className="
                        absolute top-3 left-3 backdrop-blur-md bg-primary/10 border border-primary/20
                        transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/20
                      " 
                      size="sm"
                    >
                      {product.nombre_categoria}
                    </Chip>
                    
                    {/* Efectos decorativos */}
                    <div className="absolute top-2 right-2 w-2 h-2 bg-primary/20 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-2 left-2 w-1 h-1 bg-secondary/30 rounded-full animate-bounce delay-100"></div>
                  </div>
                  
                  {/* Contenido del producto */}
                  <div className="p-5 relative">
                    <h3 className="font-semibold text-base mb-2 text-default-800 group-hover:text-primary transition-colors duration-300"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                      {product.nombre}
                    </h3>
                    
                    {/* Rating con efectos */}
                    <div className="flex items-center mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Icon 
                            key={i}
                            icon="lucide:star" 
                            className={`
                              text-sm transition-all duration-300 group-hover:scale-110
                              ${i < Math.floor(product.puntuacion) ? 'text-amber-500' : 'text-default-300'}
                            `}
                            style={{ animationDelay: `${i * 50}ms` }}
                          />
                        ))}
                      </div>
                      <span className="text-sm ml-2 text-default-600 group-hover:text-default-800 transition-colors duration-300">
                        {product.puntuacion}
                      </span>
                    </div>
                    
                    {/* Precio con efectos */}
                    <div className="flex items-center justify-between">
                      <p className="text-primary font-bold text-lg group-hover:scale-105 transition-transform duration-300">
                        ${Number(product.precio).toFixed(2)}
                      </p>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Icon icon="lucide:trending-up" className="text-success text-sm" />
                      </div>
                    </div>
                  </div>
                </CardBody>
                
                {/* Footer con botón mejorado */}
                <CardFooter className="pt-0 px-5 pb-5">
                  <Button
                    color="primary"
                    variant="flat"
                    fullWidth
                    onPress={() => handleAddToCart(product)}
                    startContent={<Icon icon="lucide:shopping-cart" />}
                    className="
                      group-hover:bg-primary group-hover:text-white
                      transition-all duration-300 font-medium
                      hover:scale-105 hover:shadow-lg
                    "
                  >
                    Añadir al Carrito
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Estado vacío mejorado */}
        {!loading && selectedCategoryId && products.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-default-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="lucide:package-x" className="text-4xl text-default-400" />
            </div>
            <p className="text-default-500 text-lg">No hay productos para esta categoría.</p>
          </div>
        )}
      </div>
    </section>
  );
};