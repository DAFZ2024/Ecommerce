import React, { useState } from "react";
import { Input, Button, Tab, Tabs } from "@heroui/react";
import { Icon } from "@iconify/react";

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
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (res.ok) {
        console.log("✅ Sesión iniciada:", data);
        setUsuarioLogueado(data.usuario);
        localStorage.setItem("token", data.token); // opcional para mantener sesión
        showAlert("success", `Bienvenido, ${data.usuario.nombre_completo}`);
        onLoginSuccess(data.token, data.usuario);  // <-- Aquí llamamos al prop
      } else {
        showAlert("error", data.error || "Error al iniciar sesión");
      }
    } catch (err) {
      console.error("❌ Error al iniciar sesión:", err);
      showAlert("error", "Error de conexión al iniciar sesión");
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData)
      });
      const data = await res.json();
      if (res.ok) {
        showAlert("success", "✅ Registro exitoso. Ahora inicia sesión.");
        setActiveTab("login");
        setRegisterData({ nombre_completo: "", correo: "", contrasena: "", telefono: "", direccion: "" });
      } else {
        showAlert("error", data.error || "Error al registrarse");
      }
    } catch (err) {
      console.error("❌ Error al registrar:", err);
      showAlert("error", "Error de conexión al registrarse");
    }
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
            <Button color="destructive" onClick={() => setUsuarioLogueado(null)}>
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
