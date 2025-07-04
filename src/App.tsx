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
import { supabase } from "./lib/supabaseClient";
import { Hero } from "./components/hero";
import { Categories } from "./components/categories";
import { FeaturedProducts } from "./components/featured-products";
import { SpecialOffers } from "./components/special-offers";
import { Testimonials } from "./components/testimonials";
import { Footer } from "./components/footer";
import { ShoppingCart } from "./components/shopping-cart";
import  ModernElegantCarousel from "./components/Slider";
import { CallToAction } from "./components/CallToAction";
import  MapPuntosVenta  from "./components/MapPuntosVenta";
import CompetitiveAdvantages from './components/CompetitiveAdvantages';
import OfferModal from "./components/OfferModal";
import { HistorialPedidos } from './pages/HistorialPedidos';
import ClientDashboard from './pages/ClientDashboard';
import { AuthPage } from "./pages/AuthPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ContactPage } from "./pages/ContactPage";
import { OffersPage } from "./pages/OffersPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import  Gracias  from "./pages/Gracias";
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

// ✅ Interfaz para el usuario actualizada para Supabase
interface User {
  id: string; // UUID de Supabase Auth
  email: string;
  nombre_completo: string; // Desde tabla usuarios
  direccion?: string;
  telefono?: string;
  rol: string;
  avatar_url: string | null;
  foto_perfil?: string | null;
}

function MainHome({ addToCart }: { addToCart: (product: Product) => void }) {
  return (
    <>
      <Hero />
      <Categories addToCart={addToCart} />
      <CallToAction />
      <SpecialOffers addToCart={addToCart} />
      <ModernElegantCarousel />
      <FeaturedProducts addToCart={addToCart} />
      <CompetitiveAdvantages/>
      <MapPuntosVenta />
      <Testimonials />
    </>
  );
}

// ✅ Función mejorada para decodificar el JWT (legacy, ya no se usa con Supabase)
const getUserFromToken = (token: string): User | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    return {
      id: payload.userId || payload.id_usuario || payload.id,
      email: payload.email || payload.correo,
      nombre_completo: payload.nombre || payload.nombre_completo,
      rol: payload.rol,
      avatar_url: payload.avatar_url || null
    };
  } catch (error) {
    console.error('❌ Error decodificando token:', error);
    return null;
  }
};

// ✅ Función para verificar si el token es válido
const isTokenValid = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    
    // Verificar si el token ha expirado
    if (payload.exp && payload.exp < now) {
      console.warn('⚠️ Token expirado');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Token inválido:', error);
    return false;
  }
};

function AppWrapper() {
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showOfferModal, setShowOfferModal] = React.useState(false);
  const [bestOfferProduct, setBestOfferProduct] = React.useState<Product | null>(null);
  const location = useLocation();

  // Componente de ruta protegida para admin (movido aquí para acceder al estado del usuario)
  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    console.log('🔍 AdminRoute - Estado del usuario:', { isLoggedIn, user, rol: user?.rol });
    
    if (!isLoggedIn || !user || user.rol !== 'admin') {
      console.log('❌ AdminRoute - Acceso denegado. Redirigiendo al inicio.');
      return <Navigate to="/" replace />;
    }
    
    console.log('✅ AdminRoute - Acceso permitido para admin:', user.nombre_completo);
    return <>{children}</>;
  };

   // 3. Función para obtener el producto con mayor oferta
  const fetchBestOffer = async () => {
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
        .eq('en_oferta', true)
        .gt('descuento', 0)
        .order('descuento', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error al obtener productos en oferta:', error);
        return;
      }

      if (data && data.length > 0) {
        const item = data[0];
        const bestOffer: Product = {
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
        };
        
        setBestOfferProduct(bestOffer);
        
        // Verificar si ya se mostró el modal hoy
        const today = new Date().toDateString();
        const lastShown = localStorage.getItem('offerModalLastShown');
        
        if (lastShown !== today) {
          setShowOfferModal(true);
          localStorage.setItem('offerModalLastShown', today);
        }
      }
    } catch (error) {
      console.error('Error al obtener productos en oferta:', error);
    }
  };

  // 4. Función para manejar la navegación al producto
  const handleViewProduct = (productId: number) => {
    navigate(`/productos/${productId}`);
  };

  // 5. Función para cerrar el modal
  const handleCloseOfferModal = () => {
    setShowOfferModal(false);
  };


  React.useEffect(() => {
  const currentPath = location.pathname;
  
  // Solo mostrar en la página de inicio
  if (currentPath === '/') {
    const timer = setTimeout(() => {
      fetchBestOffer();
    }, 2000);

    return () => clearTimeout(timer);
  }
}, [location.pathname]);







  
  // ✅ Estado mejorado para autenticación con Supabase
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);

  // Verificar sesión inicial con Supabase
  React.useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && session.user.id) {
        const { data: usuarioExtra } = await supabase
          .from("usuarios")
          .select("*")
          .eq("id_usuario", session.user.id)
          .single();
        
        if (usuarioExtra) {
          const usuarioCombinado = {
            id: session.user.id,
            email: session.user.email || "",
            nombre_completo: usuarioExtra.nombre_completo,
            direccion: usuarioExtra.direccion,
            telefono: usuarioExtra.telefono,
            rol: usuarioExtra.rol,
            avatar_url: usuarioExtra.avatar_url,
            foto_perfil: usuarioExtra.foto_perfil
          };
          
          setUser(usuarioCombinado);
          setIsLoggedIn(true);
        }
      }
    };
    
    checkSession();
  }, []);

  const navigate = useNavigate();

  // Función para verificar si el usuario es admin
  const isAdmin = () => {
    const result = user && user.rol === 'admin';
    console.log('🔍 isAdmin() llamado:', { user: user?.nombre_completo, rol: user?.rol, resultado: result });
    return result;
  };

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

  const clearCart = () => {
    setCartItems([]);
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('🔍 Búsqueda iniciada con:', value);
    
    setSearchTerm(value);
    
    if (value.trim() === "") {
      console.log('📭 Búsqueda vacía, limpiando resultados');
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    if (value.trim().length < 2) {
      console.log('📝 Búsqueda muy corta, esperando más caracteres');
      setShowDropdown(false);
      return;
    }
    
    try {
      setIsSearching(true);
      console.log('🔎 Realizando búsqueda en Supabase...');
      
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          categorias!inner(
            id_categoria,
            nombre_categoria
          )
        `)
        .or(`nombre.ilike.%${value}%,descripcion.ilike.%${value}%`)
        .limit(10);

      if (error) {
        console.error("❌ Error en búsqueda:", error);
        setSearchResults([]);
        setShowDropdown(false);
      } else {
        console.log('✅ Resultados encontrados:', data?.length || 0);
        
        // Transformar los datos para mantener compatibilidad
        const transformedResults: Product[] = data.map((item: any) => ({
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
        
        setSearchResults(transformedResults);
        setShowDropdown(transformedResults.length > 0);
        
        console.log('🎯 Dropdown mostrado:', transformedResults.length > 0);
      }
    } catch (err) {
      console.error("❌ Error en búsqueda:", err);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  // Función para manejar clic en un resultado de búsqueda
  const handleSearchResultClick = () => {
    clearSearch();
  };

  // Cerrar dropdown al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const searchContainer = target.closest('.search-container');
      
      console.log('🖱️ Click detectado, dentro del search-container:', !!searchContainer);
      
      if (!searchContainer) {
        console.log('📤 Cerrando dropdown por click fuera');
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      console.log('👂 Agregando listener para clicks fuera');
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        console.log('🗑️ Removiendo listener para clicks fuera');
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown]);

  // Debug del estado del dropdown
  React.useEffect(() => {
    console.log('🔄 Estado del dropdown:', {
      showDropdown,
      searchResultsLength: searchResults.length,
      searchTerm: searchTerm.length
    });
  }, [showDropdown, searchResults.length, searchTerm]);

  const handleCartOpen = () => {
    if (!isLoggedIn) {
      toast.error("Debes iniciar sesión para ver el carrito.");
      navigate("/auth");
      return;
    }
    setIsCartOpen(true);
  };

  // ✅ Función actualizada para manejar login exitoso con Supabase
  const handleLoginSuccess = (token: string, usuario: any) => {
    console.log('🔑 handleLoginSuccess llamado con:', { token: token ? 'presente' : 'ausente', usuario });
    localStorage.setItem("token", token);
    
    if (usuario && usuario.id) {
      console.log('👤 Estableciendo usuario en estado global:', usuario);
      setUser(usuario);
      setIsLoggedIn(true);
      toast.success(`¡Bienvenido ${usuario.nombre_completo}!`);
      navigate("/");
    } else {
      console.error('❌ Error: datos de usuario inválidos');
      toast.error("Error al procesar datos de usuario");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    setCartItems([]); // Limpiar carrito al cerrar sesión
    toast("Sesión cerrada", { icon: "👋" });
    navigate("/");
  };

  return (
    <>
        <Navbar maxWidth="xl" className="shadow-sm relative z-40">
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
            {isLoggedIn && user && user.rol === "cliente" && (
              <NavbarItem>
                <Link as={RouterLink} to="/dashboard">
                  Dashboard
                </Link>
              </NavbarItem>
            )}
            

            {/* Solo mostrar Dashboard si el usuario es admin */}
            {isAdmin() && (
              <NavbarItem>
                <Link as={RouterLink} to="/CrudDashboard">
                  Dashboard
                </Link>
              </NavbarItem>
            )}

            
          </NavbarContent>
          <NavbarContent justify="end">
            <NavbarItem className="hidden sm:flex">
              <div className="relative search-container">
                <Input
                  classNames={{
                    base: "w-[15rem] h-10",
                    mainWrapper: "h-full",
                    input: "text-small",
                    inputWrapper:
                      "h-full font-normal text-default-500 bg-default-100",
                  }}
                  placeholder="Buscar productos..."
                  size="sm"
                  startContent={
                    isSearching ? (
                      <Icon icon="lucide:loader-2" className="text-default-400 animate-spin" />
                    ) : (
                      <Icon icon="lucide:search" className="text-default-400" />
                    )
                  }
                  type="search"
                  value={searchTerm}
                  onChange={handleSearch}
                  onFocus={() => {
                    console.log('🎯 Input focused, searchResults length:', searchResults.length);
                    if (searchResults.length > 0 && searchTerm.trim().length >= 2) {
                      setShowDropdown(true);
                    }
                  }}
                  onClick={() => {
                    console.log('🖱️ Input clicked, searchResults length:', searchResults.length);
                    if (searchResults.length > 0 && searchTerm.trim().length >= 2) {
                      setShowDropdown(true);
                    }
                  }}
                />
                {(showDropdown && searchTerm.trim().length >= 2) && (
                  <div 
                    className="absolute z-[9999] top-full mt-2 w-[400px] bg-white shadow-2xl rounded-lg max-h-96 overflow-y-auto border border-gray-200 right-0"
                    style={{
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    <div className="p-2">
                      {isSearching ? (
                        <div className="flex items-center justify-center py-4">
                          <Icon icon="lucide:loader-2" className="animate-spin mr-2" />
                          <span className="text-sm text-gray-500">Buscando...</span>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <>
                          <div className="text-xs text-gray-500 px-2 py-1 border-b">
                            {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                          </div>
                          {searchResults.map((product) => (
                            <RouterLink
                              to={`/productos/${product.id_producto}`}
                              key={product.id_producto}
                              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 rounded transition-colors block"
                              onClick={handleSearchResultClick}
                            >
                              <img
                                src={product.imagen_url || '/placeholder-product.jpg'}
                                alt={product.nombre}
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder-product.jpg';
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">{product.nombre}</div>
                                <div className="text-xs text-gray-500 truncate">{product.descripcion}</div>
                                <div className="text-sm font-semibold text-green-600 mt-1">
                                  ${product.precio.toLocaleString('es-CO')}
                                  {product.en_oferta && product.descuento > 0 && (
                                    <span className="ml-2 text-xs text-red-500">
                                      -{product.descuento}% OFF
                                    </span>
                                  )}
                                </div>
                              </div>
                            </RouterLink>
                          ))}
                        </>
                      ) : (
                        <div className="flex items-center justify-center py-4 text-gray-500">
                          <Icon icon="lucide:search-x" className="mr-2" />
                          <span className="text-sm">No se encontraron productos para "{searchTerm}"</span>
                        </div>
                      )}
                    </div>
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
              {isLoggedIn && user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Hola, {user.nombre_completo}
                    {isAdmin() && (
                      <Badge color="warning" size="sm" className="ml-1">
                        Admin
                      </Badge>
                    )}
                  </span>
                  <Button color="danger" size="sm" onClick={handleLogout}>
                    Cerrar Sesión
                  </Button>
                </div>
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
            element={<ContactPage />}
          />
          {/* Ruta protegida para admin */}
          <Route
            path="/CrudDashboard"
            element={
              <AdminRoute>
                <CrudDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              isLoggedIn ? <ClientDashboard /> : <Navigate to="/auth" replace />
            }
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
          <Route path="/Gracias" element={<Gracias />} />
          <Route path="/historial" element={<HistorialPedidos />} />
        </Routes>
      </main>

      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        removeItem={removeFromCart}
        updateQuantity={updateQuantity}
        currentUser={user}
        clearCart={clearCart}
      />

      <OfferModal
        isOpen={showOfferModal}
        onClose={handleCloseOfferModal}
        addToCart={addToCart}
        onViewProduct={handleViewProduct}
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
