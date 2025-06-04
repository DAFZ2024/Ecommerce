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

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  removeItem: (id: number) => void;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({ 
  isOpen, 
  onClose, 
  items,
  removeItem
}) => {
  // Calculate values directly without hooks
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
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
                <div key={item.id} className="flex border-b border-default-200 pb-4">
                  <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      removeWrapper
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-default-500 text-sm">{item.category}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-semibold">${item.price.toFixed(2)}</span>
                      <Button 
                        isIconOnly 
                        size="sm" 
                        variant="light" 
                        color="danger"
                        onPress={() => removeItem(item.id)}
                      >
                        <Icon icon="lucide:trash-2" />
                      </Button>
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