import { useEffect, useState } from "react";
import { Input, Button, Tab, Tabs } from "@heroui/react";
import { Icon } from "@iconify/react";
import { supabase } from "../lib/supabaseClient";

interface AuthPageProps {
  onLoginSuccess: (token: string, usuario: any) => void;
}

export function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loginData, setLoginData] = useState({ correo: "", contrasena: "" });
  const [registerData, setRegisterData] = useState({
    nombre_completo: "",
    correo: "",
    contrasena: "",
    telefono: "",
    direccion: ""
  });
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [usuarioLogueado, setUsuarioLogueado] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        // Redirigir si ya hay sesión
        window.location.href = "/dashboard";
      } else {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.correo,
        password: loginData.contrasena,
      });
      
      if (error || !data.user) {
        showAlert("error", error?.message || "Error al iniciar sesión");
        return;
      }
      
      if (!data.user.id) {
        showAlert("error", "Usuario sin ID válido. Verifica la configuración de Supabase Auth.");
        return;
      }
      
      // Obtener datos adicionales del usuario
      const { data: usuarioExtra, error: errorUsuario } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id_usuario", data.user.id)
        .single();
      if (errorUsuario) {
        showAlert("error", "No se pudo obtener datos del usuario");
        return;
      }
      
      // Verificar el rol del usuario desde la tabla usuarios
      const esAdmin = usuarioExtra.rol === 'admin';
      
      // Estructura correcta del usuario combinado
      const usuarioCombinado = {
        id: data.user.id, // ID de Supabase Auth
        email: data.user.email || "",
        nombre_completo: usuarioExtra.nombre_completo,
        direccion: usuarioExtra.direccion,
        telefono: usuarioExtra.telefono,
        rol: usuarioExtra.rol,
        avatar_url: usuarioExtra.avatar_url,
        foto_perfil: usuarioExtra.foto_perfil
      };
      
      setUsuarioLogueado(usuarioCombinado);
      localStorage.setItem("token", data.session?.access_token || "");
      
      if (esAdmin) {
        showAlert("success", `Bienvenido Admin, ${usuarioExtra.nombre_completo}. Puedes acceder al panel de administración desde la barra de navegación.`);
      } else {
        showAlert("success", `Bienvenido, ${usuarioExtra.nombre_completo}`);
      }
      
      onLoginSuccess(data.session?.access_token || "", usuarioCombinado);
    } catch (err) {
      console.error("❌ Error al iniciar sesión:", err);
      showAlert("error", "Error de conexión al iniciar sesión");
    }
  };

  const handleRegister = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerData.correo,
        password: registerData.contrasena,
      });
      if (error || !data.user) {
        showAlert("error", error?.message || "Error al registrarse");
        return;
      }
      // Insertar datos adicionales en la tabla usuarios
      const { error: errorInsert } = await supabase.from("usuarios").insert([
        {
          id_usuario: data.user.id,
          nombre_completo: registerData.nombre_completo,
          direccion: registerData.direccion,
          telefono: registerData.telefono,
          avatar_url: null,
          foto_perfil: null,
          rol: "cliente",
        },
      ]);
      if (errorInsert) {
        showAlert("error", "Registro en auth exitoso, pero error al guardar datos adicionales");
        return;
      }
      showAlert("success", "✅ Registro exitoso. Ahora inicia sesión.");
      setActiveTab("login");
      setRegisterData({ nombre_completo: "", correo: "", contrasena: "", telefono: "", direccion: "" });
    } catch (err) {
      console.error("❌ Error al registrar:", err);
      showAlert("error", "Error de conexión al registrarse");
    }
  };

  const handleLogout = () => {
    setUsuarioLogueado(null);
    localStorage.removeItem("token");
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-lg">Verificando sesión...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      {/* Elementos decorativos animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-2000"></div>
      </div>

      {/* Iconos flotantes animados */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 animate-bounce delay-300">
          <Icon icon="lucide:car" className="text-blue-400 text-2xl opacity-20" />
        </div>
        <div className="absolute top-32 right-32 animate-bounce delay-700">
          <Icon icon="lucide:wrench" className="text-purple-400 text-2xl opacity-20" />
        </div>
        <div className="absolute bottom-32 left-32 animate-bounce delay-1000">
          <Icon icon="lucide:settings" className="text-pink-400 text-2xl opacity-20" />
        </div>
        <div className="absolute bottom-20 right-20 animate-bounce delay-1500">
          <Icon icon="lucide:truck" className="text-indigo-400 text-2xl opacity-20" />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
          
          {/* Sección de bienvenida e información */}
          <div className="space-y-8 text-center md:text-left">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AutoPartes Bogotá
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Tu socio confiable en repuestos automotrices
              </p>
            </div>

            {/* Beneficios para login */}
            {activeTab === "login" && (
              <div className="animate-fade-in-up delay-300 space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    ¡Bienvenido de vuelta! 🚗
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:check-circle" className="text-green-500 text-lg" />
                      <span className="text-gray-700">Acceso a tu historial de compras</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:truck" className="text-blue-500 text-lg" />
                      <span className="text-gray-700">Seguimiento de envíos en tiempo real</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:heart" className="text-red-500 text-lg" />
                      <span className="text-gray-700">Lista de deseos personalizada</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:gift" className="text-purple-500 text-lg" />
                      <span className="text-gray-700">Descuentos exclusivos para miembros</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Beneficios para registro */}
            {activeTab === "register" && (
              <div className="animate-fade-in-up delay-300 space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    ¡Únete a nuestra familia! 🎉
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:percent" className="text-green-500 text-lg" />
                      <span className="text-gray-700">15% de descuento en tu primera compra</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:shield-check" className="text-blue-500 text-lg" />
                      <span className="text-gray-700">Garantía extendida en todos los productos</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:phone" className="text-purple-500 text-lg" />
                      <span className="text-gray-700">Soporte técnico 24/7 gratuito</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:map-pin" className="text-red-500 text-lg" />
                      <span className="text-gray-700">Envío gratis en Bogotá y alrededores</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
                  <h4 className="text-lg font-semibold mb-2">🎁 Oferta especial de bienvenida</h4>
                  <p className="text-sm opacity-90">
                    Regístrate hoy y recibe un kit de herramientas básicas GRATIS con tu primera compra mayor a $100.000
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Formulario de autenticación */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20 animate-fade-in-up delay-500">
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                Bienvenido
              </h2>

              {alert && (
                <div className={`p-4 mb-6 rounded-xl text-white font-medium animate-bounce ${
                  alert.type === "success" ? "bg-green-500" : "bg-red-500"
                }`}>
                  <div className="flex items-center gap-2">
                    <Icon icon={alert.type === "success" ? "lucide:check-circle" : "lucide:alert-circle"} />
                    {alert.message}
                  </div>
                </div>
              )}

              {usuarioLogueado ? (
                <div className="text-center space-y-4 animate-fade-in-up">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon icon="lucide:user" className="text-white text-2xl" />
                  </div>
                  <p className="text-lg font-medium">
                    Estás logueado como <span className="font-bold">{usuarioLogueado.nombre_completo}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Rol: <span className="font-semibold capitalize">{usuarioLogueado.rol}</span>
                  </p>
                  {usuarioLogueado.rol === 'admin' && (
                    <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                      Como administrador, puedes acceder al panel de control desde la barra de navegación.
                    </p>
                  )}
                  <Button color="danger" onClick={handleLogout} className="mt-4">
                    <Icon icon="lucide:log-out" className="mr-2" />
                    Cerrar sesión
                  </Button>
                </div>
              ) : (
                <Tabs
                  selectedKey={activeTab}
                  onSelectionChange={(key) => setActiveTab(key as "login" | "register")}
                  variant="underlined"
                  className="w-full"
                >
                  <Tab key="login" title="Iniciar Sesión">
                    <div className="space-y-4 mt-4">
                      <Input
                        label="Correo"
                        type="email"
                        placeholder="tu@email.com"
                        value={loginData.correo}
                        onChange={(e) => setLoginData({ ...loginData, correo: e.target.value })}
                        startContent={<Icon icon="lucide:mail" className="text-gray-400" />}
                        variant="bordered"
                      />
                      <Input
                        label="Contraseña"
                        type="password"
                        placeholder="••••••••"
                        value={loginData.contrasena}
                        onChange={(e) => setLoginData({ ...loginData, contrasena: e.target.value })}
                        startContent={<Icon icon="lucide:lock" className="text-gray-400" />}
                        variant="bordered"
                      />
                      <Button 
                        fullWidth 
                        color="primary" 
                        onClick={handleLogin}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 font-semibold"
                      >
                        <Icon icon="lucide:log-in" className="mr-2" />
                        Iniciar Sesión
                      </Button>
                    </div>
                  </Tab>

                  <Tab key="register" title="Registrarse">
                    <div className="space-y-4 mt-4">
                      <Input
                        label="Nombre completo"
                        placeholder="Juan Pérez"
                        value={registerData.nombre_completo}
                        onChange={(e) => setRegisterData({ ...registerData, nombre_completo: e.target.value })}
                        startContent={<Icon icon="lucide:user" className="text-gray-400" />}
                        variant="bordered"
                      />
                      <Input
                        label="Correo"
                        type="email"
                        placeholder="tu@email.com"
                        value={registerData.correo}
                        onChange={(e) => setRegisterData({ ...registerData, correo: e.target.value })}
                        startContent={<Icon icon="lucide:mail" className="text-gray-400" />}
                        variant="bordered"
                      />
                      <Input
                        label="Contraseña"
                        type="password"
                        placeholder="••••••••"
                        value={registerData.contrasena}
                        onChange={(e) => setRegisterData({ ...registerData, contrasena: e.target.value })}
                        startContent={<Icon icon="lucide:lock" className="text-gray-400" />}
                        variant="bordered"
                      />
                      <Input
                        label="Teléfono"
                        placeholder="320 123 4567"
                        value={registerData.telefono}
                        onChange={(e) => setRegisterData({ ...registerData, telefono: e.target.value })}
                        startContent={<Icon icon="lucide:phone" className="text-gray-400" />}
                        variant="bordered"
                      />
                      <Input
                        label="Dirección"
                        placeholder="Calle 123 #45-67, Bogotá"
                        value={registerData.direccion}
                        onChange={(e) => setRegisterData({ ...registerData, direccion: e.target.value })}
                        startContent={<Icon icon="lucide:map-pin" className="text-gray-400" />}
                        variant="bordered"
                      />
                      <Button 
                        fullWidth 
                        color="success" 
                        onClick={handleRegister}
                        className="bg-gradient-to-r from-green-500 to-blue-600 font-semibold"
                      >
                        <Icon icon="lucide:user-plus" className="mr-2" />
                        Registrarse
                      </Button>
                    </div>
                  </Tab>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
        }
        
        .delay-700 {
          animation-delay: 0.7s;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
        
        .delay-1500 {
          animation-delay: 1.5s;
        }
        
        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}