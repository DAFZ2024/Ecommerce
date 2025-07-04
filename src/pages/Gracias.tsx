import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/react";
import { supabase } from "../lib/supabaseClient";

// Definir tipos para los datos de pago
interface PagoInfo {
  id_pago: number;
  id_orden: number;
  id_usuario: number;
  metodo_pago: string;
  estado: string;
  transaction_id: string;
  monto: number;
  moneda: string;
  numero_tarjeta: string;
  processing_date: string;
}

interface OrdenInfo {
  id_orden: number;
  total: number;
  fecha_creacion: string;
  nombre_usuario: string;
  email_usuario: string;
  productos: {
    id_producto: number;
    cantidad: number;
    precio_unitario: number;
    productos: { nombre: string };
  }[];
}

export const Gracias = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const [pagoInfo, setPagoInfo] = useState<PagoInfo | null>(null);
  const [ordenInfo, setOrdenInfo] = useState<OrdenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const estado = queryParams.get('estado');
  const ordenId = queryParams.get('orden');
  const transactionState = queryParams.get('transactionState') || queryParams.get('lapTransactionState') || queryParams.get('polTransactionState');

  // Obtener información de pago y orden
  useEffect(() => {
    const obtenerDatosPago = async () => {
      if (!ordenId) return;
      try {
        setLoading(true);
        // 1. Obtener pago desde Supabase
        const { data: pagoData, error: pagoError } = await supabase
          .from('pagos')
          .select('*')
          .eq('id_orden', ordenId)
          .maybeSingle();
        if (pagoError) throw pagoError;
        setPagoInfo(pagoData);
        // 2. Obtener orden desde Supabase
        const { data: ordenData, error: ordenError } = await supabase
          .from('ordenes')
          .select('*')
          .eq('id_orden', ordenId)
          .single();
        if (ordenError) throw ordenError;
        // 3. Obtener productos de la orden
        const { data: productosData, error: productosError } = await supabase
          .from('orden_detalle')
          .select('id_producto, cantidad, precio_unitario, productos(nombre)')
          .eq('id_orden', ordenId);
        if (productosError) throw productosError;
        setOrdenInfo({ ...ordenData, productos: productosData || [] });
      } catch (error) {
        console.error("Error obteniendo datos:", error);
      } finally {
        setLoading(false);
      }
    };
    obtenerDatosPago();
  }, [ordenId]);

  // Actualizar estado de la orden y el pago en Supabase si hay estado válido
  useEffect(() => {
    const actualizarEstado = async () => {
      if (!ordenId) return;
      // Mapear el estado de PayU a los valores de tu base de datos
      let nuevoEstado = '';
      const estadoPayU = (estado || transactionState)?.toString().toUpperCase();
      switch (estadoPayU) {
        case '4':
        case 'APPROVED':
          nuevoEstado = 'aprobado';
          break;
        case '6':
        case 'DECLINED':
          nuevoEstado = 'rechazado';
          break;
        case '7':
        case 'PENDING':
          nuevoEstado = 'pendiente';
          break;
        case '104':
        case 'ERROR':
          nuevoEstado = 'error';
          break;
        default:
          return; // No actualizar si no hay estado válido
      }
      // Extraer datos de la URL de PayU
      const transaction_id = queryParams.get('transactionId') || '';
      const monto = queryParams.get('TX_VALUE') || queryParams.get('amount') || null;
      const moneda = queryParams.get('currency') || 'COP';
      const numero_tarjeta = queryParams.get('cc_number') || queryParams.get('lapPaymentMethod') || '';
      const processing_date = queryParams.get('processingDate') || null;
      const firma = queryParams.get('signature') || '';
      // Actualizar estado en ordenes
      await supabase
        .from('ordenes')
        .update({ estado: nuevoEstado })
        .eq('id_orden', ordenId);
      // Actualizar estado y datos en pagos
      await supabase
        .from('pagos')
        .update({
          estado: nuevoEstado,
          transaction_id,
          monto: monto ? Number(monto) : null,
          moneda,
          numero_tarjeta,
          processing_date: processing_date ? new Date(processing_date) : null,
          firma
        })
        .eq('id_orden', ordenId);
    };
    actualizarEstado();
  }, [ordenId, estado, transactionState]);

  // Descontar stock real solo si la orden está aprobada y no se ha descontado antes
  useEffect(() => {
    const descontarStockSiEsAprobado = async () => {
      if (!ordenInfo || ordenInfo.productos.length === 0) return;
      // Obtener la orden para verificar estado y si ya se descontó stock
      const { data: ordenDB, error: ordenError } = await supabase
        .from('ordenes')
        .select('estado, stock_actualizado')
        .eq('id_orden', ordenInfo.id_orden)
        .single();
      if (ordenError) return;
      if (ordenDB.estado === 'aprobado' && !ordenDB.stock_actualizado) {
        // Descontar stock de cada producto
        for (const item of ordenInfo.productos) {
          const { data, error: fetchError } = await supabase
            .from('productos')
            .select('stock')
            .eq('id_producto', item.id_producto)
            .single();
          if (fetchError || !data) continue;
          const nuevoStock = Math.max((data.stock || 0) - item.cantidad, 0);
          await supabase
            .from('productos')
            .update({ stock: nuevoStock })
            .eq('id_producto', item.id_producto);
        }
        // Marcar la orden como stock descontado
        await supabase
          .from('ordenes')
          .update({ stock_actualizado: true })
          .eq('id_orden', ordenInfo.id_orden);
      }
    };
    descontarStockSiEsAprobado();
  }, [ordenInfo]);

  // Determinar estado y colores
  const getStatusInfo = () => {
    // Mapear el estado de PayU a los estados internos
    const estadoPago = estado || transactionState;
    switch (estadoPago) {
      case '4': // Aprobado
      case 'APPROVED':
        return {
          icon: 'mdi:check-circle',
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          title: '¡Pago Completado!',
          message: 'Tu pago ha sido procesado exitosamente'
        };
      case '6': // Cancelado/Declinado
      case 'DECLINED':
        return {
          icon: 'mdi:cancel',
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          title: 'Pago Cancelado',
          message: 'Tu pago fue cancelado o rechazado'
        };
      case '7': // Pendiente
      case 'PENDING':
        return {
          icon: 'mdi:clock',
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          title: 'Pago Pendiente',
          message: 'Estamos procesando tu pago'
        };
      case '104': // Error
      case 'ERROR':
        return {
          icon: 'mdi:alert-circle',
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          title: 'Error en el Pago',
          message: 'Ocurrió un error al procesar tu pago'
        };
      default:
        return {
          icon: 'mdi:help-circle',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          title: 'Estado Desconocido',
          message: 'No pudimos determinar el estado de tu pago'
        };
    }
  };

  const statusInfo = getStatusInfo();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando tu pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className={`rounded-lg ${statusInfo.bgColor} p-8 mb-8 text-center`}>
          <Icon 
            icon={statusInfo.icon} 
            className={`${statusInfo.color} text-6xl mx-auto mb-4`} 
          />
          <h1 className={`text-3xl font-bold ${statusInfo.color} mb-2`}>
            {statusInfo.title}
          </h1>
          <p className="text-gray-600 text-lg">
            {statusInfo.message}
          </p>
          {!pagoInfo && (
            <div className="mt-6 text-red-500 font-semibold">
              No se ha registrado el pago para esta orden aún.
            </div>
          )}
          {pagoInfo && (
            <div className="mt-6">
              <p className="text-gray-700">
                ID de transacción: <span className="font-mono">{pagoInfo.transaction_id}</span>
              </p>
            </div>
          )}
        </div>

        {ordenInfo && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Detalles de tu orden</h2>
              <p className="text-gray-600">Orden #{ordenInfo.id_orden}</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fecha</h3>
                  <p className="text-gray-900">
                    {new Date(ordenInfo.fecha_creacion).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total</h3>
                  <p className="text-xl font-bold text-gray-900">
                    ${Number(ordenInfo.total).toFixed(2)} COP
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
                <p className="text-gray-900">{ordenInfo.nombre_usuario}</p>
                <p className="text-gray-600">{ordenInfo.email_usuario}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Productos</h3>
                <ul className="divide-y divide-gray-200">
                  {Array.isArray(ordenInfo.productos) && ordenInfo.productos.length > 0 ? (
                    ordenInfo.productos.map((producto, index) => (
                      <li key={index} className="py-3 flex justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{producto.productos?.nombre || 'Sin nombre'}</p>
                          <p className="text-gray-600">
                            {producto.cantidad} x ${Number(producto.precio_unitario).toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium text-gray-900">
                          {`$${(producto.cantidad * Number(producto.precio_unitario)).toFixed(2)}`}
                        </p>
                      </li>
                    ))
                  ) : (
                    <li className="py-3 text-gray-500">No hay productos en esta orden.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {pagoInfo && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Detalles del pago</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Método de pago</h3>
                  <p className="text-gray-900">{pagoInfo.metodo_pago}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tarjeta</h3>
                  <p className="text-gray-900">{pagoInfo.numero_tarjeta}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fecha de procesamiento</h3>
                  <p className="text-gray-900">
                    {pagoInfo.processing_date 
                      ? new Date(pagoInfo.processing_date).toLocaleString() 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                  <p className="text-gray-900 capitalize">{pagoInfo.estado}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Button 
            variant="solid" 
            onClick={() => navigate('/')}
            className="px-6 py-3"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
};
export default Gracias;