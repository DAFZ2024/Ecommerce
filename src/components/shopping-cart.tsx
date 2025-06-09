import React, { useState } from "react";
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

export interface CartItem extends Product {
  quantity: number;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  currentUser?: { id: number; email: string; nombre: string } | null;
  clearCart: () => void;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({ 
  isOpen, 
  onClose, 
  items,
  removeItem,
  updateQuantity,
  currentUser,
  clearCart,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<null | 'success' | 'error' | 'pending'>(null);
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const [paymentMessage, setPaymentMessage] = useState("");
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, item) => sum + (Number(item.precio) * item.quantity), 0);
  const shipping = items.length > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  const handlePayU = async () => {
    setIsProcessing(true);
    setPaymentStatus('pending');
    setPaymentMessage('Procesando tu pago...');
    onModalOpen();

    try {
      if (!currentUser || !currentUser.id) {
        throw new Error('Debes iniciar sesión para realizar el pago');
      }

      if (!items || items.length === 0) {
        throw new Error('El carrito está vacío');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Sesión expirada');
      }

      const response = await axios.post("http://localhost:3001/api/payu/payment", {
        cartItems: items.map(item => ({
          id_producto: item.id_producto,
          nombre: item.nombre,
          precio: Number(item.precio),
          quantity: item.quantity
        })),
        id_usuario: currentUser.id,
        usuario_info: {
          email: currentUser.email,
          nombre: currentUser.nombre
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        responseType: 'text'
      });

      // Crear formulario oculto y enviarlo en la misma ventana
      const formContainer = document.createElement('div');
      formContainer.innerHTML = response.data;
      document.body.appendChild(formContainer);
      const form = formContainer.querySelector('form');
      
      if (form) {
        // Cerrar el carrito después de enviar el formulario
        setTimeout(() => {
          onClose();
        }, 500);
        
        form.submit();
      } else {
        throw new Error('No se pudo crear el formulario de pago');
      }

    } catch (error) {
      setIsProcessing(false);
      setPaymentStatus('error');
      
      if (error instanceof Error) {
        setPaymentMessage(error.message || 'Error al procesar el pago');
      } else if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setPaymentMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          localStorage.removeItem('token');
          setTimeout(() => navigate('/auth'), 2000);
        } else if (error.response?.status === 403) {
          setPaymentMessage('No tienes permisos para realizar esta acción.');
        } else if (error.response?.status === 400) {
          setPaymentMessage(`Error en los datos: ${error.response?.data?.error || 'Verifica los datos del carrito'}`);
        } else if (error.response?.status === 404) {
          setPaymentMessage('Usuario no encontrado. Por favor, inicia sesión nuevamente.');
        } else {
          setPaymentMessage(`Error del servidor: ${error.response?.data?.error || 'Error desconocido'}`);
        }
      } else {
        setPaymentMessage('Error de conexión. Verifica tu internet e inténtalo de nuevo.');
      }
    }
  };

  const handleSuccessfulPayment = () => {
    setPaymentStatus('success');
    setPaymentMessage('¡Pago realizado con éxito!');
    clearCart();
    setTimeout(() => {
      onModalClose();
      navigate('/gracias');
    }, 2000);
  };

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose} placement="right">
        <DrawerContent className="max-w-md">
          <DrawerHeader className="border-b border-default-200">
            <div className="flex items-center">
              <Icon icon="lucide:shopping-cart" className="mr-2" />
              <span>Carrito de Compras ({items.length})</span>
            </div>
            
            {currentUser ? (
              <div className="text-sm text-default-500 mt-1">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:user" className="text-green-500" />
                  <span>Logueado como: {currentUser.nombre || currentUser.email}</span>
                </div>
                <div className="text-xs text-default-400 ml-6">
                  ID: {currentUser.id} | {currentUser.email}
                </div>
              </div>
            ) : (
              <div className="text-sm text-red-500 mt-1 flex items-center gap-2">
                <Icon icon="lucide:alert-circle" />
                <span>Debes iniciar sesión para comprar</span>
              </div>
            )}
          </DrawerHeader>
          
          <DrawerBody>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Icon
                  icon="lucide:shopping-cart"
                  className="text-5xl text-default-300 mb-4"
                />
                <p className="text-default-500">Tu carrito está vacío</p>
                <Button
                  color="primary"
                  variant="flat"
                  className="mt-4"
                  onPress={onClose}
                >
                  Continuar Comprando
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id_producto}
                    className="flex border-b border-default-200 pb-4"
                  >
                    <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={`http://localhost:3001${item.imagen_url}`}
                        alt={item.nombre}
                        className="w-full h-full object-cover"
                        removeWrapper
                      />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h4 className="font-medium">{item.nombre}</h4>
                      <p className="text-default-500 text-sm">
                        {item.nombre_categoria}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-semibold">
                          ${Number(item.precio).toFixed(2)}
                        </span>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => removeItem(item.id_producto)}
                        >
                          <Icon icon="lucide:trash-2" />
                        </Button>
                      </div>
                      <div className="mt-2">
                        <label className="text-sm mr-2">Cantidad:</label>
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
                          className="w-16 border border-gray-300 rounded px-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DrawerBody>
          
          {items.length > 0 && (
            <DrawerFooter className="border-t border-default-200">
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-default-500">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-default-500">Envío</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                
                {currentUser && currentUser.id ? (
                  <Button
                    color="primary"
                    fullWidth
                    size="lg"
                    onClick={handlePayU}
                    isLoading={isProcessing}
                    endContent={<Icon icon="lucide:credit-card" />}
                  >
                    Proceder al Pago
                  </Button>
                ) : (
                  <Button
                    color="warning"
                    fullWidth
                    size="lg"
                    onClick={() => {
                      alert('Debes iniciar sesión para realizar el pago');
                      onClose();
                    }}
                    endContent={<Icon icon="lucide:user" />}
                  >
                    Iniciar Sesión para Pagar
                  </Button>
                )}
                
                <Button variant="flat" fullWidth onPress={onClose}>
                  Continuar Comprando
                </Button>
              </div>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>

      {/* Modal de estado de pago */}
      <Modal isOpen={isModalOpen} onClose={onModalClose}>
        <ModalContent>
          <ModalHeader>
            {paymentStatus === 'success' ? '¡Pago Exitoso!' : 
             paymentStatus === 'error' ? 'Error en el Pago' : 'Procesando Pago'}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col items-center justify-center py-4">
              {paymentStatus === 'success' ? (
                <Icon icon="lucide:check-circle" className="text-6xl text-green-500 mb-4" />
              ) : paymentStatus === 'error' ? (
                <Icon icon="lucide:alert-circle" className="text-6xl text-red-500 mb-4" />
              ) : (
                <div className="animate-spin">
                  <Icon icon="lucide:loader-circle" className="text-6xl text-blue-500 mb-4" />
                </div>
              )}
              <p className="text-center">{paymentMessage}</p>
            </div>
          </ModalBody>
          <ModalFooter>
            {paymentStatus === 'success' ? (
              <Button color="primary" fullWidth onPress={() => {
                onModalClose();
                navigate('/gracias');
              }}>
                Ver Detalles
              </Button>
            ) : paymentStatus === 'error' ? (
              <Button color="danger" fullWidth onPress={onModalClose}>
                Entendido
              </Button>
            ) : null}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};