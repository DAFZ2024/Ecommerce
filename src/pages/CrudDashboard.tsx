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

  const [showForm, setShowForm] = useState(false);
  const [editCategoriaId, setEditCategoriaId] = useState<number | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

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

  const renderUsuarios = () =>
    usuarios.map((usuario) => (
      <Card key={usuario.id_usuario} className="mb-4">
        <CardBody>
          <div className="font-bold">{usuario.nombre_completo}</div>
          <div>
            {usuario.correo} ({usuario.rol})
          </div>
          <div>{usuario.telefono}</div>
        </CardBody>
        <CardFooter className="flex gap-2">
          <Button variant="outline">
            <Icon icon="mdi:pencil" /> Editar
          </Button>
          <Button variant="destructive">
            <Icon icon="mdi:delete" /> Eliminar
          </Button>
        </CardFooter>
      </Card>
    ));

  const handleAgregarClick = () => {
    setEditCategoriaId(null);
    setShowForm(true);
  };

  const handleEditarClick = (id_categoria: number) => {
    setEditCategoriaId(id_categoria);
    setShowForm(true);
  };

  const handleEliminarClick = (id_categoria: number) => {
    console.log("Eliminar categoría con id", id_categoria);
  };

  const renderCategorias = () => (
    <div>
      <div className="mb-4">
        <Button onClick={handleAgregarClick} variant="default" size="sm" className="flex items-center gap-1">
          <Icon icon="mdi:plus" /> Agregar Categoría
        </Button>
      </div>

      {/* Aquí puedes agregar un formulario condicional con showForm */}

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
                <Button size="xs" variant="outline" onClick={() => handleEditarClick(categoria.id_categoria)}>
                  <Icon icon="mdi:pencil" />
                </Button>
                <Button size="xs" variant="destructive" onClick={() => handleEliminarClick(categoria.id_categoria)}>
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
            <Button size="sm" variant="outline" className="flex-1">
              <Icon icon="mdi:pencil" /> Editar
            </Button>
            <Button size="sm" variant="destructive" className="flex-1">
              <Icon icon="mdi:delete" /> Eliminar
            </Button>
          </CardFooter>
        </Card>
      ))}
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
