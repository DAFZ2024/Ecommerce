import React from "react";
import { Link, Input, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-default-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Icon icon="lucide:car" className="text-primary text-2xl" />
              <span className="font-bold text-xl ml-2">AutoPartesBogota</span>
            </div>
            <p className="text-default-300 mb-4">
              Tu tienda de confianza para repuestos y accesorios de motos y automóviles.
            </p>
            <div className="flex space-x-4">
              <Link href="#" aria-label="Facebook">
                <Icon icon="lucide:facebook" className="text-xl text-default-300 hover:text-primary" />
              </Link>
              <Link href="#" aria-label="Instagram">
                <Icon icon="lucide:instagram" className="text-xl text-default-300 hover:text-primary" />
              </Link>
              <Link href="#" aria-label="Twitter">
                <Icon icon="lucide:twitter" className="text-xl text-default-300 hover:text-primary" />
              </Link>
              <Link href="#" aria-label="YouTube">
                <Icon icon="lucide:youtube" className="text-xl text-default-300 hover:text-primary" />
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Productos</h3>
            <ul className="space-y-2">
              <li><Link className="text-default-300 hover:text-primary" href="#">Aceites para Motos</Link></li>
              <li><Link className="text-default-300 hover:text-primary" href="#">Aceites para Autos</Link></li>
              <li><Link className="text-default-300 hover:text-primary" href="#">Filtros</Link></li>
              <li><Link className="text-default-300 hover:text-primary" href="#">Baterías</Link></li>
              <li><Link className="text-default-300 hover:text-primary" href="#">Neumáticos</Link></li>
              <li><Link className="text-default-300 hover:text-primary" href="#">Herramientas</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Enlaces Útiles</h3>
            <ul className="space-y-2">
              <li><Link className="text-default-300 hover:text-primary" href="#">Sobre Nosotros</Link></li>
              <li><Link className="text-default-300 hover:text-primary" href="#">Contacto</Link></li>
              <li><Link className="text-default-300 hover:text-primary" href="#">Preguntas Frecuentes</Link></li>
              <li><Link className="text-default-300 hover:text-primary" href="#">Política de Privacidad</Link></li>
              <li><Link className="text-default-300 hover:text-primary" href="#">Términos y Condiciones</Link></li>
              <li><Link className="text-default-300 hover:text-primary" href="#">Envíos y Devoluciones</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Suscríbete</h3>
            <p className="text-default-300 mb-4">
              Recibe nuestras ofertas y novedades directamente en tu correo.
            </p>
            <div className="flex flex-col space-y-2">
              <Input
                placeholder="Tu correo electrónico"
                variant="bordered"
                className="max-w-full"
              />
              <Button color="primary">
                Suscribirse
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-default-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-default-400 text-sm">
              © {new Date().getFullYear()} Andres forero. Todos los derechos reservados.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <img src="/visa.png" alt="Visa" className="h-6" />
              <img src="mastercard.png" alt="Mastercard" className="h-6" />
              <img src="paypal.png" alt="PayPal" className="h-6" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};