import React from "react";
import { Link, Input, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-6">
              <div className="bg-slate-700 p-2 rounded-lg">
                <Icon icon="lucide:car" className="text-white text-2xl" />
              </div>
              <span className="font-bold text-2xl ml-3 text-slate-800">AutoPartesBogotá</span>
            </div>
            <p className="text-slate-600 mb-6 text-lg leading-relaxed max-w-md">
              Tu tienda de confianza para repuestos y accesorios de motos y automóviles. 
              Calidad garantizada y atención personalizada.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="#" 
                aria-label="Facebook"
                className="bg-white border border-slate-200 p-3 rounded-full hover:bg-slate-700 hover:border-slate-700 hover:text-white transition-all duration-300 shadow-sm"
              >
                <Icon icon="lucide:facebook" className="text-lg" />
              </Link>
              <Link 
                href="#" 
                aria-label="Instagram"
                className="bg-white border border-slate-200 p-3 rounded-full hover:bg-slate-700 hover:border-slate-700 hover:text-white transition-all duration-300 shadow-sm"
              >
                <Icon icon="lucide:instagram" className="text-lg" />
              </Link>
              <Link 
                href="#" 
                aria-label="Twitter"
                className="bg-white border border-slate-200 p-3 rounded-full hover:bg-slate-700 hover:border-slate-700 hover:text-white transition-all duration-300 shadow-sm"
              >
                <Icon icon="lucide:twitter" className="text-lg" />
              </Link>
              <Link 
                href="#" 
                aria-label="YouTube"
                className="bg-white border border-slate-200 p-3 rounded-full hover:bg-slate-700 hover:border-slate-700 hover:text-white transition-all duration-300 shadow-sm"
              >
                <Icon icon="lucide:youtube" className="text-lg" />
              </Link>
            </div>
          </div>
          
          {/* Products Section */}
          <div>
            <h3 className="font-bold text-slate-800 text-lg mb-6 relative">
              Productos
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-slate-400 mt-2"></div>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link className="text-slate-600 hover:text-slate-800 hover:translate-x-1 transition-all duration-200 flex items-center group" href="/categoria/aceites-motos">
                  <Icon icon="lucide:chevron-right" className="text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Aceites para Motos
                </Link>
              </li>
              <li>
                <Link className="text-slate-600 hover:text-slate-800 hover:translate-x-1 transition-all duration-200 flex items-center group" href="/categoria/aceites-autos">
                  <Icon icon="lucide:chevron-right" className="text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Aceites para Autos
                </Link>
              </li>
              <li>
                <Link className="text-slate-600 hover:text-slate-800 hover:translate-x-1 transition-all duration-200 flex items-center group" href="/categoria/filtros">
                  <Icon icon="lucide:chevron-right" className="text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Filtros
                </Link>
              </li>
              <li>
                <Link className="text-slate-600 hover:text-slate-800 hover:translate-x-1 transition-all duration-200 flex items-center group" href="/categoria/baterias">
                  <Icon icon="lucide:chevron-right" className="text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Baterías
                </Link>
              </li>
              <li>
                <Link className="text-slate-600 hover:text-slate-800 hover:translate-x-1 transition-all duration-200 flex items-center group" href="/categoria/neumaticos">
                  <Icon icon="lucide:chevron-right" className="text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Neumáticos
                </Link>
              </li>
              <li>
                <Link className="text-slate-600 hover:text-slate-800 hover:translate-x-1 transition-all duration-200 flex items-center group" href="/categoria/herramientas">
                  <Icon icon="lucide:chevron-right" className="text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Herramientas
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Useful Links Section */}
          <div>
            <h3 className="font-bold text-slate-800 text-lg mb-6 relative">
              Enlaces Útiles
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-slate-400 mt-2"></div>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link className="text-slate-600 hover:text-slate-800 hover:translate-x-1 transition-all duration-200 flex items-center group" href="#">
                  <Icon icon="lucide:chevron-right" className="text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link className="text-slate-600 hover:text-slate-800 hover:translate-x-1 transition-all duration-200 flex items-center group" href="#">
                  <Icon icon="lucide:chevron-right" className="text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Contacto
                </Link>
              </li>
              <li>
                <Link className="text-slate-600 hover:text-slate-800 hover:translate-x-1 transition-all duration-200 flex items-center group" href="#">
                  <Icon icon="lucide:chevron-right" className="text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link className="text-slate-600 hover:text-slate-800 hover:translate-x-1 transition-all duration-200 flex items-center group" href="#">
                  <Icon icon="lucide:chevron-right" className="text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link className="text-slate-600 hover:text-slate-800 hover:translate-x-1 transition-all duration-200 flex items-center group" href="#">
                  <Icon icon="lucide:chevron-right" className="text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link className="text-slate-600 hover:text-slate-800 hover:translate-x-1 transition-all duration-200 flex items-center group" href="#">
                  <Icon icon="lucide:chevron-right" className="text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Envíos y Devoluciones
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Newsletter Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-4">
              <Icon icon="lucide:mail" className="text-slate-600 text-3xl mx-auto mb-4" />
              <h3 className="font-bold text-slate-800 text-xl mb-2">Mantente Actualizado</h3>
              <p className="text-slate-600">
                Recibe nuestras ofertas exclusivas y novedades directamente en tu correo electrónico.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                placeholder="tucorreo@ejemplo.com"
                variant="bordered"
                className="flex-1"
                classNames={{
                  input: "text-sm",
                  inputWrapper: "border-slate-200 hover:border-slate-400 focus-within:border-slate-600"
                }}
              />
              <Button 
                className="bg-slate-700 text-white hover:bg-slate-800 transition-colors duration-200 px-8"
                size="lg"
              >
                <Icon icon="lucide:send" className="mr-2 text-sm" />
                Suscribirse
              </Button>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-slate-200 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-slate-500 text-sm text-center sm:text-left">
                © {new Date().getFullYear()} AutoPartesBogotá - Andrés Forero. Todos los derechos reservados.
              </p>
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-xs">Aceptamos:</span>
                <div className="flex items-center gap-3">
                  <div className="bg-white border border-slate-200 rounded px-2 py-1 shadow-sm">
                    <img src="/visa.png" alt="Visa" className="h-4" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded px-2 py-1 shadow-sm">
                    <img src="/mastercard.png" alt="Mastercard" className="h-4" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded px-2 py-1 shadow-sm">
                    <img src="/paypal.png" alt="PayPal" className="h-4" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:shield-check" className="text-green-600" />
                <span>Compra Segura</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:truck" className="text-blue-600" />
                <span>Envío Rápido</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:headphones" className="text-purple-600" />
                <span>Soporte 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};