import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Image, Badge } from '@heroui/react';
import { Icon } from '@iconify/react';
import { supabase } from "../lib/supabaseClient";

interface Product {
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

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  addToCart: (product: Product) => void;
  onViewProduct: (productId: number) => void;
}

const OfferModal: React.FC<OfferModalProps> = ({ isOpen, onClose, addToCart, onViewProduct }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [bestOfferProduct, setBestOfferProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      fetchBestOffer();
    } else {
      // Resetear al cerrar
      setBestOfferProduct(null);
      setLoading(true);
      setError(false);
    }
  }, [isOpen]);

  const fetchBestOffer = async () => {
  try {
    setLoading(true);
    setError(false);
    // Buscar el producto con mayor descuento y en_oferta=true
    const { data, error: supabaseError } = await supabase
      .from('productos')
      .select('*')
      .eq('en_oferta', true)
      .order('descuento', { ascending: false })
      .limit(1)
      .single();
    if (supabaseError) throw supabaseError;
    setBestOfferProduct(data || null);
  } catch (err) {
    console.error("Error al obtener ofertas:", err);
    setError(true);
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  if (loading) {
    return (
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="md"
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          <ModalBody className="flex justify-center items-center py-10">
            <Icon icon="eos-icons:loading" className="text-5xl text-blue-500" />
            <p className="ml-4 text-gray-600">Buscando las mejores ofertas...</p>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="md"
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="text-red-500">Error</ModalHeader>
          <ModalBody>
            <div className="flex flex-col items-center py-6">
              <Icon icon="ion:warning" className="text-4xl text-red-500 mb-4" />
              <p className="text-center text-gray-700">
                No se pudo cargar la oferta especial. Por favor intenta nuevamente.
              </p>
            </div>
          </ModalBody>
          <ModalFooter className="justify-center">
            <Button color="primary" onPress={fetchBestOffer}>
              Reintentar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  if (!bestOfferProduct) {
    return (
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="md"
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          <ModalBody className="flex flex-col items-center py-10">
            <Icon icon="mdi:tag-off" className="text-5xl text-yellow-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">¡No hay ofertas disponibles!</h3>
            <p className="text-gray-600 text-center">
              Actualmente no tenemos promociones especiales, pero puedes revisar nuestros productos.
            </p>
          </ModalBody>
          <ModalFooter className="justify-center">
            <Button color="primary" onPress={onClose}>
              Ver productos
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  const product = bestOfferProduct;

// Reemplazar las líneas de cálculo con:
const precioFinal = parseFloat(product.precio.toString());
const descuento = parseFloat(product.descuento.toString());

// Calcular precio original antes de descuento
const precioOriginal = precioFinal / (1 - descuento / 100);
const savings = precioOriginal - precioFinal;
  
const formatPrice = (value: number) => {
  return value.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};



  const handleViewProduct = () => {
    onViewProduct(product.id_producto);
    onClose();
  };

  const handleAddToCart = () => {
    addToCart(product);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      placement="center"
      backdrop="blur"
      hideCloseButton
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-md",
        base: "mx-4",
        wrapper: "flex items-center justify-center",
      }}
    >
      <ModalContent
        className={`
        relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50 
        border-2 border-gradient-to-r from-blue-400 to-purple-500
        shadow-2xl transform transition-all duration-500 
        ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}
      `}
      >
        {(onClose) => (
          <>
            {/* Fondo decorativo animado */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-pink-400/20 to-orange-400/20 rounded-full animate-pulse delay-1000"></div>
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-yellow-400/10 to-red-400/10 rounded-full animate-spin"
                style={{ animationDuration: "20s" }}
              ></div>
            </div>

            {/* Header con gradiente y efectos */}
            <div className="relative bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 p-6 text-white overflow-hidden">
              {/* Partículas decorativas */}
              <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white/30 rounded-full animate-ping"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${2 + Math.random() * 2}s`,
                    }}
                  ></div>
                ))}
              </div>

              {/* Botón cerrar mejorado */}
              <Button
                isIconOnly
                className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 hover:scale-110"
                variant="flat"
                onPress={onClose}
                radius="full"
              >
                <Icon icon="lucide:x" className="text-white text-xl" />
              </Button>

              {/* Badge de oferta especial mejorado */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Badge
                    color="warning"
                    variant="solid"
                    className="text-black font-black px-6 py-2 text-xl animate-bounce bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg"
                  >
                    🎉 ¡OFERTA ESPECIAL! 🎉
                  </Badge>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-50 blur-md animate-pulse"></div>
                </div>
              </div>

              <div className="text-center relative z-10">
                <h2 className="text-3xl font-black mb-2 text-shadow-lg">
                  ¡DESCUENTO INCREÍBLE!
                </h2>
                <p className="text-lg font-medium opacity-90">
                  La mejor oferta que encontrarás hoy
                </p>
              </div>
            </div>

            <ModalBody className="p-8 relative z-10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Imagen del producto mejorada */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="relative bg-white p-4 rounded-2xl shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={product.imagen_url}
                      alt={product.nombre}
                      className="w-full h-64 object-cover rounded-xl"
                    />

                    {/* Badge de descuento mejorado */}
                    <div className="absolute -top-2 -right-2">
                      <div className="relative">
                        <Badge
                          color="success"
                          variant="solid"
                          className="text-white font-black text-2xl px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg animate-pulse"
                        >
                          -{product.descuento}%
                        </Badge>
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-50 blur-md"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información del producto mejorada */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 leading-tight">
                      {product.nombre}
                    </h3>

                    <p className="text-gray-600 leading-relaxed">
                      {product.descripcion}
                    </p>
                  </div>

                  {/* Precios con efectos visuales */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200 shadow-inner">
                    <div className="text-center space-y-3">
                      <div className="flex items-center justify-center gap-4">
                        <span className="text-4xl font-black text-green-600 animate-pulse">
                          ${precioFinal.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-xl text-gray-500 line-through opacity-70">
                          ${precioOriginal.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
                        </span>
                      </div>

                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full inline-block font-bold shadow-lg">
                        💰 ¡Ahorras ${savings.toLocaleString('es-CO', { maximumFractionDigits: 0 })}!
                      </div>
                    </div>
                  </div>

                  {/* Rating mejorado */}
                  <div className="flex items-center justify-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Icon
                          key={i}
                          icon="lucide:star"
                          className={`text-2xl transition-all duration-300 ${
                            i < product.puntuacion
                              ? "text-yellow-400 fill-current transform hover:scale-110"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-gray-700">
                      {product.puntuacion}/5 ⭐
                    </span>
                  </div>

                  {/* Stock con indicador visual */}
                  <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <Icon
                      icon="lucide:package"
                      className="text-blue-600 text-xl"
                    />
                    <span className="text-gray-700">
                      <span className="font-bold text-blue-600">
                        {product.stock}
                      </span>{" "}
                      unidades disponibles
                    </span>
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Button
                  color="default"
                  variant="bordered"
                  onPress={onClose}
                  className="min-w-40 h-12 font-semibold border-2 hover:scale-105 transition-transform"
                  startContent={<Icon icon="lucide:x" />}
                >
                  Cerrar
                </Button>

                <Button
                  color="primary"
                  variant="shadow"
                  onPress={handleAddToCart}
                  className="min-w-40 h-12 font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105 transition-all duration-300 shadow-lg"
                  startContent={
                    <Icon icon="lucide:shopping-cart" className="text-lg" />
                  }
                >
                  Agregar al Carrito
                </Button>

                <Button
                  color="warning"
                  variant="shadow"
                  onPress={handleViewProduct}
                  className="min-w-40 h-12 font-bold text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 hover:scale-105 transition-all duration-300 shadow-lg"
                  startContent={<Icon icon="lucide:eye" className="text-lg" />}
                >
                  Ver Detalles
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default OfferModal;