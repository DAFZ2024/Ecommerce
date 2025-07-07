import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Button, Card, CardBody, CardFooter } from "@heroui/react";
import React, { useState } from "react";
import Swal from 'sweetalert2';
import { supabase } from '../../lib/supabaseClient';

// Define los tipos de props que recibirá el componente
type Usuario = {
  id_usuario: string;
  nombre_completo: string;
  direccion: string;
  telefono: string;
  rol: "cliente" | "admin";
  avatar_url: string | null;
  foto_perfil: string | null;
};

type UsuarioForm = {
  nombre_completo: string;
  correo: string;
  contrasena: string;
  rol: "cliente" | "admin";
  direccion: string;
  telefono: string;
};

interface UsuariosDashboardProps {
  usuarios: Usuario[];
  fetchAllData: () => void;
}

const UsuariosDashboard: React.FC<UsuariosDashboardProps> = ({
  usuarios,
  fetchAllData,
}) => {
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [showUsuarioForm, setShowUsuarioForm] = useState(false);
  const [editUsuarioId, setEditUsuarioId] = useState<string | null>(null);
  const [usuarioForm, setUsuarioForm] = useState({
    nombre_completo: "",
    correo: "",
    contrasena: "",
    rol: "cliente" as "cliente" | "admin",
    direccion: "",
    telefono: ""
  });

  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.nombre_completo.toLowerCase().includes(busquedaUsuario.toLowerCase())
  );

  const handleAgregarUsuarioClick = () => {
    setEditUsuarioId(null);
    setShowUsuarioForm(true);
    setUsuarioForm({
      nombre_completo: "",
      correo: "",
      contrasena: "",
      rol: "cliente",
      direccion: "",
      telefono: ""
    });
  };

  const handleEditarUsuarioClick = (id_usuario: string) => {
    setEditUsuarioId(id_usuario);
    setShowUsuarioForm(true);
    const usuario = usuarios.find((u) => u.id_usuario === id_usuario);
    if (usuario) {
      setUsuarioForm({
        nombre_completo: usuario.nombre_completo,
        correo: "",
        contrasena: "",
        rol: usuario.rol,
        direccion: usuario.direccion || "",
        telefono: usuario.telefono || ""
      });
    }
  };

  const handleEliminarUsuarioClick = async (id_usuario: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el usuario permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from('usuarios')
          .delete()
          .eq('id_usuario', id_usuario);
        if (error) throw error;
        await Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado con éxito.', 'success');
        fetchAllData();
      } catch (error) {
        console.error("❌ Error al eliminar usuario:", error);
        Swal.fire('Error', 'Hubo un problema al eliminar el usuario.', 'error');
      }
    }
  };

  const handleGuardarUsuario = async () => {
    try {
      if (editUsuarioId === null) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: usuarioForm.correo,
          password: usuarioForm.contrasena,
        });
        if (authError) throw authError;
        if (authData.user) {
          const { error: insertError } = await supabase
            .from('usuarios')
            .insert([{
              id_usuario: authData.user.id,
              nombre_completo: usuarioForm.nombre_completo,
              direccion: usuarioForm.direccion,
              telefono: usuarioForm.telefono,
              rol: usuarioForm.rol,
              avatar_url: null,
              foto_perfil: null
            }]);
          if (insertError) throw insertError;
        }
      } else {
        const { error } = await supabase
          .from('usuarios')
          .update({
            nombre_completo: usuarioForm.nombre_completo,
            direccion: usuarioForm.direccion,
            telefono: usuarioForm.telefono,
            rol: usuarioForm.rol
          })
          .eq('id_usuario', editUsuarioId);
        if (error) throw error;
      }
      await Swal.fire('¡Éxito!', 'El usuario ha sido guardado correctamente.', 'success');
      fetchAllData();
      setShowUsuarioForm(false);
      setEditUsuarioId(null);
      setUsuarioForm({
        nombre_completo: "",
        correo: "",
        contrasena: "",
        rol: "cliente",
        direccion: "",
        telefono: ""
      });
    } catch (error) {
      console.error("❌ Error al guardar el usuario:", error);
      Swal.fire('Error', 'No se pudo guardar el usuario.', 'error');
    }
  };

  const handleUsuarioFormChange = (field: string, value: string) => {
    setUsuarioForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-6 animate-fade-in space-y-10">
    {/* Buscador */}
    <div className="relative w-full max-w-md">
      <input
        type="text"
        placeholder="Buscar por nombre o correo..."
        value={busquedaUsuario}
        onChange={(e) => setBusquedaUsuario(e.target.value)}
        className="w-full px-5 py-3 pr-12 rounded-xl border border-slate-300 bg-white/70 backdrop-blur-md shadow-inner focus:ring-2 focus:ring-indigo-300 focus:outline-none transition-all duration-300"
      />
      <span className="absolute right-3 top-3 text-slate-400">
        <Icon icon="mdi:magnify" className="w-6 h-6" />
      </span>
    </div>

    {/* Botón con animación */}
    <div>
      <Button
        onClick={handleAgregarUsuarioClick}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-5 py-3 rounded-xl shadow-md hover:shadow-xl transition-all"
      >
        <Icon icon="mdi:plus" className="w-5 h-5 mr-2" />
        Agregar Usuario
      </Button>
    </div>

    {/* Formulario */}
    {showUsuarioForm && (
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-8"
      >
        <h3 className="text-2xl font-bold mb-6 text-indigo-800 flex items-center gap-2">
          <Icon icon={editUsuarioId ? "mdi:pencil" : "mdi:account-plus"} className="text-indigo-600" />
          {editUsuarioId ? 'Editar Usuario' : 'Agregar Usuario'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre completo */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Nombre completo</label>
            <input
              type="text"
              value={usuarioForm.nombre_completo}
              onChange={e => handleUsuarioFormChange('nombre_completo', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              required
            />
          </div>
          {/* Correo (solo al crear) */}
          {!editUsuarioId && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Correo electrónico</label>
              <input
                type="email"
                value={usuarioForm.correo}
                onChange={e => handleUsuarioFormChange('correo', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                required
              />
            </div>
                   )}
          {/* Contraseña (solo al crear) */}
          {!editUsuarioId && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Contraseña</label>
              <input
                type="password"
                value={usuarioForm.contrasena}
                onChange={e => handleUsuarioFormChange('contrasena', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                required
              />
            </div>
          )}
          {/* Rol */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Rol</label>
            <select
              value={usuarioForm.rol}
              onChange={e => handleUsuarioFormChange('rol', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            >
              <option value="cliente">Cliente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          {/* Dirección */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Dirección</label>
            <input
              type="text"
              value={usuarioForm.direccion}
              onChange={e => handleUsuarioFormChange('direccion', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>
          {/* Teléfono */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Teléfono</label>
            <input
              type="text"
              value={usuarioForm.telefono}
              onChange={e => handleUsuarioFormChange('telefono', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <Button
            onClick={handleGuardarUsuario}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md"
          >
            {editUsuarioId ? 'Guardar Cambios' : 'Crear Usuario'}
          </Button>
          <Button
            onClick={() => {
              setShowUsuarioForm(false);
              setEditUsuarioId(null);
              setUsuarioForm({
                nombre_completo: "",
                correo: "",
                contrasena: "",
                rol: "cliente",
                direccion: "",
                telefono: ""
              });
            }}
            className="bg-slate-300 hover:bg-slate-400 text-slate-800 font-semibold px-6 py-3 rounded-xl shadow-md"
          >
            Cancelar
          </Button>
        </div>
      </motion.div>
    )}

    {/* Lista de Usuarios */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {usuariosFiltrados.map((usuario) => (
        <motion.div
          key={usuario.id_usuario}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-2xl shadow-lg transition-transform">
            <CardBody>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${usuario.rol === "admin" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                  <Icon icon="mdi:account" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{usuario.nombre_completo}</h3>
                  <p className="text-slate-600 text-sm">{usuario.telefono || "No especificado"}</p>
                  <span className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-semibold ${usuario.rol === "admin" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                    {usuario.rol === "admin" ? "Administrador" : "Cliente"}
                  </span>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:phone" className="text-slate-400" />
                  <span>{usuario.telefono || "No especificado"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:map-marker" className="text-slate-400" />
                  <span>{usuario.direccion || "No especificada"}</span>
                </div>
              </div>
            </CardBody>
            <CardFooter className="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <Button
                variant="bordered"
                onClick={() => handleEditarUsuarioClick(usuario.id_usuario)}
                className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all"
              >
                <Icon icon="mdi:pencil" className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <Button
                variant="solid"
                onClick={() => handleEliminarUsuarioClick(usuario.id_usuario)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
              >
                <Icon icon="mdi:delete" className="w-4 h-4 mr-1" />
                Eliminar
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>

    {/* Animación global */}
    <style>{`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }

      }
      .animate-fade-in {
        animation: fadeIn 0.5s ease-out;
      }
    `}</style>
  </div>
  );
};

export default UsuariosDashboard;