import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerBody, 
  DrawerFooter,
  Button,
  Image,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Product } from "../App";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import CryptoJS from "crypto-js";

export interface CartItem extends Product {
  quantity: number;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  currentUser?: { id: string; email: string; nombre_completo?: string } | null;
  clearCart: () => void;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({ 
  isOpen, 
  onClose, 
  items,
  removeItem,
  updateQuantity,
  currentUser: propUser,
  clearCart,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<null | 'success' | 'error' | 'pending'>(null);
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const [paymentMessage, setPaymentMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<typeof propUser>(propUser || null);
  const [isUserLoading, setIsUserLoading] = useState(!propUser);
  const navigate = useNavigate();

  // Detectar usuario logueado con Supabase si no se pasa por props
  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      setIsUserLoading(true);
      
      // Intentar obtener la sesión activa primero
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (session?.user && session.user.id) {
        const user = session.user;
        const { data: usuarioExtra } = await supabase
          .from("usuarios")
          .select("nombre_completo")
          .eq("id_usuario", user.id)
          .single();
        
        if (isMounted) {
          setCurrentUser({
            id: user.id,
            email: user.email || "",
            nombre_completo: usuarioExtra?.nombre_completo || user.email || "",
          });
        }
      } else {
        // Fallback a getUser si no hay sesión
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (user && user.id) {
          const { data: usuarioExtra } = await supabase
            .from("usuarios")
            .select("nombre_completo")
            .eq("id_usuario", user.id)
            .single();
          
          if (isMounted) {
            setCurrentUser({
              id: user.id,
              email: user.email || "",
              nombre_completo: usuarioExtra?.nombre_completo || user.email || "",
            });
          }
        } else if (isMounted) {
          setCurrentUser(null);
        }
      }
      if (isMounted) setIsUserLoading(false);
    };

    if (!propUser) {
      fetchUser();
      // Suscribirse a cambios de sesión de Supabase
      const { data: listener } = supabase.auth.onAuthStateChange(() => {
        fetchUser();
      });
      return () => {
        isMounted = false;
        listener?.subscription.unsubscribe();
      };
    } else {
      setCurrentUser(propUser);
      setIsUserLoading(false);
    }
  }, [propUser]);

  const subtotal = items.reduce((sum, item) => sum + (Number(item.precio) * item.quantity), 0);
  const shipping = items.length > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  // Handle ESC key to close cart
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handlePayU = async () => {
    setIsProcessing(true);
    setPaymentStatus('pending');
    setPaymentMessage('Procesando tu pago...');
    onModalOpen();

    try {
      if (!currentUser?.id) throw new Error('Debes iniciar sesión para realizar el pago');
      if (!items || items.length === 0) throw new Error('El carrito está vacío');

      // 1. Crear la orden en Supabase
      const { data: orden, error: ordenError } = await supabase
        .from('ordenes')
        .insert([
          {
            id_usuario: currentUser.id,
            total: total,
            email_usuario: currentUser.email,
            nombre_usuario: currentUser.nombre_completo,
            // estado: 'pendiente', // dejar que el default lo ponga
            // moneda: 'COP', // dejar que el default lo ponga
          },
        ])
        .select('*')
        .single();
      if (ordenError || !orden) throw new Error('No se pudo crear la orden');

      // 2. Crear el detalle de la orden
      const detalles = items.map((item) => ({
        id_orden: orden.id_orden,
        id_producto: item.id_producto,
        cantidad: item.quantity,
        precio_unitario: Number(item.precio),
      }));
      const { error: detalleError } = await supabase
        .from('orden_detalle')
        .insert(detalles);
      if (detalleError) throw new Error('No se pudo crear el detalle de la orden');

      // 3. Generar datos de PayU
      const merchantId = '508029'; // Sandbox
      const accountId = '512321'; // Sandbox
      const apiKey = '4Vj8eK4rloUd272L48hsrarnUA'; // Sandbox
      const referenceCode = `ORD-${orden.id_orden}-${Date.now()}`;
      const amount = total.toFixed(2);
      const currency = 'COP';
      const buyerEmail = currentUser.email;
      const description = `Pago orden #${orden.id_orden}`;
      const signatureRaw = `${apiKey}~${merchantId}~${referenceCode}~${amount}~${currency}`;
      const signature = CryptoJS.MD5(signatureRaw).toString();
      const payuUrl = 'https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/';
      const responseUrl = `${window.location.origin}/gracias?orden=${orden.id_orden}`;
      const confirmationUrl = `${window.location.origin}/api/payu/confirmation`;

      // 4. Registrar el pago como pendiente en Supabase
      await supabase.from('pagos').insert([
        {
          id_orden: orden.id_orden,
          id_usuario: currentUser.id,
          metodo_pago: 'payu',
          estado: 'pendiente',
          monto: amount,
          moneda: currency,
        },
      ]);

      // 5. Crear y enviar el formulario a PayU
      const form = document.createElement('form');
      form.action = payuUrl;
      form.method = 'POST';
      form.target = '_self';
      form.style.display = 'none';
      const fields = {
        merchantId,
        accountId,
        description,
        referenceCode,
        amount,
        tax: '0',
        taxReturnBase: '0',
        currency,
        signature,
        test: '1',
        buyerEmail,
        responseUrl,
        confirmationUrl,
        shippingAddress: '',
        shippingCity: '',
        shippingCountry: 'CO',
        // Puedes agregar más campos según tu integración
      };
      Object.entries(fields).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      setTimeout(() => {
        onClose();
        form.submit();
      }, 500);
    } catch (error) {
      setIsProcessing(false);
      setPaymentStatus('error');
      setPaymentMessage(error instanceof Error ? error.message : 'Error al procesar el pago');
    }
  };

  // Actualiza el stock real en Supabase tras pago exitoso
  const actualizarStockReal = async (cartItems: CartItem[]) => {
    for (const item of cartItems) {
      // Obtener el stock actual del producto
      const { data, error: fetchError } = await supabase
        .from('productos')
        .select('stock')
        .eq('id_producto', item.id_producto)
        .single();
      if (fetchError || !data) {
        console.error(`Error obteniendo stock para producto ${item.id_producto}:`, fetchError);
        continue;
      }
      const nuevoStock = Math.max((data.stock || 0) - item.quantity, 0);
      const { error } = await supabase
        .from('productos')
        .update({ stock: nuevoStock })
        .eq('id_producto', item.id_producto);
      if (error) {
        console.error(`Error actualizando stock para producto ${item.id_producto}:`, error);
      }
    }
  };

  const handleSuccessfulPayment = async () => {
    setPaymentStatus('success');
    setPaymentMessage('¡Pago realizado con éxito!');
    // Descontar stock real en Supabase
    await actualizarStockReal(items);
    clearCart();
    setTimeout(() => {
      onModalClose();
      navigate('/gracias');
    }, 2000);
  };

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    }),
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
  };

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose} placement="right">
        <DrawerContent className="max-w-md w-full">
          <DrawerHeader className="border-b border-default-200 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <div className="flex items-center">
              <motion.div 
                animate={{ rotate: items.length > 0 ? [0, 10, -10, 0] : 0 }}
                transition={{ duration: 0.5, repeat: items.length > 0 ? 1 : 0 }}
              >
                <Icon icon="lucide:shopping-cart" className="mr-2 text-xl" />
              </motion.div>
              <span className="font-bold">Carrito de Compras ({items.length})</span>
            </div>
            
            {currentUser ? (
              <div className="text-sm text-indigo-100 mt-1">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:user" className="text-green-300" />
                  <span>Logueado como: {currentUser.nombre_completo || currentUser.email}</span>
                </div>
                <div className="text-xs text-indigo-200 ml-6">
                  ID: {currentUser.id} | {currentUser.email}
                </div>
              </div>
            ) : (
              <motion.div 
                className="text-sm text-yellow-300 mt-1 flex items-center gap-2"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Icon icon="lucide:alert-circle" />
                <span>Debes iniciar sesión para comprar</span>
              </motion.div>
            )}
          </DrawerHeader>
          
          <DrawerBody className="bg-gray-50">
            {items.length === 0 ? (
              <motion.div 
                className="flex flex-col items-center justify-center h-full py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Icon
                    icon="lucide:shopping-cart"
                    className="text-6xl text-gray-300 mb-4"
                  />
                </motion.div>
                <p className="text-gray-500 text-lg mb-6">Tu carrito está vacío</p>
                <Button
                  color="primary"
                  variant="solid"
                  className="mt-4 shadow-lg"
                  onPress={onClose}
                >
                  Continuar Comprando
                </Button>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id_producto}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={itemVariants}
                      layout
                      className="flex border-b border-default-200 pb-4 bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                        <Image
                          src={item.imagen_url}
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                          removeWrapper
                        />
                      </div>
                      <div className="ml-4 flex-grow">
                        <h4 className="font-medium text-gray-800">{item.nombre}</h4>
                        <p className="text-gray-500 text-sm">
                          {item.nombre_categoria}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-semibold text-indigo-600">
                            ${Number(item.precio).toFixed(2)}
                          </span>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() => removeItem(item.id_producto)}
                              className="hover:bg-red-50"
                            >
                              <Icon icon="lucide:trash-2" />
                            </Button>
                          </motion.div>
                        </div>
                        <div className="mt-2 flex items-center">
                          <label className="text-sm mr-2 text-gray-600">Cantidad:</label>
                          <motion.div whileHover={{ scale: 1.05 }} className="relative">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  item.id_producto,
                                  parseInt(e.target.value, 10)
                                )
                              }
                              className="w-16 border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all"
                            />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </DrawerBody>
          
          {items.length > 0 && (
            <DrawerFooter className="border-t border-default-200 bg-white">
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío</span>
                    <span className="font-medium">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                    <span className="text-gray-800">Total</span>
                    <span className="text-indigo-700">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                {isUserLoading ? (
                  <motion.div className="w-full flex justify-center py-2">
                    <Icon icon="lucide:loader" className="animate-spin text-indigo-500 text-2xl" />
                    <span className="ml-2 text-indigo-500">Verificando sesión...</span>
                  </motion.div>
                ) : (
                  <>
                    {currentUser && currentUser.id ? (
                      <motion.div 
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                        className="w-full"
                      >
                        <Button
                          color="primary"
                          fullWidth
                          size="lg"
                          onClick={handlePayU}
                          isLoading={isProcessing}
                          endContent={<Icon icon="lucide:credit-card" />}
                          className="shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                        >
                          Proceder al Pago
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div 
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                        className="w-full"
                      >
                        <Button
                          color="warning"
                          fullWidth
                          size="lg"
                          onClick={() => {
                            alert('Debes iniciar sesión para realizar el pago');
                            onClose();
                          }}
                          endContent={<Icon icon="lucide:user" />}
                          className="shadow-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                        >
                          Iniciar Sesión para Pagar
                        </Button>
                      </motion.div>
                    )}
                  </>
                )}
                
                <motion.div whileHover={{ scale: 1.02 }} className="w-full">
                  <Button 
                    variant="light" 
                    fullWidth 
                    onPress={onClose}
                    className="border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Continuar Comprando
                  </Button>
                </motion.div>
              </div>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>

      {/* Modal de estado de pago */}
      <Modal isOpen={isModalOpen} onClose={onModalClose}>
        <ModalContent className="max-w-md">
          <ModalHeader className="text-center">
            {paymentStatus === 'success' ? '¡Pago Exitoso!' : 
             paymentStatus === 'error' ? 'Error en el Pago' : 'Procesando Pago'}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col items-center justify-center py-4">
              <AnimatePresence mode="wait">
                {paymentStatus === 'success' ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon 
                        icon="lucide:check-circle" 
                        className="text-6xl text-green-500" 
                      />
                    </div>
                  </motion.div>
                ) : paymentStatus === 'error' ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon 
                        icon="lucide:alert-circle" 
                        className="text-6xl text-red-500" 
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mb-4"
                  >
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Icon 
                        icon="lucide:loader-circle" 
                        className="text-6xl text-blue-500" 
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.p 
                className="text-center text-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {paymentMessage}
              </motion.p>
            </div>
          </ModalBody>
          <ModalFooter className="justify-center">
            {paymentStatus === 'success' ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  color="primary" 
                  onPress={() => {
                    onModalClose();
                    navigate('/gracias');
                  }}
                  className="px-8"
                >
                  Ver Detalles
                </Button>
              </motion.div>
            ) : paymentStatus === 'error' ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  color="danger" 
                  onPress={onModalClose}
                  className="px-8"
                >
                  Entendido
                </Button>
              </motion.div>
            ) : null}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};