import { useState, useEffect, memo } from "react";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabaseClient";
import { TabType } from "../components/StyledTabs";
import EstadisticasDashboard from "../components/dashboard/EstadisticasDashboard";
import { Wallet, Users, Grid3X3, Box, Mail, Receipt } from "lucide-react";
import PagosDashboard from "../components/dashboard/PagosDashboard";
import OrdenesDashboard from "../components/dashboard/OrdenesDashboard";
import ContactosDashboard from "../components/dashboard/ContactosDashboard";
import UsuariosDashboard from "../components/dashboard/UsuariosDashboard";
import CategoriasDashboard from "../components/dashboard/CategoriasDashboard";
import ProductosDashboard from "../components/dashboard/ProductosDashboard";

// Tipos actualizados para Supabase
type Usuario = {
  id_usuario: string; // UUID en Supabase
  nombre_completo: string;
  direccion: string;
  telefono: string;
  rol: "cliente" | "admin";
  avatar_url: string | null;
  foto_perfil: string | null;
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

type Orden = {
  id_orden: number;
  id_usuario: string; // UUID
  fecha: string;
  total: number;
  estado: "pendiente" | "pagado" | "cancelado";
  email_usuario?: string;
  nombre_usuario?: string;
  fecha_actualizacion?: string;
  moneda?: string;
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
  id_usuario: string; // UUID
  metodo_pago: string;
  numero_tarjeta: string;
  fecha_pago: string;
  processing_date: string;
  estado: "completado" | "pendiente" | "cancelado" | "fallido" | "error";
  transaction_id: string;
  monto: number;
  moneda: string;
  firma: string;
  fecha_actualizacion: string;
};

const tabsConfig: Record<
  TabType,
  {
    title: string;
    icon: any;
    color: string;
    description: string;
  }
> = {
  estadisticas: {
    title: "Estadisticas",
    icon: Wallet,
    color: "bg-emerald-500",
    description: "Estadisticas Empresa",
  },
  usuarios: {
    title: "Usuarios",
    icon: Users,
    color: "bg-blue-500",
    description: "Gestión de usuarios",
  },
  categorias: {
    title: "Categorías",
    icon: Grid3X3,
    color: "bg-purple-500",
    description: "Organizar productos",
  },
  productos: {
    title: "Productos",
    icon: Box,
    color: "bg-green-500",
    description: "Inventario y catálogo",
  },
  contactos: {
    title: "Contactos",
    icon: Mail,
    color: "bg-orange-500",
    description: "Mensajes y consultas",
  },
  ordenes: {
    title: "Órdenes",
    icon: Receipt,
    color: "bg-indigo-500",
    description: "Pedidos y ventas",
  },
  pagos: {
    title: "Pagos",
    icon: Wallet,
    color: "bg-emerald-500",
    description: "Transacciones",
  },
};

const categoriaIcons = [
  {
    id_categoria: 1,
    icon: "lucide:droplet",
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  {
    id_categoria: 2,
    icon: "lucide:fuel",
    color: "text-green-500",
    bgColor: "bg-green-100",
  },
  {
    id_categoria: 3,
    icon: "lucide:filter",
    color: "text-amber-500",
    bgColor: "bg-amber-100",
  },
  {
    id_categoria: 4,
    icon: "lucide:battery-charging",
    color: "text-red-500",
    bgColor: "bg-red-100",
  },
  {
    id_categoria: 5,
    icon: "lucide:circle-dot",
    color: "text-purple-500",
    bgColor: "bg-purple-100",
  },
  {
    id_categoria: 6,
    icon: "lucide:wrench",
    color: "text-gray-500",
    bgColor: "bg-gray-100",
  },
  {
    id_categoria: 7,
    icon: "lucide:glass-water",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  {
    id_categoria: 8,
    icon: "lucide:store",
    color: "text-pink-500",
    bgColor: "bg-pink-100",
  },
  {
    id_categoria: 9,
    icon: "lucide:settings",
    color: "text-cyan-500",
    bgColor: "bg-cyan-100",
  },
  {
    id_categoria: 10,
    icon: "lucide:cpu",
    color: "text-indigo-500",
    bgColor: "bg-indigo-100",
  },
];

const CrudDashboard = memo(() => {
  // Log de montaje/desmontaje para diagnóstico
  console.trace("CrudDashboard renderizado desde:");
  useEffect(() => {
    console.log("[CrudDashboard] Montado");
    return () => {
      console.log("[CrudDashboard] Desmontado");
    };
  }, []);

  // Leer tab inicial desde localStorage o usar 'estadisticas'
  const [tab, setTab] = useState<TabType>(() => {
    try {
      const savedTab = localStorage.getItem("crudDashboardTab");
      return (savedTab as TabType) || "estadisticas";
    } catch {
      return "estadisticas";
    }
  });
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [showCategoriaForm, setShowCategoriaForm] = useState(false);
  const [editCategoriaId, setEditCategoriaId] = useState<number | null>(null);
  const [nombreCategoria, setNombreCategoria] = useState("");
  // Estados para imagen de categoría
  const [imagenCategoriaArchivo, setImagenCategoriaArchivo] =
    useState<File | null>(null);
  const [imagenCategoriaPreview, setImagenCategoriaPreview] =
    useState<string>("");
  // Estados restantes
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [ordenDetalles, setOrdenDetalles] = useState<OrdenDetalle[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaUsuario] = useState("");
  const [busquedaOrdenUsuario, setBusquedaOrdenUsuario] = useState("");
  const [busquedaPagoUsuario, setBusquedaPagoUsuario] = useState("");
  const [busquedaCorreo, setBusquedaCorreo] = useState("");

  // Estados para formulario de productos
  const [showProductoForm, setShowProductoForm] = useState(false);
  const [editProductoId, setEditProductoId] = useState<number | null>(null);
  const [imagenArchivo, setImagenArchivo] = useState<File | null>(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [productoForm, setProductoForm] = useState({
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

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (editCategoriaId !== null) {
      const categoria = categorias.find(
        (c) => c.id_categoria === editCategoriaId
      );
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
          descuento: producto.descuento.toString(),
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
        descuento: "0",
      });
    }
  }, [editProductoId]);

  // Actualizar la función fetchAllData para usar Supabase
  const fetchAllData = async () => {
    try {
      // Obtener usuarios
      const { data: usuariosData, error: usuariosError } = await supabase
        .from("usuarios")
        .select("*");

      if (usuariosError) throw usuariosError;

      // Obtener categorías
      const { data: categoriasData, error: categoriasError } = await supabase
        .from("categorias")
        .select("*")
        .order("id_categoria");

      if (categoriasError) throw categoriasError;

      // Obtener productos con categorías
      const { data: productosData, error: productosError } = await supabase
        .from("productos")
        .select(
          `
        *,
        categorias (
          id_categoria,
          nombre_categoria
        )
      `
        )
        .order("id_producto");

      if (productosError) throw productosError;

      // Obtener contactos
      const { data: contactosData, error: contactosError } = await supabase
        .from("contactos")
        .select("*")
        .order("fecha", { ascending: false });

      if (contactosError) throw contactosError;

      // Obtener órdenes
      const { data: ordenesData, error: ordenesError } = await supabase
        .from("ordenes")
        .select("*")
        .order("fecha", { ascending: false });

      if (ordenesError) throw ordenesError;

      // Obtener pagos
      const { data: pagosData, error: pagosError } = await supabase
        .from("pagos")
        .select("*")
        .order("fecha_pago", { ascending: false });

      if (pagosError) throw pagosError;

      // Establecer los datos en el estado
      setUsuarios(usuariosData || []);
      setCategorias(categoriasData || []);
      setProductos(productosData || []);
      setContactos(contactosData || []);
      setOrdenes(ordenesData || []);
      setPagos(pagosData || []);

      // Obtener detalles de órdenes SIN join
      const { data: ordenDetallesData, error: ordenDetallesError } =
        await supabase.from("orden_detalle").select("*");
      if (!ordenDetallesError) {
        setOrdenDetalles(ordenDetallesData || []);
      } else {
        setOrdenDetalles([]);
      }

      console.log("✅ Datos cargados desde Supabase:", {
        usuarios: usuariosData?.length,
        categorias: categoriasData?.length,
        productos: productosData?.length,
        contactos: contactosData?.length,
        ordenes: ordenesData?.length,
        pagos: pagosData?.length,
        ordenDetalles: ordenDetallesData?.length,
      });
    } catch (error) {
      console.error("❌ Error al cargar datos desde Supabase:", error);
      Swal.fire(
        "Error",
        "No se pudieron cargar los datos. Verifica la conexión a Supabase.",
        "error"
      );
    }
  };

  const handleProductoFormChange = (field: string, value: any) => {
    setProductoForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGuardarProducto = async () => {
    try {
      let imagenUrl = productoForm.imagen_url;

      // Si hay una nueva imagen seleccionada, súbela a Supabase Storage
      if (imagenArchivo) {
        setSubiendoImagen(true);
        imagenUrl = await uploadImageToSupabase(imagenArchivo);
        setSubiendoImagen(false);
      }

      // Validaciones básicas
      if (
        !productoForm.nombre ||
        !productoForm.precio ||
        !productoForm.stock ||
        !productoForm.id_categoria
      ) {
        Swal.fire(
          "Campos requeridos",
          "Completa todos los campos obligatorios.",
          "warning"
        );
        return;
      }

      // Construir objeto para insertar/actualizar
      const productoData = {
        nombre: productoForm.nombre,
        descripcion: productoForm.descripcion,
        precio: parseFloat(productoForm.precio),
        stock: parseInt(productoForm.stock),
        puntuacion: parseFloat(productoForm.puntuacion),
        imagen_url: imagenUrl,
        id_categoria: parseInt(productoForm.id_categoria),
        en_oferta: productoForm.en_oferta,
        descuento: parseFloat(productoForm.descuento),
      };

      if (editProductoId === null) {
        // Crear nuevo producto
        const { error } = await supabase
          .from("productos")
          .insert([productoData]);
        if (error) throw error;
        await Swal.fire("¡Éxito!", "Producto creado correctamente.", "success");
      } else {
        // Actualizar producto existente
        const { error } = await supabase
          .from("productos")
          .update(productoData)
          .eq("id_producto", editProductoId);
        if (error) throw error;
        await Swal.fire(
          "¡Éxito!",
          "Producto actualizado correctamente.",
          "success"
        );
      }

      // Limpiar formulario y recargar datos
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
        descuento: "0",
      });
      setImagenArchivo(null);
    } catch (error) {
      console.error("❌ Error al guardar el producto:", error);
      Swal.fire("Error", "No se pudo guardar el producto.", "error");
      setSubiendoImagen(false);
    }
  };

  // Funciones para categorías - migradas a Supabase
  const handleAgregarCategoriaClick = () => {
    setEditCategoriaId(null);
    setShowCategoriaForm(true);
  };

  const handleEditarCategoriaClick = (id_categoria: number) => {
    setEditCategoriaId(id_categoria);
    setShowCategoriaForm(true);
  };

  const handleEliminarCategoriaClick = async (id_categoria: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la categoría permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from("categorias")
          .delete()
          .eq("id_categoria", id_categoria);

        if (error) throw error;

        await Swal.fire(
          "¡Eliminado!",
          "La categoría ha sido eliminada con éxito.",
          "success"
        );
        fetchAllData();
      } catch (error) {
        console.error("❌ Error al eliminar categoría:", error);
        Swal.fire(
          "Error",
          "Hubo un problema al eliminar la categoría.",
          "error"
        );
      }
    }
  };

  const handleGuardarCategoria = async () => {
    try {
      let imagenUrl = "";
      if (imagenCategoriaArchivo) {
        imagenUrl = await uploadCategoriaImageToSupabase(
          imagenCategoriaArchivo
        );
      } else if (editCategoriaId !== null) {
        // Si está editando y no cambia la imagen, mantener la anterior
        const cat = categorias.find((c) => c.id_categoria === editCategoriaId);
        imagenUrl = cat?.imagen_url || "";
      }
      if (editCategoriaId === null) {
        // Crear nueva categoría
        const { error } = await supabase
          .from("categorias")
          .insert([
            { nombre_categoria: nombreCategoria, imagen_url: imagenUrl },
          ]);

        if (error) throw error;
      } else {
        // Actualizar categoría existente
        const { error } = await supabase
          .from("categorias")
          .update({ nombre_categoria: nombreCategoria, imagen_url: imagenUrl })
          .eq("id_categoria", editCategoriaId);

        if (error) throw error;
      }

      await Swal.fire(
        "¡Éxito!",
        "La categoría ha sido guardada correctamente.",
        "success"
      );
      fetchAllData();
      setShowCategoriaForm(false);
      setEditCategoriaId(null);
      setNombreCategoria("");
      setImagenCategoriaArchivo(null);
      setImagenCategoriaPreview("");
    } catch (error) {
      console.error("❌ Error al guardar la categoría:", error);
      Swal.fire("Error", "No se pudo guardar la categoría.", "error");
    }
  };

  // Cambiar imagen de categoría
  const handleImagenCategoriaChange = (file: File | null) => {
    setImagenCategoriaArchivo(file);
    if (file) {
      setImagenCategoriaPreview(URL.createObjectURL(file));
    } else {
      setImagenCategoriaPreview("");
    }
  };

  // Subir imagen de categoría a Supabase Storage
  const uploadCategoriaImageToSupabase = async (
    file: File
  ): Promise<string> => {
    if (!file) throw new Error("No se ha seleccionado ningún archivo");
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type))
      throw new Error("Tipo de archivo no permitido");
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) throw new Error("El archivo es demasiado grande");
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `categorias/${timestamp}-${randomId}.${fileExtension}`;
    const { error } = await supabase.storage
      .from("productos-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
    if (error) throw new Error(`Error al subir imagen: ${error.message}`);
    const { data: urlData } = supabase.storage
      .from("productos-images")
      .getPublicUrl(fileName);
    if (!urlData?.publicUrl)
      throw new Error("No se pudo obtener la URL pública de la imagen");
    return urlData.publicUrl;
  };

  // Funciones para productos - migradas a Supabase
  const handleAgregarProductoClick = () => {
    setEditProductoId(null);
    setShowProductoForm(true);
  };

  // Función para subir imagen a Supabase Storage
  const uploadImageToSupabase = async (file: File): Promise<string> => {
    try {
      // Validar el archivo
      if (!file) {
        throw new Error("No se ha seleccionado ningún archivo");
      }

      // Validar tipo de archivo (solo imágenes)
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          "Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WebP, GIF)"
        );
      }

      // Validar tamaño del archivo (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error(
          "El archivo es demasiado grande. Tamaño máximo permitido: 5MB"
        );
      }

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `productos/${timestamp}-${randomId}.${fileExtension}`;

      console.log(
        "📁 Iniciando subida de imagen a Supabase Storage:",
        fileName
      );

      // Subir archivo a Supabase Storage
      const { error } = await supabase.storage
        .from("productos-images") // Nombre del bucket en Supabase Storage
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (error) {
        console.error("❌ Error al subir imagen:", error);
        throw new Error(`Error al subir imagen: ${error.message}`);
      }

      // Obtener la URL pública del archivo
      const { data: urlData } = supabase.storage
        .from("productos-images")
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error("No se pudo obtener la URL pública de la imagen");
      }

      console.log("✅ Imagen subida exitosamente:", urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error("❌ Error en uploadImageToSupabase:", error);
      throw error;
    }
  };


  const handleImagenChange = (file: File | null) => {
    setImagenArchivo(file);
  };

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );


  const contactosFiltrados = contactos.filter((contacto) =>
    contacto.correo.toLowerCase().includes(busquedaCorreo.toLowerCase())
  );

  const pagosFiltrados = pagos.filter((pago) => {
    const orden = ordenes.find((o) => o.id_orden === pago.id_orden);
    const usuario = orden
      ? usuarios.find((u) => u.id_usuario === orden.id_usuario)
      : null;
    return usuario?.nombre_completo
      .toLowerCase()
      .includes(busquedaPagoUsuario.toLowerCase());
  });

  // Render para estadísticas
  const renderEstadisticas = () => (
    <EstadisticasDashboard
      ordenes={ordenes}
      productos={productos}
      categorias={categorias}
      ordenDetalles={ordenDetalles}
    />
  );

  // Render para órdenes (ahora usando el componente externo)
  const renderOrdenes = () => (
    <OrdenesDashboard
      ordenes={ordenes}
      usuarios={usuarios}
      pagos={pagos}
      ordenDetalles={ordenDetalles}
      productos={productos}
      busquedaOrdenUsuario={busquedaOrdenUsuario}
      setBusquedaOrdenUsuario={setBusquedaOrdenUsuario}
      cambiarEstadoOrden={cambiarEstadoOrden}
      handleEliminarOrden={handleEliminarOrden}
    />
  );

  // Render para contactos
  const renderContactos = () => (
    <ContactosDashboard
      contactosFiltrados={contactosFiltrados}
      busquedaCorreo={busquedaCorreo}
      setBusquedaCorreo={setBusquedaCorreo}
      handleEliminarContacto={handleEliminarContacto}
    />
  );

  // Render para pagos
  const renderPagos = () => (
    <PagosDashboard
      pagosFiltrados={pagosFiltrados}
      ordenes={ordenes}
      usuarios={usuarios}
      busquedaPagoUsuario={busquedaPagoUsuario}
      setBusquedaPagoUsuario={setBusquedaPagoUsuario}
    />
  );

  const renderUsuarios = () => (
    <UsuariosDashboard usuarios={usuarios} fetchAllData={fetchAllData} />
  );

  const renderCategorias = () => (
    <CategoriasDashboard
      categorias={categorias}
      showCategoriaForm={showCategoriaForm}
      editCategoriaId={editCategoriaId}
      nombreCategoria={nombreCategoria}
      setNombreCategoria={setNombreCategoria} // <-- Agrega esto
      imagenCategoriaArchivo={imagenCategoriaArchivo}
      imagenCategoriaPreview={imagenCategoriaPreview}
      handleAgregarCategoriaClick={handleAgregarCategoriaClick}
      handleEditarCategoriaClick={handleEditarCategoriaClick}
      handleEliminarCategoriaClick={handleEliminarCategoriaClick}
      handleGuardarCategoria={handleGuardarCategoria}
      handleImagenCategoriaChange={handleImagenCategoriaChange}
      setShowCategoriaForm={setShowCategoriaForm}
      setEditCategoriaId={setEditCategoriaId}
      setImagenCategoriaArchivo={setImagenCategoriaArchivo}
      setImagenCategoriaPreview={setImagenCategoriaPreview}
      categoriaIcons={categoriaIcons}
    />
  );

  const renderProductos = () => (
    <ProductosDashboard
      productosFiltrados={productosFiltrados}
      categorias={categorias}
      busqueda={busqueda}
      setBusqueda={setBusqueda}
      showProductoForm={showProductoForm}
      editProductoId={editProductoId}
      productoForm={productoForm}
      imagenArchivo={imagenArchivo}
      subiendoImagen={subiendoImagen}
      handleAgregarProductoClick={handleAgregarProductoClick}
      handleEditarProductoClick={handleEditarProductoClick}
      handleEliminarProductoClick={handleEliminarProductoClick}
      handleGuardarProducto={handleGuardarProducto}
      handleProductoFormChange={handleProductoFormChange}
      handleImagenChange={handleImagenChange}
      setShowProductoForm={setShowProductoForm}
      setEditProductoId={setEditProductoId}
      setImagenArchivo={setImagenArchivo}
    />
  );

  // Guardar el tab en localStorage cada vez que cambie
  useEffect(() => {
    const savedTab = localStorage.getItem("crudDashboardTab");
    if (savedTab !== tab) {
      localStorage.setItem("crudDashboardTab", tab);
    }
  }, [tab]);

  // Cambiar estado de una orden en Supabase
  const cambiarEstadoOrden = async (
    id_orden: number,
    nuevoEstado: "pendiente" | "pagado" | "cancelado"
  ) => {
    try {
      const { error } = await supabase
        .from("ordenes")
        .update({ estado: nuevoEstado })
        .eq("id_orden", id_orden);
      if (error) throw error;
      fetchAllData();
    } catch (error) {
      console.error("❌ Error al cambiar el estado de la orden:", error);
      Swal.fire("Error", "No se pudo cambiar el estado de la orden.", "error");
    }
  };

  // Función para eliminar una orden
  const handleEliminarOrden = async (id_orden: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la orden permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from("ordenes")
          .delete()
          .eq("id_orden", id_orden);

        if (error) throw error;

        await Swal.fire(
          "¡Eliminado!",
          "La orden ha sido eliminada con éxito.",
          "success"
        );
        fetchAllData();
      } catch (error) {
        console.error("❌ Error al eliminar orden:", error);
        Swal.fire("Error", "Hubo un problema al eliminar la orden.", "error");
      }
    }
  };

  // Función para eliminar contacto (antes estaba inline en renderContactos)
  const handleEliminarContacto = async (id_contacto: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el mensaje de contacto permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from("contactos")
          .delete()
          .eq("id_contacto", id_contacto);

        if (error) throw error;

        await Swal.fire(
          "¡Eliminado!",
          "El mensaje de contacto ha sido eliminado con éxito.",
          "success"
        );
        fetchAllData();
      } catch (error) {
        console.error("❌ Error al eliminar contacto:", error);
        Swal.fire(
          "Error",
          "Hubo un problema al eliminar el mensaje de contacto.",
          "error"
        );
      }
    }
  };

  // Función para eliminar un producto
  const handleEliminarProductoClick = async (
    id_producto: number
  ): Promise<void> => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el producto permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        // Eliminar de la tabla productos
        const { error } = await supabase
          .from("productos")
          .delete()
          .eq("id_producto", id_producto);

        if (error) throw error;

        await Swal.fire(
          "¡Eliminado!",
          "El producto ha sido eliminado con éxito.",
          "success"
        );
        fetchAllData();
      } catch (error) {
        console.error("❌ Error al eliminar producto:", error);
        Swal.fire(
          "Error",
          "Hubo un problema al eliminar el producto.",
          "error"
        );
      }
    }
  };

  // Función para editar un producto (abre el formulario con los datos del producto seleccionado)
  const handleEditarProductoClick = (id_producto: number) => {
    setEditProductoId(id_producto);
    setShowProductoForm(true);
    // Opcional: puedes cargar los datos del producto en el formulario si lo deseas
    const producto = productos.find((p) => p.id_producto === id_producto);
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
        descuento: producto.descuento.toString(),
      });
      setImagenArchivo(null);
    }
  };

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
                ${
                  isActive
                    ? "bg-white text-gray-800 shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
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
        {tab === "ordenes" && renderOrdenes()}
        {tab === "pagos" && renderPagos()}
      </div>
    </div>
  );
});

export default CrudDashboard;
