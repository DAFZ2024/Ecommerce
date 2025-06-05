import React from "react";
import {
  Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Badge, Link, Input
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { Hero } from "./components/hero";
import { Categories } from "./components/categories";
import { FeaturedProducts } from "./components/featured-products";
import { SpecialOffers } from "./components/special-offers";
import { Testimonials } from "./components/testimonials";
import { Footer } from "./components/footer";
import { ShoppingCart } from "./components/shopping-cart";
import { ProductsPage } from "./pages/ProductsPage";
import { ContactPage } from "./pages/ContactPage";
import { OffersPage } from "./pages/OffersPage";



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

function MainHome({
  addToCart,
}: {
  addToCart: (product: Product) => void;
}) {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts addToCart={addToCart} />
      <SpecialOffers addToCart={addToCart} />
      <Testimonials />
    </>
  );
}

export default function App() {
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [cartItems, setCartItems] = React.useState<Product[]>([]);

  const addToCart = (product: Product) => {
    setCartItems((prev) => [...prev, product]);
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar maxWidth="xl" className="shadow-sm">
          <NavbarBrand>
            <Icon icon="lucide:car" className="text-primary text-2xl" />
            <p className="font-bold text-inherit ml-2">AutoPartesBogota</p>
          </NavbarBrand>
          <NavbarContent className="hidden sm:flex gap-4" justify="center">
            <NavbarItem>
              <Link href="/">Inicio</Link>
            </NavbarItem>
            <NavbarItem>
              <Link as={RouterLink} to="/productos">Productos</Link>
            </NavbarItem>
            <NavbarItem>
              <Link as={RouterLink} to="/ofertas">Ofertas</Link>
            </NavbarItem>
            <NavbarItem>
              <Link as={RouterLink} to="/contacto">Contacto</Link>
            </NavbarItem>
          </NavbarContent>
          <NavbarContent justify="end">
            <NavbarItem className="hidden sm:flex">
              <Input
                classNames={{
                  base: "max-w-full sm:max-w-[15rem] h-10",
                  mainWrapper: "h-full",
                  input: "text-small",
                  inputWrapper: "h-full font-normal text-default-500 bg-default-100",
                }}
                placeholder="Buscar productos..."
                size="sm"
                startContent={<Icon icon="lucide:search" className="text-default-400" />}
                type="search"
              />
            </NavbarItem>
            <NavbarItem>
              <Button
                isIconOnly
                variant="light"
                aria-label="Carrito de compras"
                onPress={() => setIsCartOpen(true)}
              >
                <Badge content={cartItems.length} color="primary" shape="circle" size="sm">
                  <Icon icon="lucide:shopping-cart" className="text-xl" />
                </Badge>
              </Button>
            </NavbarItem>
            <NavbarItem className="hidden sm:flex">
              <Button color="primary" variant="flat">
                <Icon icon="lucide:user" className="text-sm" />
                Mi Cuenta
              </Button>
            </NavbarItem>
          </NavbarContent>
        </Navbar>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<MainHome addToCart={addToCart} />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/ofertas" element={<OffersPage addToCart={addToCart} />} />


            {/* Agrega más rutas aquí si las necesitas */}
          </Routes>
        </main>

        <ShoppingCart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          removeItem={removeFromCart}
        />

        <Footer />
      </div>
    </Router>
  );
}
