import React, { useState, useEffect } from "react";
import { Card, CardBody, CardFooter, Button, Chip, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { supabase } from "../lib/supabaseClient";
import { Product } from "../App";

interface ProductsPageProps {
  addToCart: (product: Product) => void;
}

// Mapeo de iconos y estilos por nombre de categoría
const categoryIconMap: Record<string, { icon: string; color: string; bgColor: string; hoverBg: string; gradientFrom: string; gradientTo: string }> = {
  "Aceites para Motos": { icon: "lucide:droplet", color: "text-blue-500", bgColor: "bg-blue-100", hoverBg: "hover:bg-blue-200", gradientFrom: "from-blue-400", gradientTo: "to-blue-600" },
  "Aceites para Autos": { icon: "lucide:fuel", color: "text-green-500", bgColor: "bg-green-100", hoverBg: "hover:bg-green-200", gradientFrom: "from-green-400", gradientTo: "to-green-600" },
  "Filtros": { icon: "lucide:filter", color: "text-amber-500", bgColor: "bg-amber-100", hoverBg: "hover:bg-amber-200", gradientFrom: "from-amber-400", gradientTo: "to-amber-600" },
  "Baterías": { icon: "lucide:battery-charging", color: "text-red-500", bgColor: "bg-red-100", hoverBg: "hover:bg-red-200", gradientFrom: "from-red-400", gradientTo: "to-red-600" },
  "Neumáticos": { icon: "lucide:circle-dot", color: "text-purple-500", bgColor: "bg-purple-100", hoverBg: "hover:bg-purple-200", gradientFrom: "from-purple-400", gradientTo: "to-purple-600" },
  "Herramientas": { icon: "lucide:wrench", color: "text-gray-500", bgColor: "bg-gray-100", hoverBg: "hover:bg-gray-200", gradientFrom: "from-gray-400", gradientTo: "to-gray-600" },
  "Lubricantes": { icon: "lucide:glass-water", color: "text-yellow-600", bgColor: "bg-yellow-100", hoverBg: "hover:bg-yellow-200", gradientFrom: "from-yellow-400", gradientTo: "to-yellow-600" },
  "Accesorios": { icon: "lucide:store", color: "text-pink-500", bgColor: "bg-pink-100", hoverBg: "hover:bg-pink-200", gradientFrom: "from-pink-400", gradientTo: "to-pink-600" },
  "Repuestos": { icon: "lucide:settings", color: "text-cyan-500", bgColor: "bg-cyan-100", hoverBg: "hover:bg-cyan-200", gradientFrom: "from-cyan-400", gradientTo: "to-cyan-600" },
  "Electrónica": { icon: "lucide:cpu", color: "text-indigo-500", bgColor: "bg-indigo-100", hoverBg: "hover:bg-indigo-200", gradientFrom: "from-indigo-400", gradientTo: "to-indigo-600" },
};
const defaultIcon = { icon: "lucide:box", color: "text-default-500", bgColor: "bg-default-100", hoverBg: "hover:bg-default-200", gradientFrom: "from-default-400", gradientTo: "to-default-600" };

export const ProductsPage: React.FC<ProductsPageProps> = ({ addToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [topRatedProducts, setTopRatedProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  // Filtros de precio
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  // Traer categorías desde Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('id_categoria, nombre_categoria, imagen_url');
      if (!error && data) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

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

  useEffect(() => {
    // Obtener los 10 productos más puntuados al cargar la página
    const fetchTopRatedProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select(`*, categorias!inner(id_categoria, nombre_categoria)`)
          .order('puntuacion', { ascending: false })
          .limit(10);
        if (!error && data) {
          const transformed: Product[] = data.map((item: any) => ({
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
          setTopRatedProducts(transformed);
        }
      } catch (err) {
        setTopRatedProducts([]);
      }
    };
    fetchTopRatedProducts();
  }, []);

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

  // Filtrar productos por precio
  const filteredProducts = products.filter((product) => {
    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;
    return product.precio >= min && product.precio <= max;
  });

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

        {/* Sección de filtros mejorada con animación especial */}
        <style>{`
          .filtros-anim {
            animation: filtrosFadeInUp 0.8s cubic-bezier(.23,1.02,.47,.98);
          }
          @keyframes filtrosFadeInUp {
            0% { opacity: 0; transform: translateY(40px) scale(0.98); }
            60% { opacity: 1; transform: translateY(-8px) scale(1.03); }
            80% { transform: translateY(2px) scale(0.99); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .bounce-focus:focus {
            animation: bounceInput 0.4s cubic-bezier(.23,1.02,.47,.98);
          }
          @keyframes bounceInput {
            0% { box-shadow: 0 0 0 0 #a3e63544; transform: scale(1); }
            50% { box-shadow: 0 0 0 6px #a3e63544; transform: scale(1.05); }
            100% { box-shadow: 0 0 0 0 #a3e63500; transform: scale(1); }
          }
          .select-categoria {
            background: linear-gradient(90deg, #f0f4ff 0%, #e0f7fa 100%);
            box-shadow: 0 2px 8px 0 #a5b4fc22;
            border: 2px solid #a5b4fc44;
            padding-right: 2.5rem !important;
            position: relative;
            transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s;
          }
          .select-categoria:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px #6366f133;
            transform: scale(1.03);
          }
          .select-arrow {
            pointer-events: none;
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #6366f1;
            font-size: 1.2rem;
            opacity: 0.8;
          }
        `}</style>
        <div className="mb-10 flex justify-center">
          <div className="filtros-anim flex flex-col md:flex-row items-center gap-4 w-full max-w-4xl bg-white/80 backdrop-blur-md border border-primary/20 rounded-2xl shadow-lg px-6 py-4">
            {/* Filtro de categorías con Select de HeroUI */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Icon icon="lucide:layers" className="text-success text-xl" />
              <span className="font-semibold text-default-700">Categoría:</span>
              <div className="relative min-w-[220px] w-full flex-1">
                <Select
                  aria-label="Categoría"
                  selectedKeys={[selectedCategoryId !== null ? String(selectedCategoryId) : ""]}
                  onSelectionChange={keys => {
                    const val = Array.from(keys)[0];
                    setSelectedCategoryId(val === "" ? null : Number(val));
                  }}
                  className="select-categoria w-full min-w-[220px]"
                  placeholder="Todas"
                >
                  <SelectItem key="">Todas</SelectItem>
                  {/* @ts-ignore: Forzar renderizado de lista */}
                  <>{categories.map(cat => (
                    <SelectItem key={String(cat.id_categoria)}>{cat.nombre_categoria}</SelectItem>
                  ))}</>
                </Select>
              </div>
            </div>
            {/* Filtro de precios con Select de HeroUI */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Icon icon="lucide:tag" className="text-success text-xl" />
              <span className="font-semibold text-default-700">Precio:</span>
              {/* Select de precio mínimo */}
              <div className="relative min-w-[160px] w-full flex-1">
                <Select
                  aria-label="Precio mínimo"
                  selectedKeys={[minPrice]}
                  onSelectionChange={keys => {
                    const val = Array.from(keys)[0];
                    setMinPrice(val ? String(val) : "");
                  }}
                  className="select-categoria w-full min-w-[160px]"
                  placeholder="Mínimo"
                >
                  <SelectItem key="">Mínimo</SelectItem>
                  {/* @ts-ignore: Forzar renderizado de lista */}
                  <>{Array.from({ length: 20 }, (_, i) => 10000 + i * 50000).map(val => (
                    <SelectItem key={String(val)} textValue={`$${val.toLocaleString()}`}>{`$${val.toLocaleString()}`}</SelectItem>
                  ))}</>
                </Select>
              </div>
              <span className="text-default-400 font-bold">-</span>
              {/* Select de precio máximo */}
              <div className="relative min-w-[160px] w-full flex-1">
                <Select
                  aria-label="Precio máximo"
                  selectedKeys={[maxPrice]}
                  onSelectionChange={keys => {
                    const val = Array.from(keys)[0];
                    setMaxPrice(val ? String(val) : "");
                  }}
                  className="select-categoria w-full min-w-[160px]"
                  placeholder="Máximo"
                >
                  <SelectItem key="">Máximo</SelectItem>
                  {/* @ts-ignore: Forzar renderizado de lista */}
                  <>{Array.from({ length: 20 }, (_, i) => 10000 + i * 50000).map(val => (
                    <SelectItem key={String(val)} textValue={`$${val.toLocaleString()}`}>{`$${val.toLocaleString()}`}</SelectItem>
                  ))}</>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Carrusel infinito mejorado de productos más puntuados */}
        {topRatedProducts.length > 0 && (
          <div className="mb-16 relative">
            {/* Título del carrusel */}
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                ⭐ Productos Mejor Valorados
              </h3>
              <p className="text-default-500">Los favoritos de nuestros clientes</p>
            </div>

            {/* Gradientes para efecto fade */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
            
            {/* Contenedor del carrusel */}
            <div className="overflow-hidden relative rounded-2xl bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 p-6 shadow-xl">
              {/* Efectos de fondo decorativos */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              <div className="absolute top-4 left-4 w-3 h-3 bg-primary/20 rounded-full animate-bounce"></div>
              <div className="absolute bottom-4 right-4 w-2 h-2 bg-secondary/30 rounded-full animate-ping"></div>
              
              <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused] relative z-10">
                {topRatedProducts.concat(topRatedProducts).map((product, idx) => (
                  <div
                    key={product.id_producto + '-' + idx}
                    className="
                      group inline-block min-w-[280px] max-w-sm bg-white/95 backdrop-blur-sm 
                      border border-primary/20 rounded-xl shadow-lg transition-all duration-500 
                      hover:shadow-2xl hover:scale-105 hover:-translate-y-2 hover:border-primary/40
                      cursor-pointer overflow-hidden
                    "
                  >
                    {/* Badge de mejor valorado */}
                    <div className="absolute top-3 left-3 z-20">
                      <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        <Icon icon="lucide:star" className="text-xs" />
                        <span>Top Rated</span>
                      </div>
                    </div>

                    {/* Contenedor de imagen mejorado */}
                    <div className="relative h-40 bg-gradient-to-br from-white to-default-50 flex items-center justify-center overflow-hidden">
                      {/* Efecto de brillo en hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      {/* Imagen del producto */}
                      <img 
                        src={product.imagen_url} 
                        alt={product.nombre} 
                        className="
                          max-h-full max-w-full object-contain transition-all duration-500
                          group-hover:scale-110 group-hover:rotate-2 filter group-hover:brightness-110
                          drop-shadow-lg
                        " 
                      />
                      
                      {/* Efectos decorativos */}
                      <div className="absolute top-2 right-2 w-2 h-2 bg-primary/30 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-2 left-2 w-1 h-1 bg-secondary/40 rounded-full animate-bounce"></div>
                    </div>

                    {/* Contenido del producto */}
                    <div className="p-4 relative">
                      {/* Rating mejorado con animaciones */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Icon 
                              key={i} 
                              icon="lucide:star" 
                              className={`
                                text-sm transition-all duration-300 group-hover:scale-125
                                ${i < Math.floor(product.puntuacion) ? 'text-amber-500' : 'text-default-300'}
                              `}
                              style={{ animationDelay: `${i * 100}ms` }}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                          {product.puntuacion}
                        </span>
                      </div>

                      {/* Nombre del producto */}
                      <div className="font-bold text-base mb-2 text-default-800 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                        {product.nombre}
                      </div>

                      {/* Categoría */}
                      <div className="mb-3">
                        <Chip 
                          color="primary" 
                          variant="flat" 
                          size="sm"
                          className="bg-primary/10 text-primary border border-primary/20"
                        >
                          {product.nombre_categoria}
                        </Chip>
                      </div>

                      {/* Precio con efectos */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl font-bold text-primary group-hover:scale-105 transition-transform duration-300">
                          ${Number(product.precio).toFixed(2)}
                        </div>
                        <div className="flex items-center gap-1 text-success text-sm">
                          <Icon icon="lucide:trending-up" className="text-success" />
                          <span className="font-medium">Popular</span>
                        </div>
                      </div>

                      {/* Botón de agregar al carrito mejorado */}
                      <Button
                        color="primary"
                        variant="flat"
                        size="sm"
                        fullWidth
                        onPress={() => handleAddToCart(product)}
                        className="
                          group-hover:bg-primary group-hover:text-white font-semibold
                          transition-all duration-300 hover:scale-105 hover:shadow-lg
                          bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20
                        "
                        startContent={<Icon icon="lucide:shopping-cart" className="text-lg" />}
                      >
                        Añadir al Carrito
                      </Button>
                    </div>

                    {/* Efecto de glow en hover */}
                    <div className="absolute inset-0 rounded-xl border-2 border-primary/0 group-hover:border-primary/30 transition-all duration-300 pointer-events-none"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Animación CSS mejorada para marquee */}
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-marquee {
                animation: marquee 40s linear infinite;
              }
              .animate-marquee:hover {
                animation-play-state: paused;
              }
              .line-clamp-2 {
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }
            `}</style>
          </div>
        )}

        {/* Grid de categorías con efectos mejorados */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          {categories.map((category) => {
            const iconData = categoryIconMap[category.nombre_categoria] || defaultIcon;
            return (
              <Card
                key={category.id_categoria}
                isPressable
                className={`
                  group relative overflow-hidden border-2 transition-all duration-500 ease-out cursor-pointer
                  hover:shadow-2xl hover:-translate-y-2 hover:rotate-1
                  ${selectedCategoryId === category.id_categoria 
                    ? `border-primary shadow-lg bg-gradient-to-br ${iconData.gradientFrom} ${iconData.gradientTo} text-white` 
                    : `border-default-200 ${iconData.hoverBg} bg-white/80 backdrop-blur-sm`
                  }
                `}
                onClick={() => handleCategoryClick(category.id_categoria)}
              >
                {/* Imagen de referencia de la categoría o icono */}
                <div className="w-full flex justify-center mt-4 mb-2">
                  {category.imagen_url ? (
                    <img
                      src={category.imagen_url}
                      alt={category.nombre_categoria}
                      className="h-16 w-16 object-contain drop-shadow-md rounded-xl bg-white/80 p-2 border border-default-200"
                      loading="lazy"
                    />
                  ) : (
                    <div className={`
                      relative w-16 h-16 rounded-full flex items-center justify-center
                      ${iconData.bgColor}
                    `}>
                      <Icon icon={iconData.icon} className={`text-3xl ${iconData.color}`} />
                    </div>
                  )}
                </div>
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
                    ${selectedCategoryId === category.id_categoria 
                      ? 'bg-white/20 backdrop-blur-sm' 
                      : `${iconData.bgColor} group-hover:shadow-lg`
                    }
                  `}>
                    {/* Anillo exterior animado */}
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20 animate-spin" style={{ animationDuration: '3s' }}></div>
                    <Icon 
                      icon={iconData.icon} 
                      className={`
                        text-3xl transition-all duration-300 group-hover:scale-110
                        ${selectedCategoryId === category.id_categoria 
                          ? 'text-white drop-shadow-lg' 
                          : `${iconData.color} group-hover:drop-shadow-md`
                        }
                      `} 
                    />
                  </div>
                  <h3 className={`
                    font-semibold text-sm md:text-base transition-all duration-300
                    ${selectedCategoryId === category.id_categoria 
                      ? 'text-white drop-shadow-sm' 
                      : 'text-default-700 group-hover:text-primary'
                    }
                  `}>
                    {category.nombre_categoria}
                  </h3>
                  {/* Indicador de selección */}
                  {selectedCategoryId === category.id_categoria && (
                    <div className="absolute top-3 right-3">
                      <Icon icon="lucide:check-circle" className="text-white text-lg drop-shadow-md" />
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Loading state mejorado */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-default-500 text-lg">Cargando productos...</p>
          </div>
        )}

        {/* Grid de productos con efectos mejorados */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
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
        {!loading && selectedCategoryId && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-default-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="lucide:box" className="text-default-400 w-16 h-16 animate-bounce" />
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-default-800">
              No hay productos en esta categoría y rango de precio
            </h3>
            <p className="text-default-500 mb-4">
              Prueba con otros filtros o explora otras categorías.
            </p>
            <Button
              color="primary"
              variant="flat"
              onPress={() => setSelectedCategoryId(null)}
              className="
                rounded-full px-6 py-3 font-semibold
                bg-gradient-to-r from-primary to-secondary text-white
                shadow-md hover:shadow-lg transition-all duration-300
              "
            >
              Volver a Categorías
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};