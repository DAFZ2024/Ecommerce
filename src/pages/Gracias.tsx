import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/react";


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
    nombre: string;
    cantidad: number;
    precio_unitario: number;
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

  // Obtener información de pago y orden
  useEffect(() => {
    const obtenerDatosPago = async () => {
  if (!ordenId) return;
  
  try {
    setLoading(true);
    
    // 1. Obtener pago
    const pagoResponse = await fetch(`http://localhost:3001/api/ordenes/${ordenId}/pago`);
    
    if (!pagoResponse.ok) {
      const errorText = await pagoResponse.text();
      throw new Error(`Error pago: ${pagoResponse.status} - ${errorText}`);
    }
    
    const pagoData = await pagoResponse.json();
    setPagoInfo(pagoData);
    
    // 2. Obtener orden
    const ordenResponse = await fetch(`http://localhost:3001/api/ordenes/${ordenId}`);
    
    if (!ordenResponse.ok) {
      const errorText = await ordenResponse.text();
      throw new Error(`Error orden: ${ordenResponse.status} - ${errorText}`);
    }
    
    const ordenData = await ordenResponse.json();
    setOrdenInfo(ordenData);
    
  } catch (error) {
    console.error("Error obteniendo datos:", error);
  } finally {
    setLoading(false);
  }
};
    
    obtenerDatosPago();
  }, [ordenId]);

  // Determinar estado y colores
  const getStatusInfo = () => {
    switch (estado) {
      case '4': // Aprobado
        return {
          icon: 'mdi:check-circle',
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          title: '¡Pago Completado!',
          message: 'Tu pago ha sido procesado exitosamente'
        };
      case '6': // Cancelado
        return {
          icon: 'mdi:cancel',
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          title: 'Pago Cancelado',
          message: 'Tu pago fue cancelado'
        };
      case '7': // Pendiente
        return {
          icon: 'mdi:clock',
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          title: 'Pago Pendiente',
          message: 'Estamos procesando tu pago'
        };
      case '104': // Error
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
                    ${Number(ordenInfo.total).toFixed(2)} {ordenInfo.productos[0]?.moneda || 'COP'}
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
                  {ordenInfo.productos.map((producto, index) => (
                    <li key={index} className="py-3 flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{producto.nombre}</p>
                        <p className="text-gray-600">
                          {producto.cantidad} x ${Number(producto.precio_unitario).toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">
                        {`$${(producto.cantidad * Number(producto.precio_unitario)).toFixed(2)}`}
                      </p>
                    </li>
                  ))}
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
            variant="primary" 
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