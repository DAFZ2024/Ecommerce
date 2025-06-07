import React, { useState, useEffect } from "react";
import { Card, CardBody, CardFooter, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";

type Usuario = {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  contrasena: string;
  rol: "cliente" | "admin";
  direccion: string;
  telefono: string;
};

type Categoria = {
  id_categoria: number;
  nombre_categoria: string;
};

type Producto = {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  puntuacion: number;
  imagen_url: string;
  id_categoria: number;
  en_oferta: boolean;
  descuento: number;
};

const categoriaIcons = [
  { id_categoria: 1, icon: "lucide:droplet", color: "text-blue-500", bgColor: "bg-blue-100" },
  { id_categoria: 2, icon: "lucide:fuel", color: "text-green-500", bgColor: "bg-green-100" },
  { id_categoria: 3, icon: "lucide:filter", color: "text-amber-500", bgColor: "bg-amber-100" },
  { id_categoria: 4, icon: "lucide:battery-charging", color: "text-red-500", bgColor: "bg-red-100" },
  { id_categoria: 5, icon: "lucide:circle-dot", color: "text-purple-500", bgColor: "bg-purple-100" },
  { id_categoria: 6, icon: "lucide:wrench", color: "text-gray-500", bgColor: "bg-gray-100" },
  { id_categoria: 7, icon: "lucide:glass-water", color: "text-yellow-600", bgColor: "bg-yellow-100" },
  { id_categoria: 8, icon: "lucide:store", color: "text-pink-500", bgColor: "bg-pink-100" },
  { id_categoria: 9, icon: "lucide:settings", color: "text-cyan-500", bgColor: "bg-cyan-100" },
  { id_categoria: 10, icon: "lucide:cpu", color: "text-indigo-500", bgColor: "bg-indigo-100" },
];

const CrudDashboard = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [tab, setTab] = useState<"usuarios" | "categorias" | "productos">("usuarios");

  // Estados para formulario de categorías
  const [showCategoriaForm, setShowCategoriaForm] = useState(false);
  const [editCategoriaId, setEditCategoriaId] = useState<number | null>(null);
  const [nombreCategoria, setNombreCategoria] = useState("");

  // Estados para formulario de productos
  const [showProductoForm, setShowProductoForm] = useState(false);
  const [editProductoId, setEditProductoId] = useState<number | null>(null);
  const [productoForm, setProductoForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    puntuacion: "0",
    imagen_url: "",
    id_categoria: "",
    en_oferta: false,
    descuento: "0"
  });

  // Estados para formulario de usuarios
  const [showUsuarioForm, setShowUsuarioForm] = useState(false);
  const [editUsuarioId, setEditUsuarioId] = useState<number | null>(null);
  const [usuarioForm, setUsuarioForm] = useState({
    nombre_completo: "",
    correo: "",
    contrasena: "",
    rol: "cliente" as "cliente" | "admin",
    direccion: "",
    telefono: ""
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (editCategoriaId !== null) {
      const categoria = categorias.find((c) => c.id_categoria === editCategoriaId);
      if (categoria) {
        setNombreCategoria(categoria.nombre_categoria);
      }
    } else {
      setNombreCategoria("");
    }
  }, [editCategoriaId]);

  useEffect(() => {
    if (editProductoId !== null) {
      const producto = productos.find((p) => p.id_producto === editProductoId);
      if (producto) {
        setProductoForm({
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: producto.precio.toString(),
          stock: producto.stock.toString(),
          puntuacion: producto.puntuacion.toString(),
          imagen_url: producto.imagen_url,
          id_categoria: producto.id_categoria.toString(),
          en_oferta: producto.en_oferta,
          descuento: producto.descuento.toString()
        });
      }
    } else {
      setProductoForm({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        puntuacion: "0",
        imagen_url: "",
        id_categoria: "",
        en_oferta: false,
        descuento: "0"
      });
    }
  }, [editProductoId]);

  useEffect(() => {
    if (editUsuarioId !== null) {
      const usuario = usuarios.find((u) => u.id_usuario === editUsuarioId);
      if (usuario) {
        setUsuarioForm({
          nombre_completo: usuario.nombre_completo,
          correo: usuario.correo,
          contrasena: "", // No mostramos la contraseña hasheada
          rol: usuario.rol,
          direccion: usuario.direccion,
          telefono: usuario.telefono
        });
      }
    } else {
      setUsuarioForm({
        nombre_completo: "",
        correo: "",
        contrasena: "",
        rol: "cliente",
        direccion: "",
        telefono: ""
      });
    }
  }, [editUsuarioId]);

  const fetchAllData = async () => {
    try {
      const [resAdmins, resClientes, resCategorias, resProductos] = await Promise.all([
        axios.get("/api/usuarios-rol/admin"),
        axios.get("/api/usuarios-rol/cliente"),
        axios.get("/api/categorias"),
        axios.get("/api/productos"),
      ]);
      setUsuarios([...resAdmins.data, ...resClientes.data]);
      setCategorias(resCategorias.data);
      setProductos(resProductos.data);
    } catch (error) {
      console.error("Error al cargar datos", error);
    }
  };

  // Funciones para categorías
  const handleAgregarCategoriaClick = () => {
    setEditCategoriaId(null);
    setShowCategoriaForm(true);
  };

  const handleEditarCategoriaClick = (id_categoria: number) => {
    setEditCategoriaId(id_categoria);
    setShowCategoriaForm(true);
  };

  const handleEliminarCategoriaClick = async (id_categoria: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta categoría?")) return;
    try {
      await axios.delete(`/api/categorias/${id_categoria}`);
      fetchAllData();
    } catch (error) {
      console.error("Error al eliminar categoría", error);
    }
  };

  const handleGuardarCategoria = async () => {
    try {
      if (editCategoriaId === null) {
        await axios.post("/api/categorias", { nombre_categoria: nombreCategoria });
      } else {
        await axios.put(`/api/categorias/${editCategoriaId}`, { nombre_categoria: nombreCategoria });
      }
      fetchAllData();
      setShowCategoriaForm(false);
      setEditCategoriaId(null);
      setNombreCategoria("");
    } catch (error) {
      console.error("Error al guardar la categoría", error);
    }
  };

  // Funciones para productos
  const handleAgregarProductoClick = () => {
    setEditProductoId(null);
    setShowProductoForm(true);
  };

  const handleEditarProductoClick = (id_producto: number) => {
    setEditProductoId(id_producto);
    setShowProductoForm(true);
  };

  const handleEliminarProductoClick = async (id_producto: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return;
    try {
      await axios.delete(`/api/productos/${id_producto}`);
      fetchAllData();
    } catch (error) {
      console.error("Error al eliminar producto", error);
    }
  };

  const handleGuardarProducto = async () => {
    try {
      const productoData = {
        nombre: productoForm.nombre,
        descripcion: productoForm.descripcion,
        precio: parseFloat(productoForm.precio),
        stock: parseInt(productoForm.stock),
        puntuacion: parseFloat(productoForm.puntuacion),
        imagen_url: productoForm.imagen_url,
        id_categoria: parseInt(productoForm.id_categoria),
        en_oferta: productoForm.en_oferta,
        descuento: parseFloat(productoForm.descuento)
      };

      if (editProductoId === null) {
        await axios.post("/api/productos", productoData);
      } else {
        await axios.put(`/api/productos/${editProductoId}`, productoData);
      }
      
      fetchAllData();
      setShowProductoForm(false);
      setEditProductoId(null);
      setProductoForm({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        puntuacion: "0",
        imagen_url: "",
        id_categoria: "",
        en_oferta: false,
        descuento: "0"
      });
    } catch (error) {
      console.error("Error al guardar el producto", error);
    }
  };

  const handleProductoFormChange = (field: string, value: string | boolean) => {
    setProductoForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funciones para usuarios
  const handleAgregarUsuarioClick = () => {
    setEditUsuarioId(null);
    setShowUsuarioForm(true);
  };

  const handleEditarUsuarioClick = (id_usuario: number) => {
    setEditUsuarioId(id_usuario);
    setShowUsuarioForm(true);
  };

  const handleEliminarUsuarioClick = async (id_usuario: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) return;
    try {
      await axios.delete(`/api/usuarios/${id_usuario}`);
      fetchAllData();
    } catch (error) {
      console.error("Error al eliminar usuario", error);
    }
  };

  const handleGuardarUsuario = async () => {
    try {
      const usuarioData = {
        nombre_completo: usuarioForm.nombre_completo,
        correo: usuarioForm.correo,
        rol: usuarioForm.rol,
        direccion: usuarioForm.direccion,
        telefono: usuarioForm.telefono
      };

      if (editUsuarioId === null) {
        // Para crear nuevo usuario, incluimos la contraseña
        await axios.post("/api/usuarios", {
          ...usuarioData,
          contrasena: usuarioForm.contrasena
        });
      } else {
        // Para actualizar, no enviamos contraseña (se maneja por separado)
        await axios.put(`/api/usuarios/${editUsuarioId}`, usuarioData);
      }
      
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
      console.error("Error al guardar el usuario", error);
    }
  };

  const handleUsuarioFormChange = (field: string, value: string) => {
    setUsuarioForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderUsuarios = () => (
    <div>
      <div className="mb-4">
        <Button onClick={handleAgregarUsuarioClick} variant="default" size="sm" className="flex items-center gap-1">
          <Icon icon="mdi:plus" /> Agregar Usuario
        </Button>
      </div>

      {showUsuarioForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">
            {editUsuarioId ? "Editar Usuario" : "Agregar Nuevo Usuario"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre Completo</label>
              <input
                type="text"
                value={usuarioForm.nombre_completo}
                onChange={(e) => handleUsuarioFormChange("nombre_completo", e.target.value)}
                placeholder="Nombre completo"
                className="border px-3 py-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={usuarioForm.correo}
                onChange={(e) => handleUsuarioFormChange("correo", e.target.value)}
                placeholder="correo@ejemplo.com"
                className="border px-3 py-2 rounded w-full"
              />
            </div>

            {editUsuarioId === null && (
              <div>
                <label className="block text-sm font-medium mb-1">Contraseña</label>
                <input
                  type="password"
                  value={usuarioForm.contrasena}
                  onChange={(e) => handleUsuarioFormChange("contrasena", e.target.value)}
                  placeholder="Contraseña"
                  className="border px-3 py-2 rounded w-full"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Rol</label>
              <select
                value={usuarioForm.rol}
                onChange={(e) => handleUsuarioFormChange("rol", e.target.value)}
                className="border px-3 py-2 rounded w-full"
              >
                <option value="cliente">Cliente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input
                type="tel"
                value={usuarioForm.telefono}
                onChange={(e) => handleUsuarioFormChange("telefono", e.target.value)}
                placeholder="Teléfono"
                className="border px-3 py-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Dirección</label>
              <input
                type="text"
                value={usuarioForm.direccion}
                onChange={(e) => handleUsuarioFormChange("direccion", e.target.value)}
                placeholder="Dirección"
                className="border px-3 py-2 rounded w-full"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleGuardarUsuario} variant="default">
              <Icon icon="mdi:content-save" /> Guardar
            </Button>
            <Button 
              onClick={() => { 
                setShowUsuarioForm(false); 
                setEditUsuarioId(null); 
              }} 
              variant="outline"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {usuarios.map((usuario) => (
          <Card key={usuario.id_usuario} className="border border-default-200">
            <CardBody>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-bold text-lg">{usuario.nombre_completo}</div>
                  <div className="text-gray-600 mb-1">{usuario.correo}</div>
                  <div className="flex gap-2 items-center mb-2">
                    <Chip 
                      size="sm" 
                      color={usuario.rol === "admin" ? "danger" : "primary"}
                      variant="flat"
                    >
                      {usuario.rol === "admin" ? "Administrador" : "Cliente"}
                    </Chip>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>📱 {usuario.telefono}</div>
                    <div>📍 {usuario.direccion}</div>
                  </div>
                </div>
              </div>
            </CardBody>
            <CardFooter className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => handleEditarUsuarioClick(usuario.id_usuario)}
              >
                <Icon icon="mdi:pencil" /> Editar
              </Button>
              <Button 
                variant="destructive"
                onClick={() => handleEliminarUsuarioClick(usuario.id_usuario)}
              >
                <Icon icon="mdi:delete" /> Eliminar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCategorias = () => (
    <div>
      <div className="mb-4">
        <Button onClick={handleAgregarCategoriaClick} variant="default" size="sm" className="flex items-center gap-1">
          <Icon icon="mdi:plus" /> Agregar Categoría
        </Button>
      </div>

      {showCategoriaForm && (
        <div className="mb-4">
          <input
            type="text"
            value={nombreCategoria}
            onChange={(e) => setNombreCategoria(e.target.value)}
            placeholder="Nombre de la categoría"
            className="border px-2 py-1 rounded w-full max-w-sm"
          />
          <div className="flex gap-2 mt-2">
            <Button onClick={handleGuardarCategoria} variant="default">
              <Icon icon="mdi:content-save" /> Guardar
            </Button>
            <Button onClick={() => { setShowCategoriaForm(false); setEditCategoriaId(null); }} variant="outline">
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {categorias.map((categoria) => {
          const iconData = categoriaIcons.find((c) => c.id_categoria === categoria.id_categoria);
          return (
            <Card
              key={categoria.id_categoria}
              isPressable
              className="flex flex-col items-center p-3 cursor-pointer border border-default-200 hover:shadow-md transition-shadow"
            >
              {iconData ? (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconData.bgColor} mb-2`}>
                  <Icon icon={iconData.icon} className={`text-xl ${iconData.color}`} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mb-2">?</div>
              )}
              <div className="text-center text-sm font-semibold truncate mb-2">{categoria.nombre_categoria}</div>

              <div className="flex gap-2">
                <Button size="xs" variant="outline" onClick={() => handleEditarCategoriaClick(categoria.id_categoria)}>
                  <Icon icon="mdi:pencil" />
                </Button>
                <Button size="xs" variant="destructive" onClick={() => handleEliminarCategoriaClick(categoria.id_categoria)}>
                  <Icon icon="mdi:delete" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderProductos = () => (
    <div>
      <div className="mb-4">
        <Button onClick={handleAgregarProductoClick} variant="default" size="sm" className="flex items-center gap-1">
          <Icon icon="mdi:plus" /> Agregar Producto
        </Button>
      </div>

      {showProductoForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">
            {editProductoId ? "Editar Producto" : "Agregar Nuevo Producto"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre del Producto</label>
              <input
                type="text"
                value={productoForm.nombre}
                onChange={(e) => handleProductoFormChange("nombre", e.target.value)}
                placeholder="Nombre del producto"
                className="border px-3 py-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select
                value={productoForm.id_categoria}
                onChange={(e) => handleProductoFormChange("id_categoria", e.target.value)}
                className="border px-3 py-2 rounded w-full"
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id_categoria} value={categoria.id_categoria}>
                    {categoria.nombre_categoria}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                value={productoForm.descripcion}
                onChange={(e) => handleProductoFormChange("descripcion", e.target.value)}
                placeholder="Descripción del producto"
                className="border px-3 py-2 rounded w-full h-20 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Precio</label>
              <input
                type="number"
                step="0.01"
                value={productoForm.precio}
                onChange={(e) => handleProductoFormChange("precio", e.target.value)}
                placeholder="0.00"
                className="border px-3 py-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input
                type="number"
                value={productoForm.stock}
                onChange={(e) => handleProductoFormChange("stock", e.target.value)}
                placeholder="0"
                className="border px-3 py-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Puntuación</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={productoForm.puntuacion}
                onChange={(e) => handleProductoFormChange("puntuacion", e.target.value)}
                placeholder="0.0"
                className="border px-3 py-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">URL de Imagen</label>
              <input
                type="text"
                value={productoForm.imagen_url}
                onChange={(e) => handleProductoFormChange("imagen_url", e.target.value)}
                placeholder="URL de la imagen"
                className="border px-3 py-2 rounded w-full"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={productoForm.en_oferta}
                  onChange={(e) => handleProductoFormChange("en_oferta", e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">En oferta</span>
              </label>

              {productoForm.en_oferta && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Descuento %:</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={productoForm.descuento}
                    onChange={(e) => handleProductoFormChange("descuento", e.target.value)}
                    placeholder="0"
                    className="border px-2 py-1 rounded w-20"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleGuardarProducto} variant="default">
              <Icon icon="mdi:content-save" /> Guardar
            </Button>
            <Button 
              onClick={() => { 
                setShowProductoForm(false); 
                setEditProductoId(null); 
              }} 
              variant="outline"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((producto) => (
          <Card key={producto.id_producto} className="border border-default-200 p-2 flex flex-col">
            <div className="relative h-32 bg-white flex items-center justify-center mb-2 overflow-hidden rounded">
              <img
                src={producto.imagen_url.startsWith("http") ? producto.imagen_url : `http://localhost:3001${producto.imagen_url}`}
                alt={producto.nombre}
                className="max-h-full max-w-full object-contain transition-transform hover:scale-105 duration-300"
              />
            </div>
            <div className="flex flex-col flex-grow">
              <div className="font-semibold text-base line-clamp-2 mb-1">{producto.nombre}</div>
              <div className="text-xs text-gray-600 line-clamp-3 mb-2">{producto.descripcion}</div>
              <div className="flex gap-2 items-center mt-auto">
                <Chip size="sm" color="green">${typeof producto.precio === "number" ? producto.precio.toFixed(2) : producto.precio}</Chip>
                {producto.en_oferta && <Chip size="sm" color="red">-{producto.descuento}%</Chip>}
              </div>
            </div>
            <CardFooter className="flex gap-2 mt-2 p-0 pt-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => handleEditarProductoClick(producto.id_producto)}
              >
                <Icon icon="mdi:pencil" /> Editar
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                className="flex-1"
                onClick={() => handleEliminarProductoClick(producto.id_producto)}
              >
                <Icon icon="mdi:delete" /> Eliminar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestión de Datos</h1>

      <div className="flex gap-4 mb-6">
        <Button onClick={() => setTab("usuarios")} variant={tab === "usuarios" ? "default" : "outline"}>
          Usuarios
        </Button>
        <Button onClick={() => setTab("categorias")} variant={tab === "categorias" ? "default" : "outline"}>
          Categorías
        </Button>
        <Button onClick={() => setTab("productos")} variant={tab === "productos" ? "default" : "outline"}>
          Productos
        </Button>
      </div>

      <div>
        {tab === "usuarios" && renderUsuarios()}
        {tab === "categorias" && renderCategorias()}
        {tab === "productos" && renderProductos()}
      </div>
    </div>
  );
};

export default CrudDashboard;