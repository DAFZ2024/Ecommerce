import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Badge, Spinner, Divider, Chip, Input } from '@heroui/react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';

interface Order {
  id_orden: number;
  fecha_orden?: string;
  fecha_creacion?: string;
  estado: string;
  total: number;
  direccion_envio: string;
  telefono_contacto: string;
  metodo_pago: string;
  detalles?: OrderDetail[];
}

interface OrderDetail {
  id_detalle: number;
  nombre_producto: string;
  cantidad: number; 
  precio_unitario: number;
  subtotal: number;
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

interface User {
  id: number;
  nombre?: string;
  nombre_completo?: string;
  correo: string;
  rol: string;
  direccion?: string;
  telefono?: string;
}

const ClientDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'payments'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [saving, setSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Función para obtener usuario del token - CORREGIDA
  const getUserFromToken = (): User | null => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No hay token');
        return null;
      }
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Payload del token:', payload); // Para debug
      
      return {
        id: payload.id_usuario,
        nombre: payload.nombre_completo || payload.nombre,
        correo: payload.correo,
        rol: payload.rol
      };
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  };

  // Efecto para verificar autenticación al montar el componente
  useEffect(() => {
    const checkAuth = () => {
      const userData = getUserFromToken();
      setUser(userData);
      setAuthChecked(true);
      
      if (userData) {
        console.log('Usuario autenticado:', userData);
      } else {
        console.log('Usuario no autenticado');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);
  
  // Inicializar datos editables
  useEffect(() => {
    if (user) {
      setEditedUser({
        nombre_completo: user.nombre_completo,
        direccion: user.direccion,
        telefono: user.telefono
      });
    }
  }, [user]);


   // Cargar datos del usuario
  useEffect(() => {
    if (authChecked && user) {
      fetchUserData();
    }
  }, [authChecked, user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Sesión expirada');
        setUser(null);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log(`Obteniendo datos para usuario ID: ${user.id}`);

      // Primero obtener los datos completos del usuario
      let userDetails = null;
      try {
        const userResponse = await fetch(`http://localhost:3001/api/usuarios/${user.id}`, {
          headers,
          method: 'GET'
        });
        
        if (userResponse.ok) {
          userDetails = await userResponse.json();
          console.log('Detalles del usuario:', userDetails);
          
          // Actualizar el estado del usuario con la información completa
          setUser(prev => ({
            ...prev,
            direccion: userDetails.direccion,
            telefono: userDetails.telefono
          }));
        }
      } catch (userError) {
        console.warn('No se pudieron obtener los detalles del usuario:', userError);
      }

      // Obtener órdenes
      const ordersResponse = await fetch(`http://localhost:3001/api/ordenes/usuario/${user.id}`, { 
        headers,
        method: 'GET'
      });
      
      if (!ordersResponse.ok) {
        const errorData = await ordersResponse.text();
        console.error('Error en órdenes:', errorData);
        throw new Error(`Error ${ordersResponse.status}: Error al obtener órdenes`);
      }
      
      const ordersData = await ordersResponse.json();
      console.log('Órdenes obtenidas (raw data):', ordersData);
      
      // Verificar y limpiar los datos de órdenes, usando datos del usuario si están disponibles
      const cleanedOrders = (ordersData || []).map((order: any) => ({
        ...order,
        total: parseFloat(order.total) || 0,
        // Usar dirección y teléfono del usuario si no están en la orden
        direccion_envio: order.direccion_envio || userDetails?.direccion || 'No especificada',
        telefono_contacto: order.telefono_contacto || userDetails?.telefono || 'No especificado',
        estado: order.estado || 'Sin estado',
        metodo_pago: order.metodo_pago || 'No especificado'
      }));
      
      console.log('Órdenes procesadas:', cleanedOrders);
      setOrders(cleanedOrders);

      // Obtener pagos del usuario
      try {
        const paymentsResponse = await fetch(`http://localhost:3001/api/pagos/usuario/${user.id}`, {
          headers,
          method: 'GET'
        });

        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json();
          console.log('Pagos obtenidos:', paymentsData);
          
          // Limpiar datos de pagos
          const cleanedPayments = (paymentsData || []).map((payment: any) => ({
            ...payment,
            monto: parseFloat(payment.monto) || 0
          }));
          
          setPayments(cleanedPayments);
        } else {
          console.warn('No se pudieron obtener los pagos');
          setPayments([]);
        }
      } catch (paymentError) {
        console.warn('Error obteniendo pagos:', paymentError);
        setPayments([]);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error(error.message || 'Error al cargar datos');
      
      // Si es error de autenticación, limpiar usuario
      if (error.message?.includes('401') || error.message?.includes('403')) {
        setUser(null);
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  };

  // funciones paar editar usuarios
   // Guardar cambios de perfil
  const saveUserChanges = async () => {
    if (!user || !editedUser) return;
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3001/api/usuarios/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre_completo: editedUser.nombre_completo,
          direccion: editedUser.direccion,
          telefono: editedUser.telefono
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(prev => ({ ...prev, ...updatedUser }));
        toast.success('Datos actualizados correctamente');
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error al actualizar datos');
      }
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      toast.error('Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  // Cambiar contraseña
  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3001//api/usuarios/cambiar-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contrasena_actual: currentPassword,
          nueva_contrasena: newPassword
        })
      });

      if (response.ok) {
        toast.success('Contraseña actualizada correctamente');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsChangingPassword(false);
        setPasswordError('');
      } else {
        const errorData = await response.json();
        setPasswordError(errorData.message || 'Error al cambiar contraseña');
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setPasswordError('Error al cambiar contraseña');
    } finally {
      setSaving(false);
    }
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };


  const fetchOrderDetails = async (orderId: number) => {
    try {
      setLoadingDetails(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3001/api/ordenes/${orderId}/detalles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const details = await response.json();
        const orderWithDetails = orders.find(order => order.id_orden === orderId);
        if (orderWithDetails) {
          setSelectedOrder({ ...orderWithDetails, detalles: details });
        }
      } else {
        toast.error('Error al cargar detalles de la orden');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Error al cargar detalles de la orden');
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatusColor = (status: string | undefined | null) => {
    if (!status) return 'default';
    
    switch (status.toLowerCase()) {
      case 'completado':
      case 'entregado':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'cancelado':
        return 'danger';
      case 'en_proceso':
        return 'primary';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha inválida';
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '$0';
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(numAmount);
  };

  // Función para calcular el total gastado
  const calculateTotalSpent = () => {
    const total = orders.reduce((sum, order) => {
      const orderTotal = parseFloat(order.total?.toString() || '0');
      return sum + (isNaN(orderTotal) ? 0 : orderTotal);
    }, 0);
    
    console.log('Total calculado:', total, 'desde órdenes:', orders.map(o => ({ id: o.id_orden, total: o.total })));
    return total;
  };

  // Mostrar loading mientras se verifica la autenticación
  if (!authChecked) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  // Mostrar mensaje de acceso denegado si no hay usuario
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody className="text-center py-8">
            <Icon icon="lucide:alert-circle" className="text-4xl text-warning mb-4 mx-auto" />
            <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
            <p className="text-gray-600">Debes iniciar sesión para acceder a tu dashboard.</p>
            <Button 
              color="primary" 
              className="mt-4"
              onPress={() => window.location.href = '/login'}
            >
              Ir a Login
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mi Dashboard</h1>
          <p className="text-gray-600">Bienvenido, {user.nombre || user.nombre_completo || user.correo}</p>
        </div>
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
          <p className="ml-4">Cargando tus datos...</p>
        </div>
      </div>
    );
  }

  return (
    
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Mi Dashboard</h1>
            
            {/* Sección de datos del usuario */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-3">Mi Perfil</h2>
                  {isEditing ? (
                    <div className="space-y-4">
                      <Input
                        label="Nombre Completo"
                        name="nombre_completo"
                        value={editedUser.nombre_completo || ''}
                        onChange={handleInputChange}
                        fullWidth
                      />
                      <Input
                        label="Dirección"
                        name="direccion"
                        value={editedUser.direccion || ''}
                        onChange={handleInputChange}
                        fullWidth
                      />
                      <Input
                        label="Teléfono"
                        name="telefono"
                        value={editedUser.telefono || ''}
                        onChange={handleInputChange}
                        fullWidth
                      />
                      <div className="flex gap-2 mt-4">
                        <Button 
                          color="primary" 
                          onPress={saveUserChanges}
                          isLoading={saving}
                        >
                          Guardar Cambios
                        </Button>
                        <Button 
                          color="default" 
                          variant="bordered"
                          onPress={() => setIsEditing(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <p><strong>Nombre:</strong> {user.nombre_completo || 'No especificado'}</p>
                        <p><strong>Correo:</strong> {user.correo}</p>
                        <p><strong>Dirección:</strong> {user.direccion || 'No especificada'}</p>
                        <p><strong>Teléfono:</strong> {user.telefono || 'No especificado'}</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm"
                          startContent={<Icon icon="lucide:edit" />}
                          onPress={() => setIsEditing(true)}
                        >
                          Editar perfil
                        </Button>
                        <Button 
                          size="sm"
                          variant="bordered"
                          startContent={<Icon icon="lucide:lock" />}
                          onPress={() => setIsChangingPassword(!isChangingPassword)}
                        >
                          {isChangingPassword ? 'Cancelar' : 'Cambiar contraseña'}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                </div>
              </div>
              
              {/* Formulario para cambiar contraseña */}
              {isChangingPassword && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Cambiar Contraseña</h3>
                  <div className="space-y-4 max-w-md">
                    <Input
                      type="password"
                      label="Contraseña Actual"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      fullWidth
                    />
                    <Input
                      type="password"
                      label="Nueva Contraseña"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      fullWidth
                    />
                    <Input
                      type="password"
                      label="Confirmar Contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      fullWidth
                    />
                    {passwordError && (
                      <p className="text-red-500 text-sm">{passwordError}</p>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        color="primary" 
                        onPress={changePassword}
                        isLoading={saving}
                      >
                        Cambiar Contraseña
                      </Button>
                      <Button 
                        variant="bordered"
                        onPress={() => {
                          setIsChangingPassword(false);
                          setPasswordError('');
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Icon icon="lucide:shopping-bag" className="text-2xl text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Órdenes</p>
              <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Icon icon="lucide:credit-card" className="text-2xl text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Pagos</p>
              <p className="text-2xl font-bold text-gray-800">{payments.length}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Icon icon="lucide:dollar-sign" className="text-2xl text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Gastado</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(calculateTotalSpent())}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <Button
          color={activeTab === 'orders' ? 'primary' : 'default'}
          variant={activeTab === 'orders' ? 'solid' : 'bordered'}
          onPress={() => setActiveTab('orders')}
          startContent={<Icon icon="lucide:package" />}
        >
          Mis Órdenes
        </Button>
        <Button
          color={activeTab === 'payments' ? 'primary' : 'default'}
          variant={activeTab === 'payments' ? 'solid' : 'bordered'}
          onPress={() => setActiveTab('payments')}
          startContent={<Icon icon="lucide:credit-card" />}
        >
          Mis Pagos
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'orders' ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Mis Órdenes</h2>
          {orders.length === 0 ? (
            <Card>
              <CardBody className="text-center py-8">
                <Icon icon="lucide:package-open" className="text-4xl text-gray-400 mb-4 mx-auto" />
                <p className="text-gray-600">No tienes órdenes registradas aún.</p>
              </CardBody>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id_orden} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Orden #{order.id_orden}</h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.fecha_orden || order.fecha_creacion)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Chip color={getStatusColor(order.estado)} variant="flat">
                      {order.estado || 'Sin estado'}
                    </Chip>
                    <p className="text-lg font-bold">{formatCurrency(order.total)}</p>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Dirección de envío:</p>
                      <p className="font-medium break-words">{order.direccion_envio}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Teléfono:</p>
                      <p className="font-medium">{order.telefono_contacto}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Método de pago:</p>
                      <p className="font-medium">{order.metodo_pago}</p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="bordered"
                    onPress={() => fetchOrderDetails(order.id_orden)}
                    isLoading={loadingDetails}
                    startContent={<Icon icon="lucide:eye" />}
                  >
                    Ver Detalles
                  </Button>

                  {selectedOrder?.id_orden === order.id_orden && selectedOrder.detalles && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold mb-3">Productos:</h4>
                      <div className="space-y-2">
                        {selectedOrder.detalles.map((detail) => (
                          <div key={detail.id_detalle} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <div>
                              <p className="font-medium">{detail.nombre_producto}</p>
                              <p className="text-sm text-gray-600">
                                Cantidad: {detail.cantidad} × {formatCurrency(detail.precio_unitario)}
                              </p>
                            </div>
                            <p className="font-semibold">{formatCurrency(detail.subtotal)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Mis Pagos</h2>
          {payments.length === 0 ? (
            <Card>
              <CardBody className="text-center py-8">
                <Icon icon="lucide:credit-card" className="text-4xl text-gray-400 mb-4 mx-auto" />
                <p className="text-gray-600">No tienes pagos registrados aún.</p>
              </CardBody>
            </Card>
          ) : (
            payments.map((payment) => (
              <Card key={payment.id_pago} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Pago #{payment.id_pago}</h3>
                    <p className="text-sm text-gray-600">Orden #{payment.id_orden}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Chip color={getStatusColor(payment.estado)} variant="flat">
                      {payment.estado || 'Sin estado'}
                    </Chip>
                    <p className="text-lg font-bold">{formatCurrency(payment.monto)}</p>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Fecha de pago:</p>
                      <p className="font-medium">{formatDate(payment.fecha_pago)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Método de pago:</p>
                      <p className="font-medium">{payment.metodo_pago}</p>
                    </div>
                    {payment.referencia_pago && (
                      <div>
                        <p className="text-sm text-gray-600">Referencia:</p>
                        <p className="font-medium text-xs break-all">{payment.referencia_pago}</p>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;