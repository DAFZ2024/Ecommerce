import React, { useState, useMemo, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  TruckIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  EyeIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';

interface OrderItem {
  id_detalle: number;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  imagen_url?: string;
}

interface OrderTracking {
  id: number;
  order_id: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  comentario?: string;
  fecha_hora: string;
  usuario_id?: string;
  usuario?: {
    nombre_completo?: string;
  };
}

interface Order {
  id_orden: number;
  fecha_orden?: string;
  fecha_creacion?: string;
  estado: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  direccion_envio: string;
  telefono_contacto: string;
  metodo_pago: string;
  usuario?: {
    nombre_completo?: string;
  };
  detalles?: OrderItem[];
  seguimiento?: OrderTracking[];
}

interface User {
  id: string;
  nombre_completo?: string;
  correo: string;
  direccion?: string;
  telefono?: string;
}

interface Payment {
  id_pago: number;
  id_orden: number;
  monto: number;
  metodo_pago: string;
  estado_pago: string;
  fecha_pago: string;
  referencia_pago?: string;
}

interface Props {
  user: User;
  payments: Payment[];
}

export const OrderTracker: React.FC<Props> = ({ user, payments }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Cargar órdenes desde Supabase
  useEffect(() => {
    fetchOrders();
  }, [user.id]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Query base para obtener órdenes
      let query = supabase
        .from('ordenes')
        .select(`
          *,
          usuarios!inner(nombre_completo),
          orden_detalle(
            id_detalle,
            cantidad,
            precio_unitario,
            productos(nombre, imagen_url)
          )
        `)
        .order('fecha_creacion', { ascending: false });

      // Filtrar por el usuario autenticado
      if (user.id) {
        query = query.eq('id_usuario', user.id);
      }

      const { data: ordersData, error } = await query;

      if (error) {
        console.error('Error obteniendo órdenes:', error);
        toast.error('Error al cargar órdenes');
        return;
      }

      // Procesar los datos de órdenes
      const processedOrders: Order[] = ordersData.map((order: any) => ({
        id_orden: order.id_orden,
        fecha_orden: order.fecha_orden,
        fecha_creacion: order.fecha_creacion,
        estado: order.estado,
        total: parseFloat(order.total) || 0,
        direccion_envio: user.direccion || 'No especificada', // SIEMPRE del user
        telefono_contacto: user.telefono || 'No especificado', // SIEMPRE del user
        metodo_pago: order.metodo_pago || 'No especificado',
        usuario: {
          nombre_completo: order.usuarios?.nombre_completo || 'Cliente desconocido'
        },
        detalles: order.orden_detalle?.map((detalle: any) => ({
          id_detalle: detalle.id_detalle,
          nombre_producto: detalle.productos?.nombre || 'Producto desconocido',
          cantidad: detalle.cantidad,
          precio_unitario: detalle.precio_unitario,
          subtotal: detalle.cantidad * detalle.precio_unitario,
          imagen_url: detalle.productos?.imagen_url
        })) || []
      }));

      // Obtener el seguimiento para cada orden
      const ordersWithTracking = await Promise.all(
        processedOrders.map(async (order) => {
          const tracking = await fetchOrderTracking(order.id_orden);
          return { ...order, seguimiento: tracking };
        })
      );

      setOrders(ordersWithTracking);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  // Obtener seguimiento de una orden específica
  const fetchOrderTracking = async (orderId: number): Promise<OrderTracking[]> => {
    try {
      const { data: trackingData, error } = await supabase
        .from('seguimiento_pedidos')
        .select(`
          *,
          usuarios(nombre_completo)
        `)
        .eq('order_id', orderId)
        .order('fecha_hora', { ascending: false });

      if (error) {
        console.error('Error obteniendo seguimiento:', error);
        return [];
      }

      return trackingData.map((tracking: any) => ({
        id: tracking.id,
        order_id: tracking.order_id,
        status: tracking.status,
        comentario: tracking.comentario,
        fecha_hora: tracking.fecha_hora,
        usuario_id: tracking.usuario_id,
        usuario: {
          nombre_completo: tracking.usuarios?.nombre_completo
        }
      }));
    } catch (error) {
      console.error('Error fetching tracking:', error);
      return [];
    }
  };

  // Obtener el último estado de seguimiento
  const getLatestStatus = (order: Order): 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' => {
    if (order.seguimiento && order.seguimiento.length > 0) {
      return order.seguimiento[0].status; // El más reciente (ordenado por fecha DESC)
    }
    return order.estado;
  };

  const getStatusConfig = (status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => {
    const configs = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: ClockIcon, 
        label: 'Pendiente' 
      },
      processing: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: ClockIcon, 
        label: 'Procesando' 
      },
      shipped: { 
        color: 'bg-purple-100 text-purple-800 border-purple-200', 
        icon: TruckIcon, 
        label: 'Enviado' 
      },
      delivered: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircleIcon, 
        label: 'Entregado' 
      },
      cancelled: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircleIcon, 
        label: 'Cancelado' 
      }
    };
    return configs[status];
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.id_orden.toString().includes(searchTerm) ||
                           (order.usuario?.nombre_completo || '').toLowerCase().includes(searchTerm.toLowerCase());
      const latestStatus = getLatestStatus(order);
      const matchesStatus = statusFilter === 'all' || latestStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, orders]);

  const getStatusSteps = (status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => {
    if (status === 'cancelled') {
      return [
        { key: 'pending', label: 'Pendiente', completed: true },
        { key: 'cancelled', label: 'Cancelado', completed: true }
      ];
    }
    
    const steps = [
      { key: 'pending', label: 'Pendiente', completed: true },
      { key: 'processing', label: 'Procesando', completed: status !== 'pending' },
      { key: 'shipped', label: 'Enviado', completed: status === 'shipped' || status === 'delivered' },
      { key: 'delivered', label: 'Entregado', completed: status === 'delivered' }
    ];
    return steps;
  };

  // Función para obtener detalles completos de una orden
  const selectOrder = async (order: Order) => {
    try {
      setLoadingDetails(true);
      
      // Obtener seguimiento actualizado
      const tracking = await fetchOrderTracking(order.id_orden);
      
      setSelectedOrder({
        ...order,
        seguimiento: tracking
      });
    } catch (error) {
      console.error('Error selecting order:', error);
      toast.error('Error al cargar detalles');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Si no hay userId, mostrar mensaje y no cargar nada
  if (!user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No se ha proporcionado el ID del usuario. No se pueden mostrar las órdenes.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Seguimiento de Pedidos
          </h1>
          <p className="text-gray-600">
            Gestiona y rastrea todos los pedidos en tiempo real
          </p>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número de orden o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-40"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="processing">Procesando</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="grid gap-6">
          {filteredOrders.map((order) => {
            const currentStatus = getLatestStatus(order);
            const statusConfig = getStatusConfig(currentStatus);
            // Si el status no es reconocido, usar un fallback
            if (!statusConfig) {
              return (
                <div
                  key={order.id_orden}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Orden #{order.id_orden}
                          </h3>
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-gray-200 text-gray-500 border-gray-300">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            Estado desconocido
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>Pedido: {new Date(order.fecha_creacion || order.fecha_orden || '').toLocaleDateString('es-CO')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4" />
                            <span>{order.usuario?.nombre_completo || 'Cliente desconocido'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CurrencyDollarIcon className="w-4 h-4" />
                            <span className="font-medium">${order.total.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Productos */}
                        <div className="flex flex-wrap gap-2">
                          {order.detalles?.slice(0, 3).map((item) => (
                            <div key={item.id_detalle} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1">
                              {item.imagen_url && (
                                <img 
                                  src={item.imagen_url} 
                                  alt={item.nombre_producto}
                                  className="w-6 h-6 rounded object-cover"
                                />
                              )}
                              <span className="text-sm text-gray-700">{item.nombre_producto}</span>
                              <span className="text-xs text-gray-500">x{item.cantidad}</span>
                            </div>
                          ))}
                          {(order.detalles?.length || 0) > 3 && (
                            <div className="flex items-center px-3 py-1 bg-gray-100 rounded-lg">
                              <span className="text-sm text-gray-600">+{(order.detalles?.length || 0) - 3} más</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => selectOrder(order)}
                          disabled={loadingDetails}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          <EyeIcon className="w-4 h-4" />
                          {loadingDetails ? 'Cargando...' : 'Ver Detalles'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            const StatusIcon = statusConfig.icon;
            return (
              <div
                key={order.id_orden}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Información del Pedido */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Orden #{order.id_orden}
                        </h3>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>Pedido: {new Date(order.fecha_creacion || order.fecha_orden || '').toLocaleDateString('es-CO')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{order.usuario?.nombre_completo || 'Cliente desconocido'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CurrencyDollarIcon className="w-4 h-4" />
                          <span className="font-medium">${order.total.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Productos */}
                      <div className="flex flex-wrap gap-2">
                        {order.detalles?.slice(0, 3).map((item) => (
                          <div key={item.id_detalle} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1">
                            {item.imagen_url && (
                              <img 
                                src={item.imagen_url} 
                                alt={item.nombre_producto}
                                className="w-6 h-6 rounded object-cover"
                              />
                            )}
                            <span className="text-sm text-gray-700">{item.nombre_producto}</span>
                            <span className="text-xs text-gray-500">x{item.cantidad}</span>
                          </div>
                        ))}
                        {(order.detalles?.length || 0) > 3 && (
                          <div className="flex items-center px-3 py-1 bg-gray-100 rounded-lg">
                            <span className="text-sm text-gray-600">+{(order.detalles?.length || 0) - 3} más</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => selectOrder(order)}
                        disabled={loadingDetails}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <EyeIcon className="w-4 h-4" />
                        {loadingDetails ? 'Cargando...' : 'Ver Detalles'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron pedidos</h3>
            <p className="text-gray-500">Intenta ajustar tus filtros de búsqueda</p>
          </div>
        )}

        {/* Modal de Detalles */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Detalles del Pedido #{selectedOrder.id_orden}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Timeline de Estado */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Estado del Pedido</h3>
                  <div className="flex items-center justify-between">
                    {getStatusSteps(getLatestStatus(selectedOrder)).map((step, index) => (
                      <div key={step.key} className="flex items-center flex-1">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                        }`}>
                          <CheckCircleIcon className="w-5 h-5" />
                        </div>
                        <div className="ml-2 flex-1">
                          <p className={`text-sm font-medium ${
                            step.completed ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </p>
                        </div>
                        {index < getStatusSteps(getLatestStatus(selectedOrder)).length - 1 && (
                          <div className={`flex-1 h-0.5 mx-2 ${
                            step.completed ? 'bg-green-500' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Historial de Seguimiento */}
                {selectedOrder.seguimiento && selectedOrder.seguimiento.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Historial de Seguimiento</h3>
                    <div className="space-y-3">
                      {selectedOrder.seguimiento.map((tracking) => {
                        const trackingStatusConfig = getStatusConfig(tracking.status);
                        // Si el status no es reconocido, usar un fallback
                        if (!trackingStatusConfig) {
                          return (
                            <div key={tracking.id} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-400">
                                  <ClockIcon className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900">Estado desconocido</span>
                                    <span className="text-sm text-gray-500">
                                      {new Date(tracking.fecha_hora).toLocaleString('es-CO')}
                                    </span>
                                  </div>
                                  {tracking.comentario && (
                                    <p className="text-sm text-gray-600 mb-1">{tracking.comentario}</p>
                                  )}
                                  {tracking.usuario?.nombre_completo && (
                                    <p className="text-xs text-gray-500">
                                      Actualizado por: {tracking.usuario.nombre_completo}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }
                        const TrackingIcon = trackingStatusConfig.icon;
                        return (
                          <div key={tracking.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${trackingStatusConfig.color}`}>
                                <TrackingIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900">{trackingStatusConfig.label}</span>
                                  <span className="text-sm text-gray-500">
                                    {new Date(tracking.fecha_hora).toLocaleString('es-CO')}
                                  </span>
                                </div>
                                {tracking.comentario && (
                                  <p className="text-sm text-gray-600 mb-1">{tracking.comentario}</p>
                                )}
                                {tracking.usuario?.nombre_completo && (
                                  <p className="text-xs text-gray-500">
                                    Actualizado por: {tracking.usuario.nombre_completo}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Información del Cliente */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Cliente</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Cliente:</span> {selectedOrder.usuario?.nombre_completo || 'No especificado'}</p>
                      <p><span className="font-medium">Dirección:</span> {user.direccion || 'No especificada'}</p>
                      <p><span className="font-medium">Teléfono:</span> {user.telefono || 'No especificado'}</p>
                      <p><span className="font-medium">Fecha del Pedido:</span> {new Date(selectedOrder.fecha_creacion || selectedOrder.fecha_orden || '').toLocaleDateString('es-CO')}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Resumen del Pedido</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Número de Pedido:</span> #{selectedOrder.id_orden}</p>
                      <p><span className="font-medium">Total de Productos:</span> {selectedOrder.detalles?.length || 0}</p>
                      <p><span className="font-medium">Método de Pago:</span> {(() => {
                        const pago = payments.find(p => p.id_orden === selectedOrder.id_orden);
                        return pago ? pago.metodo_pago : 'No especificado';
                      })()}</p>
                      <p><span className="font-medium">Total:</span> <span className="text-lg font-bold text-green-600">${selectedOrder.total.toLocaleString()}</span></p>
                    </div>
                  </div>
                </div>

                {/* Productos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Productos</h3>
                  <div className="space-y-3">
                    {selectedOrder.detalles?.map((item) => (
                      <div key={item.id_detalle} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        {item.imagen_url && (
                          <img 
                            src={item.imagen_url} 
                            alt={item.nombre_producto}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.nombre_producto}</h4>
                          <p className="text-sm text-gray-500">Cantidad: {item.cantidad}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${item.subtotal.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">${item.precio_unitario.toLocaleString()} c/u</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};