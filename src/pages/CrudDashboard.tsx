import React, { useState, useEffect } from "react";
import { Card, CardBody, CardFooter, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import Swal from 'sweetalert2';
import axios from "axios";
import { StyledTabs, TabType } from '../components/StyledTabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Users, Grid3X3, Box, Mail, ShoppingBag, Receipt, Wallet, TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, Star} from "lucide-react";
import { motion,  AnimatePresence } from "framer-motion";


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
  id_usuario: number;
  metodo_pago: 'tarjeta';
  numero_tarjeta: string;
  fecha_pago: string;
  processing_date: string;
  estado: 'completado' | 'pendiente' | 'cancelado' | 'fallido'| 'error';
  transaction_id: string;
  monto: number;
  moneda: string;
  firma: string;
  fecha_actualizacion: string;

};

const tabsConfig: Record<TabType, {
  title: string;
  icon: any;
  color: string;
  description: string;
}> = {
  estadisticas: { title: "Estadisticas", icon: Wallet, color: "bg-emerald-500", description: "Estadisticas Empresa" },
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
  const [tab, setTab] = useState<TabType>("estadisticas");

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
const [estadisticas, setEstadisticas] = useState({
  ventasPorMes: [],
  productosMasVendidos: [],
  ventasPorCategoria: [],
  resumenGeneral: {
    totalVentas: 0,
    totalOrdenes: 0,
    promedioOrden: 0,
    clientesActivos: 0,
    productosEnStock: 0,
    ordenesDelMes: 0
  }
});







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

  // Agregar esta línea al useEffect que llama fetchAllData
useEffect(() => {
  if (ordenes.length > 0 && productos.length > 0 && categorias.length > 0) {
    calcularEstadisticas();
  }
}, [ordenes, productos, categorias, ordenDetalles]);


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


  //funciones para estadisticas 

  // Agregar esta función para calcular estadísticas
const calcularEstadisticas = () => {
  // Ventas por mes (últimos 6 meses)
  const ventasPorMes = [];
  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const fechaActual = new Date();

  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth() - i,
      1
    );
    const mesActual = fecha.getMonth();
    const añoActual = fecha.getFullYear();

    const ventasDelMes = ordenes.filter((orden) => {
      const fechaOrden = new Date(orden.fecha);
      return (
        fechaOrden.getMonth() === mesActual &&
        fechaOrden.getFullYear() === añoActual &&
        orden.estado === "pagado"
      );
    });

    const totalVentas = ventasDelMes.reduce(
      (sum, orden) => sum + Number(orden.total),
      0
    );

    ventasPorMes.push({
      mes: meses[mesActual],
      ventas: totalVentas,
      ordenes: ventasDelMes.length,
    });
  }

  // Productos más vendidos
  const ventasProductos = {};
  ordenDetalles.forEach((detalle) => {
    const orden = ordenes.find(
      (o) => o.id_orden === detalle.id_orden && o.estado === "pagado"
    );
    if (!orden) return;

    const producto = productos.find(
      (p) => p.id_producto === detalle.id_producto
    );
    if (!producto) {
      console.warn(`Producto con ID ${detalle.id_producto} no encontrado.`);
      return;
    }

    const cantidad = Number(detalle.cantidad);
    const precio = Number(detalle.precio_unitario);

    if (!ventasProductos[detalle.id_producto]) {
      ventasProductos[detalle.id_producto] = {
        nombre: producto.nombre,
        cantidad: 0,
        ingresos: 0,
      };
    }

    ventasProductos[detalle.id_producto].cantidad += cantidad;
    ventasProductos[detalle.id_producto].ingresos += cantidad * precio;
  });

  const productosMasVendidos = Object.values(ventasProductos)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  // Ventas por categoría
const ventasPorCategoria = {};
categorias.forEach(categoria => {
  ventasPorCategoria[categoria.id_categoria] = {
    nombre: categoria.nombre_categoria,
    ventas: 0,
    cantidad: 0
  };
});

ordenDetalles.forEach(detalle => {
  const orden = ordenes.find(o => o.id_orden === detalle.id_orden && o.estado === 'pagado');
  if (!orden) return;

  const producto = productos.find(p => p.id_producto === detalle.id_producto);
  if (!producto || !ventasPorCategoria[producto.id_categoria]) {
    console.warn(`Error con producto ${detalle.id_producto} o categoría no encontrada.`);
    return;
  }

  const cantidad = Number(detalle.cantidad);
  const precio = Number(detalle.precio_unitario);

  ventasPorCategoria[producto.id_categoria].ventas += cantidad * precio;
  ventasPorCategoria[producto.id_categoria].cantidad += cantidad;
});

const ventasCategoria = Object.values(ventasPorCategoria).filter(cat => cat.ventas > 0);


  // Resumen general
  const ordenesPagadas = ordenes.filter((orden) => orden.estado === "pagado");
  const totalVentas = ordenesPagadas.reduce(
    (sum, orden) => sum + Number(orden.total),
    0
  );
  const totalOrdenes = ordenesPagadas.length;
  const promedioOrden = totalOrdenes > 0 ? totalVentas / totalOrdenes : 0;
  const clientesActivos = new Set(
    ordenesPagadas.map((orden) => orden.id_usuario)
  ).size;
  const productosEnStock = productos.filter(
    (producto) => producto.stock > 0
  ).length;

  const inicioMes = new Date(
    fechaActual.getFullYear(),
    fechaActual.getMonth(),
    1
  );
  const ordenesDelMes = ordenes.filter(
    (orden) => new Date(orden.fecha) >= inicioMes && orden.estado === "pagado"
  ).length;

  setEstadisticas({
    ventasPorMes,
    productosMasVendidos,
    ventasPorCategoria: ventasCategoria,
    resumenGeneral: {
      totalVentas,
      totalOrdenes,
      promedioOrden,
      clientesActivos,
      productosEnStock,
      ordenesDelMes,
    },
  });
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];



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




// Función render para estadísticas
const renderEstadisticas = () => (
  <div className="p-6 space-y-8">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold mb-6 text-slate-700 flex items-center gap-2">
        📊 Estadísticas de Rendimiento
      </h2>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Ventas</p>
              <p className="text-2xl font-bold">
                {estadisticas.resumenGeneral.totalVentas.toLocaleString(
                  "es-CO",
                  {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  }
                )}
              </p>
            </div>
            <DollarSign className="text-green-200" size={32} />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Órdenes</p>
              <p className="text-2xl font-bold">
                {estadisticas.resumenGeneral.totalOrdenes}
              </p>
            </div>
            <ShoppingCart className="text-blue-200" size={32} />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Promedio Orden</p>
              <p className="text-2xl font-bold">
                ${estadisticas.resumenGeneral.promedioOrden.toFixed(0)}
              </p>
            </div>
            <TrendingUp className="text-purple-200" size={32} />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-xl text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Clientes Activos</p>
              <p className="text-2xl font-bold">
                {estadisticas.resumenGeneral.clientesActivos}
              </p>
            </div>
            <Users className="text-orange-200" size={32} />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 rounded-xl text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Productos en Stock</p>
              <p className="text-2xl font-bold">
                {estadisticas.resumenGeneral.productosEnStock}
              </p>
            </div>
            <Package className="text-teal-200" size={32} />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-pink-500 to-pink-600 p-4 rounded-xl text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">Órdenes del Mes</p>
              <p className="text-2xl font-bold">
                {estadisticas.resumenGeneral.ordenesDelMes}
              </p>
            </div>
            <TrendingUp className="text-pink-200" size={32} />
          </div>
        </motion.div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ventas por mes */}
        <Card className="p-6 bg-white shadow-lg rounded-xl">
          <h3 className="text-xl font-semibold mb-4 text-slate-700 flex items-center gap-2">
            📈 Ventas por Mes
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={estadisticas.ventasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`$${value.toLocaleString()}`, "Ventas"]}
              />
              <Bar dataKey="ventas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Productos más vendidos */}
        <Card className="p-6 bg-white shadow-lg rounded-xl">
          <h3 className="text-xl font-semibold mb-4 text-slate-700 flex items-center gap-2">
            🏆 Productos Más Vendidos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={estadisticas.productosMasVendidos}
              layout="horizontal"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="nombre" type="category" width={100} />
              <Tooltip formatter={(value) => [value, "Cantidad vendida"]} />
              <Bar dataKey="cantidad" fill="#10B981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Ventas por categoría (Pie Chart) */}
        <Card className="p-6 bg-white shadow-lg rounded-xl">
          <h3 className="text-xl font-semibold mb-4 text-slate-700 flex items-center gap-2">
            🎯 Ventas por Categoría
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={estadisticas.ventasPorCategoria}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ nombre, percent }) =>
                  `${nombre} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="ventas"
              >
                {estadisticas.ventasPorCategoria.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`$${value.toLocaleString()}`, "Ventas"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Tendencia de órdenes */}
        <Card className="p-6 bg-white shadow-lg rounded-xl">
          <h3 className="text-xl font-semibold mb-4 text-slate-700 flex items-center gap-2">
            📊 Tendencia de Órdenes
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={estadisticas.ventasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="ordenes"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tabla de productos top */}
      <Card className="p-6 bg-white shadow-lg rounded-xl">
        <h3 className="text-xl font-semibold mb-4 text-slate-700 flex items-center gap-2">
          💰 Top Productos por Ingresos
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-2 font-semibold text-slate-600">
                  Producto
                </th>
                <th className="text-left py-3 px-2 font-semibold text-slate-600">
                  Cantidad Vendida
                </th>
                <th className="text-left py-3 px-2 font-semibold text-slate-600">
                  Ingresos
                </th>
                <th className="text-left py-3 px-2 font-semibold text-slate-600">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {estadisticas.productosMasVendidos.map((producto, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-3 px-2 font-medium text-slate-700">
                    {producto.nombre}
                  </td>
                  <td className="py-3 px-2 text-slate-600">
                    {producto.cantidad} unidades
                  </td>
                  <td className="py-3 px-2 text-green-600 font-semibold">
                    ${producto.ingresos.toLocaleString()}
                  </td>
                  <td className="py-3 px-2">
                    <Chip
                      size="sm"
                      color={index < 3 ? "success" : "primary"}
                      variant="flat"
                    >
                      {index < 3 ? "Top Seller" : "Popular"}
                    </Chip>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  </div>
);







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
                    Orden #{pago.id_orden} - Usuario #{pago.id_usuario} - {usuario?.nombre_completo || 'Usuario desconocido'}
                  </div>
                  <div className="text-sm text-slate-600">
                    Fecha: {new Date(pago.fecha_pago).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">
                    Fecha Actualización: {new Date(pago.fecha_actualizacion).toLocaleString()}
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
                      <span className={
                        pago.estado === 'completado' ? 'text-green-600' : 
                        pago.estado === 'pendiente' ? 'text-yellow-600' :
                        pago.estado === 'cancelado' ? 'text-orange-600' :
                        'text-red-600'
                      }>
                        {pago.estado === 'completado' ? 'Completado' : 
                         pago.estado === 'pendiente' ? 'Pendiente' :
                         pago.estado === 'cancelado' ? 'Cancelado' :
                         pago.estado === 'fallido' ? 'Fallido' : 'Error'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Monto: </span>
                      <span>{pago.monto} {pago.moneda}</span>
                    </div>
                    <div>
                      <span className="font-medium">ID Transacción: </span>
                      <span className="font-mono">{pago.transaction_id}</span>
                    </div>
                    <div>
                      <span className="font-medium">Fecha Procesamiento: </span>
                      <span>{new Date(pago.processing_date).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium">Firma: </span>
                      <span className="font-mono truncate max-w-xs inline-block">{pago.firma}</span>
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
  <div className="p-6 animate-fade-in space-y-10">
    {/* Buscador */}
    <div className="flex justify-between items-center flex-wrap gap-4">
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
          {editUsuarioId ? "Editar Usuario" : "Agregar Nuevo Usuario"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campos del formulario */}
          {[
            ["Nombre Completo", "nombre_completo", "text"],
            ["Correo Electrónico", "correo", "email"],
            ...(editUsuarioId === null ? [["Contraseña", "contrasena", "password"]] : []),
            ["Teléfono", "telefono", "tel"],
            ["Dirección", "direccion", "text"],
          ].map(([label, key, type]) => (
            <div className="space-y-1" key={key}>
              <label className="text-sm font-medium text-slate-700">{label}</label>
              <input
                type={type}
                value={usuarioForm[key]}
                onChange={(e) => handleUsuarioFormChange(key, e.target.value)}
                placeholder={label}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
              />
            </div>
          ))}

          {/* Rol */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Rol</label>
            <select
              value={usuarioForm.rol}
              onChange={(e) => handleUsuarioFormChange("rol", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
            >
              <option value="cliente">Cliente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 mt-8">
          <Button
            onClick={handleGuardarUsuario}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <Icon icon="mdi:content-save" className="w-5 h-5 mr-2" />
            Guardar
          </Button>
          <Button
            onClick={() => {
              setShowUsuarioForm(false);
              setEditUsuarioId(null);
            }}
            className="border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium px-6 py-2.5 rounded-xl transition-all"
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
          className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-lg transition-transform"
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${usuario.rol === "admin" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
              <Icon icon="mdi:account" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">{usuario.nombre_completo}</h3>
              <p className="text-slate-600 text-sm">{usuario.correo}</p>
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

          <div className="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button
              variant="outline"
              onClick={() => handleEditarUsuarioClick(usuario.id_usuario)}
              className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all"
            >
              <Icon icon="mdi:pencil" className="w-4 h-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleEliminarUsuarioClick(usuario.id_usuario)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
            >
              <Icon icon="mdi:delete" className="w-4 h-4 mr-1" />
              Eliminar
            </Button>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Animación global */}
    <style jsx global>{`
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


  const renderCategorias = () => (
  <div className="p-6 max-w-7xl mx-auto">
    <div className="mb-8 flex justify-between items-center">
      <h2 className="text-2xl font-bold text-slate-800">Gestión de Categorías</h2>
      <Button
        onClick={handleAgregarCategoriaClick}
        variant="default"
        size="sm"
        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
      >
        <Icon icon="mdi:plus" className="text-lg" />
        Agregar Categoría
      </Button>
    </div>

    <AnimatePresence>
      {showCategoriaForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", damping: 25 }}
          className="mb-8 max-w-md bg-white p-6 rounded-xl shadow-lg border border-slate-100"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {editCategoriaId ? "Editar Categoría" : "Nueva Categoría"}
          </h3>
          <input
            type="text"
            value={nombreCategoria}
            onChange={(e) => setNombreCategoria(e.target.value)}
            placeholder="Nombre de la categoría"
            className="border border-slate-200 px-4 py-2.5 rounded-lg w-full text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
          />
          <div className="flex gap-3 mt-6 justify-end">
            <Button
              onClick={() => {
                setShowCategoriaForm(false);
                setEditCategoriaId(null);
              }}
              variant="outline"
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGuardarCategoria}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow hover:shadow-md transition-all"
            >
              <Icon icon="mdi:content-save" className="text-lg" />
              Guardar
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
      <AnimatePresence>
        {categorias.map((categoria) => {
          const iconData = categoriaIcons.find((c) => c.id_categoria === categoria.id_categoria);

          return (
            <motion.div
              key={categoria.id_categoria}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, type: "spring" }}
              whileHover={{ y: -5 }}
            >
              <Card className="flex flex-col items-center p-6 cursor-default border border-slate-100 rounded-xl bg-white hover:shadow-lg transition-all duration-300 group">
                {iconData ? (
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center ${iconData.bgColor} mb-5 shadow-inner group-hover:shadow-md transition`}
                  >
                    <Icon 
                      icon={iconData.icon} 
                      className={`text-3xl ${iconData.color} transition-transform group-hover:scale-110`} 
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-5 text-2xl font-bold group-hover:bg-slate-200 transition">
                    ?
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-800 mb-1 line-clamp-2">
                    {categoria.nombre_categoria}
                  </h3>
                  <span className="text-xs text-slate-500">ID: {categoria.id_categoria}</span>
                </div>

                <div className="flex gap-2 mt-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleEditarCategoriaClick(categoria.id_categoria)}
                    className="w-10 h-10 p-2 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all rounded-xl"
                    title="Editar categoría"
                  >
                    <Icon icon="mdi:pencil" className="text-lg" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleEliminarCategoriaClick(categoria.id_categoria)}
                    className="w-10 h-10 p-2 flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all rounded-xl"
                    title="Eliminar categoría"
                  >
                    <Icon icon="mdi:delete" className="text-lg" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  </div>
);

  const renderProductos = () => (
  <div className="space-y-6">
    {/* Barra de búsqueda mejorada */}
    <div className="mb-6 relative max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon 
          icon="mdi:magnify" 
          className="text-gray-400 text-xl" 
        />
      </div>
      <input
        type="text"
        placeholder="Buscar productos..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
      />
    </div>

    {/* Botón con animación */}
    <div className="mb-6">
      <Button
        onClick={handleAgregarProductoClick}
        variant="default"
        size="sm"
        className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
      >
        <Icon icon="mdi:plus" className="text-lg" /> 
        Agregar Producto
      </Button>
    </div>

    {/* Formulario con animación de entrada/salida */}
    <AnimatePresence>
      {showProductoForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 p-5 border rounded-2xl bg-white shadow-lg overflow-hidden"
        >
          <h3 className="text-xl font-bold mb-5 text-gray-800">
            {editProductoId ? "✏️ Editar Producto" : "✨ Agregar Nuevo Producto"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Campos del formulario */}
            {[
              { id: 'nombre', label: 'Nombre del Producto', type: 'text', placeholder: 'Nombre del producto' },
              { id: 'id_categoria', label: 'Categoría', type: 'select', options: categorias },
              { id: 'precio', label: 'Precio', type: 'number', placeholder: '0.00' },
              { id: 'stock', label: 'Stock', type: 'number', placeholder: '0' },
              { id: 'puntuacion', label: 'Puntuación', type: 'number', placeholder: '0.0' },
            ].map((field) => (
              <div key={field.id} className={field.id === 'descripcion' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  {field.label}
                </label>
                
                {field.type === 'select' ? (
                  <select
                    value={productoForm[field.id]}
                    onChange={(e) => handleProductoFormChange(field.id, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Seleccionar categoría</option>
                    {field.options.map((categoria) => (
                      <option key={categoria.id_categoria} value={categoria.id_categoria}>
                        {categoria.nombre_categoria}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={productoForm[field.id]}
                    onChange={(e) => handleProductoFormChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    min={field.id === 'puntuacion' ? 0 : undefined}
                    max={field.id === 'puntuacion' ? 5 : undefined}
                    step={field.id === 'precio' || field.id === 'puntuacion' ? "0.01" : undefined}
                  />
                )}
              </div>
            ))}

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Descripción
              </label>
              <textarea
                value={productoForm.descripcion}
                onChange={(e) => handleProductoFormChange("descripcion", e.target.value)}
                placeholder="Descripción del producto"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors min-h-[100px]"
              />
            </div>

            {/* Imagen */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Imagen
              </label>
              <div className="flex items-center gap-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Icon icon="mdi:cloud-upload" className="text-3xl text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      {productoForm.imagen ? 'Cambiar imagen' : 'Subir imagen'}
                    </p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleImagenChange(e.target.files[0])}
                    className="hidden" 
                  />
                </label>
                {productoForm.imagen && (
                  <div className="relative">
                    <img 
                      src={URL.createObjectURL(productoForm.imagen)} 
                      alt="Preview" 
                      className="w-24 h-24 object-contain rounded-lg border"
                    />
                    <button 
                      type="button"
                      onClick={() => handleProductoFormChange("imagen", null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <Icon icon="mdi:close" className="text-sm" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Oferta */}
            <div className="flex items-center gap-4 md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={productoForm.en_oferta}
                    onChange={(e) => handleProductoFormChange("en_oferta", e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${productoForm.en_oferta ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${productoForm.en_oferta ? 'transform translate-x-5' : ''}`}></div>
                  </div>
                </div>
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
                    className="px-3 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-20 transition-colors"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button 
              onClick={handleGuardarProducto} 
              className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow hover:shadow-md transition-all flex items-center gap-2"
            >
              <Icon icon="mdi:content-save" /> Guardar
            </Button>
            <Button
              onClick={() => {
                setShowProductoForm(false);
                setEditProductoId(null);
              }}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancelar
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Grid de productos con animaciones */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {productosFiltrados.map((producto, index) => (
        <motion.div
          key={producto.id_producto}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="flex"
        >
          <Card className="border border-gray-200 p-3 flex flex-col w-full h-full rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group">
            <div className="relative h-48 bg-gray-50 flex items-center justify-center mb-3 overflow-hidden rounded-xl">
              <img
                src={
                  producto.imagen_url.startsWith("http")
                    ? producto.imagen_url
                    : `http://localhost:3001${producto.imagen_url}`
                }
                alt={producto.nombre}
                className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                {producto.en_oferta && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                    -{producto.descuento}%
                  </span>
                )}
                {/* Indicador de stock */}
                <span className={`px-2 py-1 text-xs font-bold rounded-lg ${
                  producto.stock > 10 
                    ? 'bg-green-500 text-white' 
                    : producto.stock > 0 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  Stock: {producto.stock}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col flex-grow p-2">
              <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {producto.nombre}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                {producto.descripcion}
              </p>
              
              <div className="flex justify-between items-center mt-auto mb-3">
                <div className="flex gap-2">
                  <span className={`text-lg font-bold ${producto.en_oferta ? 'text-red-500' : 'text-green-600'}`}>
                    ${typeof producto.precio === 'number' ? producto.precio.toFixed(2) : producto.precio}
                  </span>
                  {producto.en_oferta && (
                    <span className="text-gray-400 text-sm line-through">
                      ${(producto.precio / (1 - producto.descuento / 100)).toFixed(2)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-amber-500">
                  <Icon icon="mdi:star" />
                  <span className="font-medium">{producto.puntuacion}</span>
                </div>
              </div>

              {/* Información adicional del stock */}
              <div className="flex items-center gap-2 mb-3">
                <Icon 
                  icon="mdi:package-variant" 
                  className={`text-sm ${
                    producto.stock > 10 
                      ? 'text-green-500' 
                      : producto.stock > 0 
                      ? 'text-orange-500' 
                      : 'text-red-500'
                  }`} 
                />
                <span className={`text-xs font-medium ${
                  producto.stock > 10 
                    ? 'text-green-600' 
                    : producto.stock > 0 
                    ? 'text-orange-600' 
                    : 'text-red-600'
                }`}>
                  {producto.stock > 10 
                    ? `${producto.stock} disponibles` 
                    : producto.stock > 0 
                    ? `Solo ${producto.stock} disponibles` 
                    : 'Sin stock'}
                </span>
              </div>
            </div>
            
            <CardFooter className="flex gap-3 p-0 pt-3 border-t border-gray-100 mt-auto">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                onClick={() => handleEditarProductoClick(producto.id_producto)}
              >
                <Icon icon="mdi:pencil" className="text-blue-600 mr-1" /> Editar
              </Button>
              <Button
                onClick={() => handleEliminarProductoClick(producto.id_producto)}
                className="bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                size="sm"
              >
                <Icon icon="mdi:delete" className="mr-1" /> Eliminar
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
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
        {tab === "estadisticas" && renderEstadisticas()}
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