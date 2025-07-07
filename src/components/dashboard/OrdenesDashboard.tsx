import { Card, CardBody, CardFooter, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from "../../lib/supabaseClient";
import Swal from "sweetalert2";

// Tipos de datos
export type Usuario = {
  id_usuario: string;
  nombre_completo: string;
  direccion: string;
  telefono: string;
  rol: "cliente" | "admin";
  avatar_url: string | null;
  foto_perfil: string | null;
};

export type Orden = {
  id_orden: number;
  id_usuario: string;
  fecha: string;
  total: number;
  estado: 'pendiente' | 'pagado' | 'cancelado';
};

export type OrdenDetalle = {
  id_detalle: number;
  id_orden: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
};

export type Pago = {
  id_pago: number;
  id_orden: number;
  id_usuario: string;
  metodo_pago: string;
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

export type Producto = {
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

interface OrdenesDashboardProps {
  ordenes: Orden[];
  usuarios: Usuario[];
  pagos: Pago[];
  ordenDetalles: OrdenDetalle[];
  productos: Producto[];
  busquedaOrdenUsuario: string;
  setBusquedaOrdenUsuario: (v: string) => void;
  cambiarEstadoOrden: (id_orden: number, estado: 'pendiente' | 'pagado' | 'cancelado') => void;
  handleEliminarOrden: (id_orden: number) => void;
}

const OrdenesDashboard: React.FC<OrdenesDashboardProps> = ({
  ordenes,
  usuarios,
  pagos,
  ordenDetalles,
  productos,
  busquedaOrdenUsuario,
  setBusquedaOrdenUsuario,
  cambiarEstadoOrden,
  handleEliminarOrden,
}) => {
  // Estado local para el filtro de fecha
  const [busquedaFecha, setBusquedaFecha] = useState("");
  const [fechaDatePicker, setFechaDatePicker] = useState<Date | null>(null);
  const [comentarios, setComentarios] = useState<{ [key: number]: string }>({});

  const ordenesFiltradas = ordenes.filter((orden) => {
    const usuario = usuarios.find(u => u.id_usuario === orden.id_usuario);
    const coincideUsuario = usuario?.nombre_completo.toLowerCase().includes(busquedaOrdenUsuario.toLowerCase());
    const coincideFecha = busquedaFecha === "" || orden.fecha.startsWith(busquedaFecha);
    return coincideUsuario && coincideFecha;
  });

  const statusOptions = [
    { value: "pending", label: "Pendiente" },
    { value: "processing", label: "Procesando" },
    { value: "shipped", label: "Enviado" },
    { value: "delivered", label: "Entregado" },
    { value: "cancelled", label: "Cancelado" },
  ];

  const handleStatusChange = async (
    orderId: number,
    newStatus: string,
    usuarioId: string | null = null,
    comentario: string = ""
  ) => {
    try {
      const { error } = await supabase.from("seguimiento_pedidos").insert({
        order_id: orderId,
        status: newStatus,
        comentario,
        usuario_id: usuarioId,
      });
      if (error) throw error;
      setComentarios((prev) => ({ ...prev, [orderId]: "" }));
      await Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        text: "El estado y comentario fueron guardados correctamente.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err: any) {
      await Swal.fire({
        icon: "error",
        title: "Error al actualizar el estado",
        text: err.message || String(err),
      });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-slate-700 flex items-center gap-2">
        🧾 Órdenes de Compra
      </h2>
      <div className="mb-4 flex flex-col md:flex-row gap-2 md:items-center">
        <input
          type="text"
          placeholder="Buscar por nombre del usuario..."
          value={busquedaOrdenUsuario}
          onChange={(e) => setBusquedaOrdenUsuario(e.target.value)}
          className="border border-slate-300 px-3 py-2 rounded w-full md:w-1/2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <div className="relative w-full md:w-1/3 flex items-center">
          <DatePicker
            selected={fechaDatePicker}
            onChange={(date: Date | null) => {
              setFechaDatePicker(date);
              if (date) {
                // Formato YYYY-MM-DD para comparar con orden.fecha
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                setBusquedaFecha(`${yyyy}-${mm}-${dd}`);
              } else {
                setBusquedaFecha("");
              }
            }}
            dateFormat="yyyy-MM-dd"
            placeholderText="Filtrar por fecha"
            className="pl-10 border border-slate-300 px-3 py-2 rounded w-full text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            calendarClassName="z-50"
            isClearable
            customInput={
              <div className="flex items-center w-full">
                <Icon icon="mdi:calendar-month-outline" className="text-lg absolute left-3 pointer-events-none text-slate-400" />
                <input
                  className="pl-10 border-none outline-none bg-transparent w-full"
                  style={{ background: "transparent" }}
                />
              </div>
            }
          />
        </div>
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
                              <span className="font-semibold text-slate-700">{producto?.nombre || 'Producto eliminado'}</span>
                              <span className="ml-2 text-xs text-slate-500">x{detalle.cantidad}</span>
                            </div>
                            <div className="font-semibold text-slate-700">
                              ${((detalle.cantidad * detalle.precio_unitario) || 0).toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="border-t pt-4 mt-4 flex justify-between items-center">
                  <div className="font-bold text-slate-800">Total: ${(parseFloat(String(orden.total)) || 0).toFixed(2)}</div>
                  {pago && (
                    <div className="text-sm text-slate-600 text-right">
                      <div>
                        <span className="font-medium">Pago: </span>
                        <span className={
                          pago.estado === 'completado' ? 'text-green-600' : 'text-red-600'
                        }>
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
              <CardFooter className="flex flex-col md:flex-row md:justify-between p-4 gap-2 md:gap-0">
                <div className="flex flex-wrap gap-2 items-center">
                  <label className="font-medium text-slate-700 mr-2">Estado:</label>
                  <div className="relative">
                    <select
                      className="appearance-none border border-slate-300 rounded-lg px-3 py-2 pr-8 text-slate-800 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                      value={orden.estado}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        await handleStatusChange(
                          orden.id_orden,
                          newStatus,
                          usuario?.id_usuario || null,
                          comentarios[orden.id_orden] || ""
                        );
                      }}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Icon icon="mdi:chevron-down" className="text-lg" />
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Comentario (opcional)"
                    className="border border-slate-300 rounded-lg px-3 py-2 text-slate-800 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 w-56 transition-all"
                    value={comentarios[orden.id_orden] || ""}
                    onChange={e => setComentarios(prev => ({ ...prev, [orden.id_orden]: e.target.value }))}
                    maxLength={200}
                  />
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <Button
                    variant="solid"
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm shadow"
                    onClick={() => handleEliminarOrden(orden.id_orden)}
                  >
                    <Icon icon="mdi:delete-outline" className="text-base" />
                    Eliminar
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default OrdenesDashboard;
