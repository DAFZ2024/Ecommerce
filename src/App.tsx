import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Badge,
  Link,
  Input,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

import { Hero } from "./components/hero";
import { Categories } from "./components/categories";
import { FeaturedProducts } from "./components/featured-products";
import { SpecialOffers } from "./components/special-offers";
import { Testimonials } from "./components/testimonials";
import { Footer } from "./components/footer";
import { ShoppingCart } from "./components/shopping-cart";
import { Benefits } from "./components/benefits";
import { CallToAction } from "./components/CallToAction";
import { MapPuntosVenta } from "./components/MapPuntosVenta";
import { AuthPage } from "./pages/AuthPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ContactPage } from "./pages/ContactPage";
import { OffersPage } from "./pages/OffersPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import CrudDashboard from './pages/CrudDashboard';


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

export interface CartItem extends Product {
  quantity: number;
}

function MainHome({ addToCart }: { addToCart: (product: Product) => void }) {
  return (
    <>
      <Hero />
      <Benefits />
      <Categories addToCart={addToCart} />
      <SpecialOffers addToCart={addToCart} />
      <FeaturedProducts addToCart={addToCart} />
      <CallToAction />
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
        Nuestros Puntos de Venta
      </h1>
      <p className="text-default-500 text-center mb-8">
        Encuentra nuestras sucursales cerca de ti
      </p>
      <MapPuntosVenta />
      <Testimonials />
    </>
  );
}

function AppWrapper() {
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(() =>
    !!localStorage.getItem("token")
  );

  const navigate = useNavigate();

  const addToCart = (product: Product) => {
    const productWithPrice = { ...product, precio: Number(product.precio) };
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id_producto === product.id_producto);
      return exists
        ? prev.map((item) =>
            item.id_producto === product.id_producto
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prev, { ...productWithPrice, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id_producto !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id_producto === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() === "") {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await fetch(`http://localhost:3001/api/productos/buscar?query=${encodeURIComponent(value)}`);
      const data = await res.json();
      setSearchResults(data);
      setShowDropdown(true);
    } catch (err) {
      console.error("Error en búsqueda:", err);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleCartOpen = () => {
    if (!isLoggedIn) {
      toast.error("Debes iniciar sesión para ver el carrito.");
      navigate("/auth");
      return;
    }
    setIsCartOpen(true);
  };

  const handleLoginSuccess = (token: string) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
    toast.success("¡Bienvenido de nuevo!");
    navigate("/");
  };

  return (
    <>
      <Navbar maxWidth="xl" className="shadow-sm">
        <NavbarBrand>
          <Icon icon="lucide:car" className="text-primary text-2xl" />
          <p className="font-bold text-inherit ml-2">AutoPartesBogota</p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link as={RouterLink} to="/">
              Inicio
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link as={RouterLink} to="/productos">
              Productos
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link as={RouterLink} to="/ofertas">
              Ofertas
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link as={RouterLink} to="/contacto">
              Contacto
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link as={RouterLink} to="/CrudDashboard">
              Dashboard
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem className="hidden sm:flex relative">
            <div className="relative w-full">
              <Input
                classNames={{
                  base: "max-w-full sm:max-w-[15rem] h-10",
                  mainWrapper: "h-full",
                  input: "text-small",
                  inputWrapper:
                    "h-full font-normal text-default-500 bg-default-100",
                }}
                placeholder="Buscar productos..."
                size="sm"
                startContent={
                  <Icon icon="lucide:search" className="text-default-400" />
                }
                type="search"
                value={searchTerm}
                onChange={handleSearch}
              />
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-50 top-full mt-1 w-[25rem] sm:w-[30rem] bg-white shadow-lg rounded-lg max-h-96 overflow-y-auto border border-gray-200">
                  {searchResults.map((product) => (
                    <RouterLink
                      to={`/productos/${product.id_producto}`}
                      key={product.id_producto}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                      onClick={clearSearch}
                    >
                      <img
                        src={`http://localhost:3001${product.imagen_url}`}
                        alt={product.nombre}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <span>{product.nombre}</span>
                    </RouterLink>
                  ))}
                </div>
              )}
            </div>
          </NavbarItem>
          <NavbarItem>
            <Button
              isIconOnly
              variant="light"
              aria-label="Carrito"
              onPress={handleCartOpen}
            >
              <Badge
                content={cartItems.length}
                color="primary"
                shape="circle"
                size="sm"
              >
                <Icon icon="lucide:shopping-cart" className="text-xl" />
              </Badge>
            </Button>
          </NavbarItem>
          <NavbarItem className="hidden sm:flex">
            {isLoggedIn ? (
              <Button
                color="danger"
                onClick={() => {
                  localStorage.removeItem("token");
                  setIsLoggedIn(false);
                  toast("Sesión cerrada", { icon: "👋" });
                  navigate("/");
                }}
              >
                Cerrar Sesión
              </Button>
            ) : (
              <Button as={RouterLink} to="/auth" color="primary" variant="flat">
                <Icon icon="lucide:user" className="text-sm mr-1" />
                Mi Cuenta
              </Button>
            )}
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<MainHome addToCart={addToCart} />} />
          <Route
            path="/productos"
            element={<ProductsPage addToCart={addToCart} />}
          />
          <Route
            path="/contacto"
            element={<ContactPage addToCart={addToCart} />}
          />
          <Route
            path="/CrudDashboard"
            element={<CrudDashboard/>}
          />
          <Route
            path="/ofertas"
            element={<OffersPage addToCart={addToCart} />}
          />
          <Route
            path="/productos/:id"
            element={<ProductDetailPage addToCart={addToCart} />}
          />
          <Route
            path="/auth"
            element={<AuthPage onLoginSuccess={handleLoginSuccess} />}
          />
        </Routes>
      </main>

      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        removeItem={removeFromCart}
        updateQuantity={updateQuantity}
      />

      <Footer />
      <Toaster position="top-center" />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

