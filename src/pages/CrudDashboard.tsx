import React, { useState, useEffect } from "react";
import { Card, CardBody, CardFooter, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import Swal from 'sweetalert2';
import axios from "axios";
import { StyledTabs, TabType } from '../components/StyledTabs';
import { Users, Grid3X3, Box, Mail, ShoppingBag, Receipt, Wallet } from "lucide-react";

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


type Contacto = {
  id_contacto: number;
  nombre: string;
  correo: string;
  mensaje: string;
  fecha: string;
};

type Carrito = {
  id_carrito: number;
  id_usuario: number;
  fecha_creado: string;
  usuario_nombre?: string;
};

type CarritoDetalle = {
  id_detalle: number;
  id_carrito: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  producto_nombre?: string;
};

type Orden = {
  id_orden: number;
  id_usuario: number;
  fecha: string;
  total: number;
  estado: 'pendiente' | 'pagado' | 'cancelado';
  usuario_nombre?: string;
};

type OrdenDetalle = {
  id_detalle: number;
  id_orden: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  producto_nombre?: string;
};

type Pago = {
  id_pago: number;
  id_orden: number;
  metodo_pago: 'tarjeta';
  numero_tarjeta: string;
  fecha_pago: string;
  estado: 'completado' | 'fallido';
};

const tabsConfig: Record<TabType, {
  title: string;
  icon: any;
  color: string;
  description: string;
}> = {
  usuarios: { title: "Usuarios", icon: Users, color: "bg-blue-500", description: "Gestión de usuarios" },
  categorias: { title: "Categorías", icon: Grid3X3, color: "bg-purple-500", description: "Organizar productos" },
  productos: { title: "Productos", icon: Box, color: "bg-green-500", description: "Inventario y catálogo" },
  contactos: { title: "Contactos", icon: Mail, color: "bg-orange-500", description: "Mensajes y consultas" },
  carritos: { title: "Carritos", icon: ShoppingBag, color: "bg-pink-500", description: "Carritos activos" },
  ordenes: { title: "Órdenes", icon: Receipt, color: "bg-indigo-500", description: "Pedidos y ventas" },
  pagos: { title: "Pagos", icon: Wallet, color: "bg-emerald-500", description: "Transacciones" },
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
  const [tab, setTab] = useState<TabType>("usuarios");

  // Estados para formulario de categorías
  const [showCategoriaForm, setShowCategoriaForm] = useState(false);
  const [editCategoriaId, setEditCategoriaId] = useState<number | null>(null);
  const [nombreCategoria, setNombreCategoria] = useState("");
  // Estados restantes
const [contactos, setContactos] = useState<Contacto[]>([]);
const [carritos, setCarritos] = useState<Carrito[]>([]);
const [carritoDetalles, setCarritoDetalles] = useState<CarritoDetalle[]>([]);
const [ordenes, setOrdenes] = useState<Orden[]>([]);
const [ordenDetalles, setOrdenDetalles] = useState<OrdenDetalle[]>([]);
const [pagos, setPagos] = useState<Pago[]>([]);
const [busqueda, setBusqueda] = useState('');
const [busquedaUsuario, setBusquedaUsuario] = useState('');
const [busquedaOrdenUsuario, setBusquedaOrdenUsuario] = useState('');
const [busquedaCarritoUsuario, setBusquedaCarritoUsuario] = useState('');
const [busquedaPagoUsuario, setBusquedaPagoUsuario] = useState('');
const [busquedaCorreo, setBusquedaCorreo] = useState('');







  // Estados para formulario de productos
  const [showProductoForm, setShowProductoForm] = useState(false);
  const [editProductoId, setEditProductoId] = useState<number | null>(null);
  const [imagenArchivo, setImagenArchivo] = useState(null);
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

  // Actualizar la función fetchAllData para incluir las nuevas tablas
const fetchAllData = async () => {
  try {
    const [
      resAdmins, 
      resClientes, 
      resCategorias, 
      resProductos,
      resContactos,
      resCarritos,
      resOrdenes,
      resPagos
    ] = await Promise.all([
      axios.get("/api/usuarios-rol/admin"),
      axios.get("/api/usuarios-rol/cliente"),
      axios.get("/api/categorias"),
      axios.get("/api/productos"),
      axios.get("/api/contactos"),
      axios.get("/api/carritos"),
      axios.get("/api/ordenes"),
      axios.get("/api/pagos")
    ]);
    
    setUsuarios([...resAdmins.data, ...resClientes.data]);
    setCategorias(resCategorias.data);
    setProductos(resProductos.data);
    setContactos(resContactos.data);
    setCarritos(resCarritos.data);
    setOrdenes(resOrdenes.data);
    setPagos(resPagos.data);
    
    // Obtener detalles de carritos y órdenes
    if (resCarritos.data.length > 0) {
      const detalles = await axios.get(`/api/carritos/detalles`);
      setCarritoDetalles(detalles.data);
    }
    
    if (resOrdenes.data.length > 0) {
      const detalles = await axios.get(`/api/ordenes/detalles`);
      setOrdenDetalles(detalles.data);
    }
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
  const handleImagenChange = (file) => {
  setImagenArchivo(file);
  };

  const productosFiltrados = productos.filter((producto) =>
  producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
);

  const handleEditarProductoClick = (id_producto: number) => {
    setEditProductoId(id_producto);
    setShowProductoForm(true);
  };

  const handleEliminarProductoClick = async (id_producto: number) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará el producto permanentemente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`/api/productos/${id_producto}`);
      await Swal.fire('¡Eliminado!', 'El producto ha sido eliminado con éxito.', 'success');
      fetchAllData();
    } catch (error) {
      console.error("Error al eliminar producto", error);
      Swal.fire('Error', 'Hubo un problema al eliminar el producto.', 'error');
    }
  }
};

  const handleGuardarProducto = async () => {
  try {
    let imagenURL = productoForm.imagen_url;

    // Subir imagen si se seleccionó una nueva
    if (imagenArchivo) {
      const formData = new FormData();
      formData.append("imagen", imagenArchivo);

      const uploadRes = await axios.post("/api/upload-imagen", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      imagenURL = uploadRes.data.rutaImagen; // e.g., "/images/imagen123.jpg"
    }

    // Construir el objeto para enviar
    const productoData = {
      nombre: productoForm.nombre,
      descripcion: productoForm.descripcion,
      precio: parseFloat(productoForm.precio),
      stock: parseInt(productoForm.stock),
      puntuacion: parseFloat(productoForm.puntuacion),
      imagen_url: imagenURL,
      id_categoria: parseInt(productoForm.id_categoria),
      en_oferta: productoForm.en_oferta,
      descuento: parseFloat(productoForm.descuento),
    };

    if (editProductoId === null) {
      await axios.post("/api/productos", productoData);
    } else {
      await axios.put(`/api/productos/${editProductoId}`, productoData);
    }

    fetchAllData();
    setShowProductoForm(false);
    setEditProductoId(null);
    setImagenArchivo(null);
    setProductoForm({
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      puntuacion: "0",
      imagen_url: "",
      id_categoria: "",
      en_oferta: false,
      descuento: "0",
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
  
  const usuariosFiltrados = usuarios.filter((usuario) =>
  usuario.nombre_completo.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
  usuario.correo.toLowerCase().includes(busquedaUsuario.toLowerCase())
);

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

  //funciones para resto de tabalas
  // Función para cambiar el estado de una orden
const cambiarEstadoOrden = async (id_orden: number, nuevoEstado: 'pendiente' | 'pagado' | 'cancelado') => {
  try {
    await axios.put(`/api/ordenes/${id_orden}/estado`, { estado: nuevoEstado });
    fetchAllData();
    Swal.fire('¡Éxito!', 'El estado de la orden ha sido actualizado.', 'success');
  } catch (error) {
    console.error("Error al cambiar estado de orden", error);
    Swal.fire('Error', 'No se pudo actualizar el estado de la orden.', 'error');
  }

};


const ordenesFiltradas = ordenes.filter((orden) => {
  const usuario = usuarios.find(u => u.id_usuario === orden.id_usuario);
  return usuario?.nombre_completo.toLowerCase().includes(busquedaOrdenUsuario.toLowerCase());
});


// Función para eliminar un contacto
const handleEliminarContacto = async (id_contacto: number) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará el mensaje de contacto permanentemente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`/api/contactos/${id_contacto}`);
      fetchAllData();
      Swal.fire('¡Eliminado!', 'El mensaje de contacto ha sido eliminado.', 'success');
    } catch (error) {
      console.error("Error al eliminar contacto", error);
      Swal.fire('Error', 'No se pudo eliminar el mensaje de contacto.', 'error');
    }
  }
};

const contactosFiltrados = contactos.filter(contacto =>
  contacto.correo.toLowerCase().includes(busquedaCorreo.toLowerCase())
);


// Función para eliminar un carrito (y sus detalles)
const handleEliminarCarrito = async (id_carrito: number) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará el carrito y todos sus productos.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`/api/carritos/${id_carrito}`);
      fetchAllData();
      Swal.fire('¡Eliminado!', 'El carrito ha sido eliminado.', 'success');
    } catch (error) {
      console.error("Error al eliminar carrito", error);
      Swal.fire('Error', 'No se pudo eliminar el carrito.', 'error');
    }
  }
};

const carritosFiltrados = carritos.filter((carrito) => {
  const usuario = usuarios.find(u => u.id_usuario === carrito.id_usuario);
  return usuario?.nombre_completo.toLowerCase().includes(busquedaCarritoUsuario.toLowerCase());
});


// Función para eliminar una orden (y sus detalles)
const handleEliminarOrden = async (id_orden: number) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará la orden y todos sus detalles.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`/api/ordenes/${id_orden}`);
      fetchAllData();
      Swal.fire('¡Eliminado!', 'La orden ha sido eliminada.', 'success');
    } catch (error) {
      console.error("Error al eliminar orden", error);
      Swal.fire('Error', 'No se pudo eliminar la orden.', 'error');
    }
  }
};

// Función para eliminar un pago
const handleEliminarPago = async (id_pago: number) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará el registro de pago.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`/api/pagos/${id_pago}`);
      fetchAllData();
      Swal.fire('¡Eliminado!', 'El pago ha sido eliminado.', 'success');
    } catch (error) {
      console.error("Error al eliminar pago", error);
      Swal.fire('Error', 'No se pudo eliminar el pago.', 'error');
    }
  }
};

const pagosFiltrados = pagos.filter((pago) => {
  const orden = ordenes.find(o => o.id_orden === pago.id_orden);
  const usuario = orden ? usuarios.find(u => u.id_usuario === orden.id_usuario) : null;
  return usuario?.nombre_completo.toLowerCase().includes(busquedaPagoUsuario.toLowerCase());
});


// reder resto de tablas


const renderContactos = () => (
  <div className="p-6">
    <h2 className="text-3xl font-bold mb-6 text-slate-700 flex items-center gap-2">
      📬 Mensajes de Contacto
    </h2>
    <div className="mb-4">
  <input
    type="text"
    placeholder="Buscar por correo..."
    value={busquedaCorreo}
    onChange={e => setBusquedaCorreo(e.target.value)}
    className="border border-slate-300 px-3 py-2 rounded w-full md:w-1/2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
  />
</div>


    <div className="space-y-6">
      {contactosFiltrados.map((contacto) => (
        <Card
          key={contacto.id_contacto}
          className="border border-slate-300 bg-slate-50 rounded-xl shadow-sm hover:shadow-md transition"
        >
          <CardBody className="p-5">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-slate-800">{contacto.nombre}</h3>
                <span className="text-xs text-slate-500 italic">
                  {new Date(contacto.fecha).toLocaleString()}
                </span>
              </div>

              <p className="text-sm text-slate-600">{contacto.correo}</p>

              <div className="bg-white border border-slate-200 p-4 rounded-md text-slate-700 whitespace-pre-line text-sm shadow-inner">
                {contacto.mensaje}
              </div>
            </div>
          </CardBody>

          <CardFooter className="flex justify-end p-4">
            <Button
              variant="destructive"
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm shadow"
              onClick={() => handleEliminarContacto(contacto.id_contacto)}
            >
              <Icon icon="mdi:delete-outline" className="text-base" />
              Eliminar
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  </div>
);



  
  // Render para carritos
const renderCarritos = () => (
  <div className="p-6">
    <h2 className="text-3xl font-bold mb-6 text-slate-700 flex items-center gap-2">
      🛒 Carritos de Compras
    </h2>
    <div className="mb-4">
  <input
    type="text"
    placeholder="Buscar por nombre del usuario..."
    value={busquedaCarritoUsuario}
    onChange={(e) => setBusquedaCarritoUsuario(e.target.value)}
    className="border border-slate-300 px-3 py-2 rounded w-full md:w-1/2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
  />
</div>


    <div className="space-y-6">
      {carritosFiltrados.map((carrito) => {
        const detalles = carritoDetalles.filter(d => d.id_carrito === carrito.id_carrito);
        const usuario = usuarios.find(u => u.id_usuario === carrito.id_usuario);

        return (
          <Card
            key={carrito.id_carrito}
            className="border border-slate-300 bg-slate-50 rounded-xl shadow-sm hover:shadow-md transition"
          >
            <CardBody className="p-5">
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-slate-800">
                    Carrito #{carrito.id_carrito}
                  </h3>
                  <span className="text-sm text-slate-500 italic">
                    {new Date(carrito.fecha_creado).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Usuario: <span className="font-medium">{usuario?.nombre_completo || 'Desconocido'}</span>
                </p>
              </div>

              {detalles.length > 0 ? (
                <div className="mt-3 space-y-3">
                  <h4 className="text-base font-semibold text-slate-700">Productos en el carrito:</h4>
                  {detalles.map((detalle) => {
                    const producto = productos.find(p => p.id_producto === detalle.id_producto);
                    return (
                      <div
                        key={detalle.id_detalle}
                        className="bg-white border border-slate-200 p-3 rounded-md flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-slate-800">{producto?.nombre || 'Producto desconocido'}</div>
                          <div className="text-sm text-slate-600">
                            {detalle.cantidad} x ${Number(detalle.precio_unitario).toFixed(2)}
                          </div>
                        </div>
                        <div className="font-semibold text-slate-700">
                          ${(detalle.cantidad * detalle.precio_unitario).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-slate-500 italic mt-2">Carrito vacío</div>
              )}
            </CardBody>

            <CardFooter className="flex justify-end p-4">
              <Button
                variant="destructive"
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm shadow"
                onClick={() => handleEliminarCarrito(carrito.id_carrito)}
              >
                <Icon icon="mdi:delete-outline" className="text-base" />
                Eliminar Carrito
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  </div>
);


// Render para órdenes
const renderOrdenes = () => (
  <div className="p-6">
    <h2 className="text-3xl font-bold mb-6 text-slate-700 flex items-center gap-2">
      🧾 Órdenes de Compra
    </h2>

    <div className="mb-4">
  <input
    type="text"
    placeholder="Buscar por nombre del usuario..."
    value={busquedaOrdenUsuario}
    onChange={(e) => setBusquedaOrdenUsuario(e.target.value)}
    className="border border-slate-300 px-3 py-2 rounded w-full md:w-1/2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
  />
</div>


    <div className="space-y-6">
      {ordenesFiltradas.map((orden) => {
        const detalles = ordenDetalles.filter(d => d.id_orden === orden.id_orden);
        const usuario = usuarios.find(u => u.id_usuario === orden.id_usuario);
        const pago = pagos.find(p => p.id_orden === orden.id_orden);

        return (
          <Card key={orden.id_orden} className="border border-slate-300 bg-slate-50 rounded-xl shadow-sm hover:shadow-md transition">
            <CardBody className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-lg font-semibold text-slate-800">Orden #{orden.id_orden}</div>
                  <div className="text-sm text-slate-600">
                    Usuario: {usuario?.nombre_completo || 'Desconocido'}
                  </div>
                  <div className="text-sm text-slate-600">
                    Fecha: {new Date(orden.fecha).toLocaleString()}
                  </div>
                </div>
                <Chip
                  color={
                    orden.estado === 'pagado' ? 'success' :
                    orden.estado === 'cancelado' ? 'danger' : 'warning'
                  }
                  variant="flat"
                >
                  {orden.estado.toUpperCase()}
                </Chip>
              </div>

              {detalles.length > 0 && (
                <div className="border-t pt-3 mt-3">
                  <h4 className="font-medium text-slate-700 mb-2">Productos:</h4>
                  <div className="space-y-2">
                    {detalles.map((detalle) => {
                      const producto = productos.find(p => p.id_producto === detalle.id_producto);
                      return (
                        <div key={detalle.id_detalle} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <div className="font-medium text-slate-800">{producto?.nombre || 'Producto desconocido'}</div>
                            <div className="text-sm text-slate-600">
                              {detalle.cantidad} x ${(Number(detalle.precio_unitario) || 0).toFixed(2)}
                            </div>
                          </div>
                          <div className="font-semibold text-slate-700">
                            ${(detalle.cantidad * detalle.precio_unitario).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t pt-4 mt-4 flex justify-between items-center">
                <div className="font-bold text-slate-800">Total: ${(parseFloat(orden.total) || 0).toFixed(2)}</div>

                {pago && (
                  <div className="text-sm text-slate-600 text-right">
                    <div>
                      <span className="font-medium">Pago: </span>
                      <span className={pago.estado === 'completado' ? 'text-green-600' : 'text-red-600'}>
                        {pago.estado === 'completado' ? 'Completado' : 'Fallido'} ({pago.metodo_pago})
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Tarjeta: **** **** **** {pago.numero_tarjeta.slice(-4)}
                    </div>
                  </div>
                )}
              </div>
            </CardBody>

            <CardFooter className="flex justify-between p-4">
              <div className="flex gap-2">
                <Button
                  variant={orden.estado === 'pendiente' ? 'default' : 'outline'}
                  onClick={() => cambiarEstadoOrden(orden.id_orden, 'pendiente')}
                >
                  Pendiente
                </Button>
                <Button
                  variant={orden.estado === 'pagado' ? 'default' : 'outline'}
                  onClick={() => cambiarEstadoOrden(orden.id_orden, 'pagado')}
                >
                  Pagado
                </Button>
                <Button
                  variant={orden.estado === 'cancelado' ? 'default' : 'outline'}
                  onClick={() => cambiarEstadoOrden(orden.id_orden, 'cancelado')}
                >
                  Cancelado
                </Button>
              </div>

              <Button
                variant="destructive"
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm shadow"
                onClick={() => handleEliminarOrden(orden.id_orden)}
              >
                <Icon icon="mdi:delete-outline" className="text-base" />
                Eliminar
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  </div>
);

// Render para pagos
const renderPagos = () => (
  <div className="p-6">
    <h2 className="text-3xl font-bold mb-6 text-slate-700 flex items-center gap-2">
      💳 Registros de Pagos
    </h2>
    <div className="mb-4">
  <input
    type="text"
    placeholder="Buscar por nombre del usuario..."
    value={busquedaPagoUsuario}
    onChange={(e) => setBusquedaPagoUsuario(e.target.value)}
    className="border border-slate-300 px-3 py-2 rounded w-full md:w-1/2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
  />
</div>


    <div className="space-y-6">
      {pagosFiltrados.map((pago) => {
        const orden = ordenes.find(o => o.id_orden === pago.id_orden);
        const usuario = orden ? usuarios.find(u => u.id_usuario === orden.id_usuario) : null;

        return (
          <Card key={pago.id_pago} className="border border-slate-300 bg-slate-50 rounded-xl shadow-sm hover:shadow-md transition">
            <CardBody className="p-5">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                  <div className="text-lg font-semibold text-slate-800">Pago #{pago.id_pago}</div>
                  <div className="text-sm text-slate-600">
                    Orden #{pago.id_orden} - {usuario?.nombre_completo || 'Usuario desconocido'}
                  </div>
                  <div className="text-sm text-slate-600">
                    Fecha: {new Date(pago.fecha_pago).toLocaleString()}
                  </div>
                  <div className="flex flex-wrap gap-6 text-slate-700 text-sm">
                    <div>
                      <span className="font-medium">Método: </span>
                      <span>{pago.metodo_pago}</span>
                    </div>
                    <div>
                      <span className="font-medium">Tarjeta: </span>
                      <span>**** **** **** {pago.numero_tarjeta.slice(-4)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Estado: </span>
                      <span className={pago.estado === 'completado' ? 'text-green-600' : 'text-red-600'}>
                        {pago.estado === 'completado' ? 'Completado' : 'Fallido'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
            <CardFooter className="flex justify-end p-4">
              <Button
                variant="destructive"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm shadow"
                onClick={() => handleEliminarPago(pago.id_pago)}
              >
                <Icon icon="mdi:delete-outline" className="text-base" />
                Eliminar
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  </div>
);








  const renderUsuarios = () => (
  <div className="p-6">
    <div className="mb-4">
  <input
    type="text"
    placeholder="Buscar por nombre o correo..."
    value={busquedaUsuario}
    onChange={(e) => setBusquedaUsuario(e.target.value)}
    className="border border-slate-300 px-3 py-2 rounded w-full md:w-1/2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
  />
</div>

    <div className="mb-6">
      <Button
        onClick={handleAgregarUsuarioClick}
        variant="default"
        size="sm"
        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded shadow-sm transition"
      >
        <Icon icon="mdi:plus" />
        Agregar Usuario
      </Button>
    </div>

    {showUsuarioForm && (
      <div className="mb-8 p-6 border border-slate-300 rounded-2xl bg-slate-50 shadow-sm">
        <h3 className="text-2xl font-semibold mb-6 text-slate-800">
          {editUsuarioId ? "Editar Usuario" : "Agregar Nuevo Usuario"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Nombre Completo</label>
            <input
              type="text"
              value={usuarioForm.nombre_completo}
              onChange={(e) => handleUsuarioFormChange("nombre_completo", e.target.value)}
              placeholder="Nombre completo"
              className="border border-slate-300 px-3 py-2 rounded w-full text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Correo Electrónico</label>
            <input
              type="email"
              value={usuarioForm.correo}
              onChange={(e) => handleUsuarioFormChange("correo", e.target.value)}
              placeholder="correo@ejemplo.com"
              className="border border-slate-300 px-3 py-2 rounded w-full text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          {editUsuarioId === null && (
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Contraseña</label>
              <input
                type="password"
                value={usuarioForm.contrasena}
                onChange={(e) => handleUsuarioFormChange("contrasena", e.target.value)}
                placeholder="Contraseña"
                className="border border-slate-300 px-3 py-2 rounded w-full text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Rol</label>
            <select
              value={usuarioForm.rol}
              onChange={(e) => handleUsuarioFormChange("rol", e.target.value)}
              className="border border-slate-300 px-3 py-2 rounded w-full text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="cliente">Cliente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Teléfono</label>
            <input
              type="tel"
              value={usuarioForm.telefono}
              onChange={(e) => handleUsuarioFormChange("telefono", e.target.value)}
              placeholder="Teléfono"
              className="border border-slate-300 px-3 py-2 rounded w-full text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Dirección</label>
            <input
              type="text"
              value={usuarioForm.direccion}
              onChange={(e) => handleUsuarioFormChange("direccion", e.target.value)}
              placeholder="Dirección"
              className="border border-slate-300 px-3 py-2 rounded w-full text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <Button
            onClick={handleGuardarUsuario}
            variant="default"
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-5 py-2 rounded shadow"
          >
            <Icon icon="mdi:content-save" />
            Guardar
          </Button>
          <Button
            onClick={() => {
              setShowUsuarioForm(false);
              setEditUsuarioId(null);
            }}
            variant="outline"
            className="px-5 py-2 rounded border border-slate-400 text-slate-700 hover:bg-slate-100"
          >
            Cancelar
          </Button>
        </div>
      </div>
    )}

    <div className="space-y-6">
      {usuariosFiltrados.map((usuario) => (
        <Card
          key={usuario.id_usuario}
          className="border border-slate-300 bg-white rounded-xl shadow-sm hover:shadow-md transition"
        >
          <CardBody className="p-5">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="font-bold text-xl text-slate-900">{usuario.nombre_completo}</div>
                <div className="text-slate-600 mb-2">{usuario.correo}</div>
                <div className="flex gap-2 items-center mb-3">
                  <Chip
                    size="sm"
                    color={usuario.rol === "admin" ? "danger" : "primary"}
                    variant="flat"
                  >
                    {usuario.rol === "admin" ? "Administrador" : "Cliente"}
                  </Chip>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <div>📱 {usuario.telefono}</div>
                  <div>📍 {usuario.direccion}</div>
                </div>
              </div>
            </div>
          </CardBody>
          <CardFooter className="flex gap-3 p-4">
            <Button
              variant="outline"
              onClick={() => handleEditarUsuarioClick(usuario.id_usuario)}
              className="flex items-center gap-1"
            >
              <Icon icon="mdi:pencil" />
              Editar
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleEliminarUsuarioClick(usuario.id_usuario)}
              className="flex items-center gap-1"
            >
              <Icon icon="mdi:delete" />
              Eliminar
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  </div>
);

  const renderCategorias = () => (
  <div className="p-6">
    <div className="mb-6">
      <Button
        onClick={handleAgregarCategoriaClick}
        variant="default"
        size="sm"
        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded shadow-sm transition"
      >
        <Icon icon="mdi:plus" />
        Agregar Categoría
      </Button>
    </div>

    {showCategoriaForm && (
      <div className="mb-8 max-w-md">
        <input
          type="text"
          value={nombreCategoria}
          onChange={(e) => setNombreCategoria(e.target.value)}
          placeholder="Nombre de la categoría"
          className="border border-slate-300 px-4 py-2 rounded w-full text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <div className="flex gap-4 mt-4">
          <Button
            onClick={handleGuardarCategoria}
            variant="default"
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-5 py-2 rounded shadow"
          >
            <Icon icon="mdi:content-save" />
            Guardar
          </Button>
          <Button
            onClick={() => {
              setShowCategoriaForm(false);
              setEditCategoriaId(null);
            }}
            variant="outline"
            className="px-5 py-2 rounded border border-slate-400 text-slate-700 hover:bg-slate-100"
          >
            Cancelar
          </Button>
        </div>
      </div>
    )}

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
  {categorias.map((categoria) => {
    const iconData = categoriaIcons.find((c) => c.id_categoria === categoria.id_categoria);
    return (
      <Card
        key={categoria.id_categoria}
        isPressable
        className="flex flex-col items-center p-5 cursor-pointer border border-slate-300 rounded-xl bg-white hover:shadow-lg transition-shadow duration-300"
      >
        {iconData ? (
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${iconData.bgColor} mb-4`}>
            <Icon icon={iconData.icon} className={`text-2xl ${iconData.color}`} />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mb-4 text-xl font-bold">
            ?
          </div>
        )}
        <div className="text-center text-base font-semibold truncate mb-4 text-slate-900">
          {categoria.nombre_categoria}
        </div>

        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => handleEditarCategoriaClick(categoria.id_categoria)}
            className="w-9 h-9 p-2 flex items-center justify-center"
          >
            <Icon icon="mdi:pencil" className="text-lg" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={() => handleEliminarCategoriaClick(categoria.id_categoria)}
            className="w-9 h-9 p-2 flex items-center justify-center"
          >
            <Icon icon="mdi:delete" className="text-lg" />
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
  <input
    type="text"
    placeholder="Buscar por nombre..."
    value={busqueda}
    onChange={(e) => setBusqueda(e.target.value)}
    className="border px-3 py-2 rounded w-full md:w-1/2"
  />
</div>
      <div className="mb-4">
        <Button
          onClick={handleAgregarProductoClick}
          variant="default"
          size="sm"
          className="flex items-center gap-1"
        >
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
              <label className="block text-sm font-medium mb-1">
                Nombre del Producto
              </label>
              <input
                type="text"
                value={productoForm.nombre}
                onChange={(e) =>
                  handleProductoFormChange("nombre", e.target.value)
                }
                placeholder="Nombre del producto"
                className="border px-3 py-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Categoría
              </label>
              <select
                value={productoForm.id_categoria}
                onChange={(e) =>
                  handleProductoFormChange("id_categoria", e.target.value)
                }
                className="border px-3 py-2 rounded w-full"
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((categoria) => (
                  <option
                    key={categoria.id_categoria}
                    value={categoria.id_categoria}
                  >
                    {categoria.nombre_categoria}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Descripción
              </label>
              <textarea
                value={productoForm.descripcion}
                onChange={(e) =>
                  handleProductoFormChange("descripcion", e.target.value)
                }
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
                onChange={(e) =>
                  handleProductoFormChange("precio", e.target.value)
                }
                placeholder="0.00"
                className="border px-3 py-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input
                type="number"
                value={productoForm.stock}
                onChange={(e) =>
                  handleProductoFormChange("stock", e.target.value)
                }
                placeholder="0"
                className="border px-3 py-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Puntuación
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={productoForm.puntuacion}
                onChange={(e) =>
                  handleProductoFormChange("puntuacion", e.target.value)
                }
                placeholder="0.0"
                className="border px-3 py-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Imagen</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImagenChange(e.target.files[0])}
                className="border px-3 py-2 rounded w-full"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={productoForm.en_oferta}
                  onChange={(e) =>
                    handleProductoFormChange("en_oferta", e.target.checked)
                  }
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
                    onChange={(e) =>
                      handleProductoFormChange("descuento", e.target.value)
                    }
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
        {productosFiltrados.map((producto) => (
          <Card
            key={producto.id_producto}
            className="border border-default-200 p-2 flex flex-col"
          >
            <div className="relative h-32 bg-white flex items-center justify-center mb-2 overflow-hidden rounded">
              <img
                src={
                  producto.imagen_url.startsWith("http")
                    ? producto.imagen_url
                    : `http://localhost:3001${producto.imagen_url}`
                }
                alt={producto.nombre}
                className="max-h-full max-w-full object-contain transition-transform hover:scale-105 duration-300"
              />
            </div>
            <div className="flex flex-col flex-grow">
              <div className="font-semibold text-base line-clamp-2 mb-1">
                {producto.nombre}
              </div>
              <div className="text-xs text-gray-600 line-clamp-3 mb-2">
                {producto.descripcion}
              </div>
              <div className="flex gap-2 items-center mt-auto">
                <Chip size="sm" color="green">
                  $
                  {typeof producto.precio === "number"
                    ? producto.precio.toFixed(2)
                      : producto.precio}
                  </Chip>
                  {producto.en_oferta && (
                    <Chip size="sm" color="red">
                      -{producto.descuento}%
                    </Chip>
                  )}
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
                  onClick={() =>  handleEliminarProductoClick (producto.id_producto)}
                  variant="destructive"
                  size="sm"
                >
                  <Icon icon="mdi:delete" /> Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );

  // Actualizar el JSX final para incluir los nuevos botones de pestañas y renders
return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestión de Datos</h1>

      {/* Botones de tabs estilo 1 */}
      <div className="flex flex-wrap gap-2 p-2 bg-gray-100 rounded-xl mb-6">
        {Object.entries(tabsConfig).map(([key, config]) => {
          const Icon = config.icon;
          const isActive = tab === key;

          return (
            <button
              key={key}
              onClick={() => setTab(key as TabType)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300
                ${isActive 
                  ? 'bg-white text-gray-800 shadow-lg transform scale-105' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }
              `}
            >
              <Icon size={20} />
              <span>{config.title}</span>
            </button>
          );
        })}
      </div>

      <div>
        {tab === "usuarios" && renderUsuarios()}
        {tab === "categorias" && renderCategorias()}
        {tab === "productos" && renderProductos()}
        {tab === "contactos" && renderContactos()}
        {tab === "carritos" && renderCarritos()}
        {tab === "ordenes" && renderOrdenes()}
        {tab === "pagos" && renderPagos()}
      </div>
    </div>
  );
};

export default CrudDashboard;