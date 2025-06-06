import React from "react";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerBody, 
  DrawerFooter,
  Button,
  Image
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Product } from "../App";

export interface CartItem extends Product {
  quantity: number;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void; // ✅ Agregado
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({ 
  isOpen, 
  onClose, 
  items,
  removeItem,
  updateQuantity, // ✅ Agregado aquí también
}) => {
  // Sumar precios de los productos en el carrito
  const subtotal = items.reduce((sum, item) => sum + (Number(item.precio) * item.quantity), 0);
  const shipping = items.length > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right">
      <DrawerContent className="max-w-md">
        <DrawerHeader className="border-b border-default-200">
          <div className="flex items-center">
            <Icon icon="lucide:shopping-cart" className="mr-2" />
            <span>Carrito de Compras ({items.length})</span>
          </div>
        </DrawerHeader>
        <DrawerBody>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Icon icon="lucide:shopping-cart" className="text-5xl text-default-300 mb-4" />
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
                <div key={item.id_producto} className="flex border-b border-default-200 pb-4">
                  <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={`http://localhost:3001${item.imagen_url}`} // ✅ URL corregida
                      alt={item.nombre}
                      className="w-full h-full object-cover"
                      removeWrapper
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h4 className="font-medium">{item.nombre}</h4>
                    <p className="text-default-500 text-sm">{item.nombre_categoria}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-semibold">${Number(item.precio).toFixed(2)}</span>
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
                        onChange={(e) => updateQuantity(item.id_producto, parseInt(e.target.value, 10))}
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
              <Button 
                color="primary" 
                fullWidth
                size="lg"
                endContent={<Icon icon="lucide:check" />}
              >
                Proceder al Pago
              </Button>
              <Button 
                variant="flat" 
                fullWidth
                onPress={onClose}
              >
                Continuar Comprando
              </Button>
            </div>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};