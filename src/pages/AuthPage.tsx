import { useState } from "react";
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Bienvenido</h2>

        {alert && (
          <div
            className={`p-3 mb-4 rounded-lg text-white ${
              alert.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {alert.message}
          </div>
        )}

        {usuarioLogueado ? (
          <div className="text-center space-y-4">
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
            <Button color="danger" onClick={handleLogout}>
              <Icon icon="lucide:log-out" className="mr-2" />
              Cerrar sesión
            </Button>
          </div>
        ) : (
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as "login" | "register")}
          >
            <Tab key="login" title="Iniciar Sesión">
              <div className="space-y-4 mt-4">
                <Input
                  label="Correo"
                  type="email"
                  value={loginData.correo}
                  onChange={(e) => setLoginData({ ...loginData, correo: e.target.value })}
                />
                <Input
                  label="Contraseña"
                  type="password"
                  value={loginData.contrasena}
                  onChange={(e) => setLoginData({ ...loginData, contrasena: e.target.value })}
                />
                <Button fullWidth color="primary" onClick={handleLogin}>
                  <Icon icon="lucide:log-in" className="mr-2" />
                  Iniciar Sesión
                </Button>
              </div>
            </Tab>

            <Tab key="register" title="Registrarse">
              <div className="space-y-4 mt-4">
                <Input
                  label="Nombre completo"
                  value={registerData.nombre_completo}
                  onChange={(e) => setRegisterData({ ...registerData, nombre_completo: e.target.value })}
                />
                <Input
                  label="Correo"
                  type="email"
                  value={registerData.correo}
                  onChange={(e) => setRegisterData({ ...registerData, correo: e.target.value })}
                />
                <Input
                  label="Contraseña"
                  type="password"
                  value={registerData.contrasena}
                  onChange={(e) => setRegisterData({ ...registerData, contrasena: e.target.value })}
                />
                <Input
                  label="Teléfono"
                  value={registerData.telefono}
                  onChange={(e) => setRegisterData({ ...registerData, telefono: e.target.value })}
                />
                <Input
                  label="Dirección"
                  value={registerData.direccion}
                  onChange={(e) => setRegisterData({ ...registerData, direccion: e.target.value })}
                />
                <Button fullWidth color="success" onClick={handleRegister}>
                  <Icon icon="lucide:user-plus" className="mr-2" />
                  Registrarse
                </Button>
              </div>
            </Tab>
          </Tabs>
        )}
      </div>
    </div>
  );
}
