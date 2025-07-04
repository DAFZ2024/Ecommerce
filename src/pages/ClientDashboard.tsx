import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Spinner, Chip, Input } from '@heroui/react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

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
  id: string;
  nombre_completo?: string;
  correo: string;
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
  const [saving, setSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [editedUser, setEditedUser] = useState<Partial<User>>({
    nombre_completo: '',
    direccion: '',
    telefono: ''
  });

  // Verificar autenticación con Supabase
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error obteniendo sesión:', error);
          setAuthChecked(true);
          setLoading(false);
          return;
        }

        if (session?.user) {
          // Obtener datos adicionales del usuario desde la tabla usuarios
          const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id_usuario', session.user.id)
            .single();

          if (userError) {
            console.error('Error obteniendo datos del usuario:', userError);
            
            // Si no existe en la tabla usuarios, crear el registro
            if (userError.code === 'PGRST116') { // No rows returned
              const { data: newUserData, error: insertError } = await supabase
                .from('usuarios')
                .insert({
                  id_usuario: session.user.id,
                  nombre_completo: session.user.user_metadata?.nombre_completo || '',
                  correo: session.user.email || '',
                  direccion: '',
                  telefono: '',
                  rol: 'cliente'
                })
                .select()
                .single();

              if (insertError) {
                console.error('Error creando usuario:', insertError);
                // Usar solo los datos de auth si no se puede crear
                setUser({
                  id: session.user.id,
                  correo: session.user.email || '',
                  nombre_completo: session.user.user_metadata?.nombre_completo || '',
                  direccion: '',
                  telefono: ''
                });
              } else {
                setUser({
                  id: newUserData.id_usuario,
                  correo: newUserData.correo || session.user.email || '',
                  nombre_completo: newUserData.nombre_completo || '',
                  direccion: newUserData.direccion || '',
                  telefono: newUserData.telefono || ''
                });
              }
            } else {
              // Otro tipo de error, usar datos de auth
              setUser({
                id: session.user.id,
                correo: session.user.email || '',
                nombre_completo: session.user.user_metadata?.nombre_completo || '',
                direccion: '',
                telefono: ''
              });
            }
          } else {
            setUser({
              id: userData.id_usuario,
              correo: userData.correo || session.user.email || '',
              nombre_completo: userData.nombre_completo || '',
              direccion: userData.direccion || '',
              telefono: userData.telefono || ''
            });
          }
        }
        
        setAuthChecked(true);
      } catch (error) {
        console.error('Error en verificación de sesión:', error);
        setAuthChecked(true);
        setLoading(false);
      }
    };

    getSession();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setOrders([]);
        setPayments([]);
      } else if (session?.user) {
        // Obtener datos del usuario cuando cambie la sesión
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id_usuario', session.user.id)
          .single();

        if (userError) {
          // Si no existe, crear el registro
          if (userError.code === 'PGRST116') {
            const { data: newUserData, error: insertError } = await supabase
              .from('usuarios')
              .insert({
                id_usuario: session.user.id,
                nombre_completo: session.user.user_metadata?.nombre_completo || '',
                correo: session.user.email || '',
                direccion: '',
                telefono: '',
                rol: 'cliente'
              })
              .select()
              .single();

            if (!insertError && newUserData) {
              setUser({
                id: newUserData.id_usuario,
                correo: newUserData.correo || session.user.email || '',
                nombre_completo: newUserData.nombre_completo || '',
                direccion: newUserData.direccion || '',
                telefono: newUserData.telefono || ''
              });
            }
          }
        } else if (userData) {
          setUser({
            id: userData.id_usuario,
            correo: userData.correo || session.user.email || '',
            nombre_completo: userData.nombre_completo || '',
            direccion: userData.direccion || '',
            telefono: userData.telefono || ''
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (user) {
      setEditedUser({
        nombre_completo: user.nombre_completo || '',
        direccion: user.direccion || '',
        telefono: user.telefono || ''
      });
    }
  }, [user]);

  // Cargar datos cuando el usuario está autenticado
  useEffect(() => {
    if (authChecked && user) {
      fetchUserData();
    } else if (authChecked && !user) {
      setLoading(false);
    }
  }, [authChecked, user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Obtener órdenes desde Supabase
      const { data: ordersData, error: ordersError } = await supabase
        .from('ordenes')
        .select(`
          *,
          orden_detalle (
            id_detalle,
            cantidad,
            precio_unitario,
            id_producto
          )
        `)
        .eq('id_usuario', user.id)
        .order('fecha_creacion', { ascending: false });

      if (ordersError) {
        console.error('Error obteniendo órdenes:', ordersError);
        toast.error('Error al cargar órdenes');
        setOrders([]);
      } else {
        const cleanedOrders = (ordersData || []).map((order: any) => ({
          ...order,
          total: parseFloat(order.total) || 0,
          direccion_envio: order.direccion_envio || user.direccion || 'No especificada',
          telefono_contacto: order.telefono_contacto || user.telefono || 'No especificado',
          estado: order.estado || 'Sin estado',
          metodo_pago: order.metodo_pago || 'No especificado',
          detalles: order.detalles_orden?.map((detalle: any) => ({
            id_detalle: detalle.id_detalle,
            nombre_producto: detalle.productos?.nombre_producto || 'Producto desconocido',
            cantidad: detalle.cantidad,
            precio_unitario: detalle.precio_unitario,
            subtotal: detalle.subtotal
          })) || []
        }));
        
        setOrders(cleanedOrders);
      }

      // Obtener pagos desde Supabase
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('pagos')
        .select('*')
        .eq('id_usuario', user.id)
        .order('fecha_pago', { ascending: false });

      if (paymentsError) {
        console.error('Error obteniendo pagos:', paymentsError);
        setPayments([]);
      } else {
        const cleanedPayments = (paymentsData || []).map((payment: any) => ({
          ...payment,
          monto: parseFloat(payment.monto) || 0,
          estado_pago: payment.estado // <-- agrega esto si tu UI espera estado_pago
        }));
        setPayments(cleanedPayments);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };





  // Función para guardar cambios del usuario
  const saveUserChanges = async () => {
    if (!user || !editedUser) return;
    
    try {
      setSaving(true);
      
      // Actualizar en la tabla usuarios de Supabase
      const { error } = await supabase
        .from('usuarios')
        .update({
          nombre_completo: editedUser.nombre_completo,
          direccion: editedUser.direccion,
          telefono: editedUser.telefono
        })
        .eq('id_usuario', user.id);

      if (error) {
        console.error('Error actualizando usuario:', error);
        toast.error('Error al actualizar datos');
        return;
      }

      // Actualizar el estado local
      setUser(prev => prev ? {
        ...prev,
        ...editedUser
      } : null);
      
      toast.success('Datos actualizados correctamente');
      setIsEditing(false);
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      toast.error('Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  // Cambiar contraseña usando Supabase Auth
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
      
      // Usar Supabase Auth para cambiar contraseña
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Error cambiando contraseña:', error);
        setPasswordError(error.message || 'Error al cambiar contraseña');
        return;
      }

      toast.success('Contraseña actualizada correctamente');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      setPasswordError('');
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setPasswordError('Error de conexión al cambiar contraseña');
    } finally {
      setSaving(false);
    }
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  // Función de logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error en logout:', error);
        toast.error('Error al cerrar sesión');
        return;
      }
      
      // Limpiar estados locales
      setUser(null);
      setOrders([]);
      setPayments([]);
      setAuthChecked(false);
      
      toast.success('Sesión cerrada correctamente');
      
      // Redirigir al login después de un breve delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (error) {
      console.error('Error en logout:', error);
      toast.error('Error al cerrar sesión');
    }
  };


  const fetchOrderDetails = async (orderId: number) => {
    try {
      setLoadingDetails(true);
      // Obtener detalles de la orden desde Supabase con join a productos
      const { data: orderDetails, error } = await supabase
        .from('orden_detalle')
        .select('id_detalle, cantidad, precio_unitario, id_producto, productos(nombre)')
        .eq('id_orden', orderId);

      if (error) {
        console.error('Error obteniendo detalles:', error);
        toast.error('Error al cargar detalles de la orden');
        return;
      }

      const orderWithDetails = orders.find(order => order.id_orden === orderId);
      if (orderWithDetails) {
        const details = orderDetails.map((detalle: any) => ({
          id_detalle: detalle.id_detalle,
          nombre_producto: detalle.productos?.nombre || 'Producto desconocido',
          cantidad: detalle.cantidad,
          precio_unitario: detalle.precio_unitario,
          subtotal: detalle.cantidad * detalle.precio_unitario
        }));
        setSelectedOrder({ ...orderWithDetails, detalles: details });
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

  const formatDate = (dateString?: string) => {
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
              onPress={() => window.location.href = '/auth'}
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
          <p className="text-gray-600">Bienvenido, {user.nombre_completo || user.correo}</p>
        </div>
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
          <p className="ml-4">Cargando tus datos...</p>
        </div>
      </div>
    );
  }

 return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div className="w-full">
              {/* Header con gradiente */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
                <h1 className="text-4xl font-bold mb-2">Mi Dashboard</h1>
                <p className="text-indigo-100 text-lg">Gestiona tu información personal de forma segura</p>
              </div>
              
              {/* Sección de datos del usuario con diseño mejorado */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar mejorado */}
                      <div className="relative">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xl">
                            {user.nombre_completo ? user.nombre_completo.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-5 h-5 border-2 border-white"></div>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">Mi Perfil</h2>
                        <p className="text-gray-600">Información personal y configuración</p>
                      </div>
                    </div>
                    
                    {/* Status badge */}
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Activo
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  {isEditing ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700 flex items-center">
                            <Icon icon="lucide:user" className="w-4 h-4 mr-2 text-indigo-600" />
                            Nombre Completo
                          </label>
                          <Input
                            name="nombre_completo"
                            value={editedUser.nombre_completo|| ''}
                            onChange={handleInputChange}
                            className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                            fullWidth
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700 flex items-center">
                            <Icon icon="lucide:phone" className="w-4 h-4 mr-2 text-indigo-600" />
                            Teléfono
                          </label>
                          <Input
                            name="telefono"
                            value={editedUser.telefono || ''}
                            onChange={handleInputChange}
                            className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                            fullWidth
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <Icon icon="lucide:map-pin" className="w-4 h-4 mr-2 text-indigo-600" />
                          Dirección
                        </label>
                        <Input
                          name="direccion"
                          value={editedUser.direccion || ''}
                          onChange={handleInputChange}
                          className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                          fullWidth
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <Button 
                          color="primary" 
                          onPress={saveUserChanges}
                          isLoading={saving}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg font-semibold px-8"
                          startContent={<Icon icon="lucide:save" />}
                        >
                          Guardar Cambios
                        </Button>
                        <Button 
                          color="default" 
                          variant="bordered"
                          onPress={() => setIsEditing(false)}
                          className="border-gray-300 hover:bg-gray-50 font-semibold px-6"
                          startContent={<Icon icon="lucide:x" />}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="group">
                            <div className="flex items-center mb-2">
                              <Icon icon="lucide:user" className="w-5 h-5 mr-3 text-indigo-600" />
                              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Nombre</span>
                            </div>
                            <p className="text-lg text-gray-800 font-medium pl-8">
                              {user.nombre_completo || 'No especificado'}
                            </p>
                          </div>
                          
                          <div className="group">
                            <div className="flex items-center mb-2">
                              <Icon icon="lucide:mail" className="w-5 h-5 mr-3 text-indigo-600" />
                              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Correo</span>
                            </div>
                            <p className="text-lg text-gray-800 font-medium pl-8">
                              {user.correo}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="group">
                            <div className="flex items-center mb-2">
                              <Icon icon="lucide:map-pin" className="w-5 h-5 mr-3 text-indigo-600" />
                              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Dirección</span>
                            </div>
                            <p className="text-lg text-gray-800 font-medium pl-8">
                              {user.direccion || 'No especificada'}
                            </p>
                          </div>
                          
                          <div className="group">
                            <div className="flex items-center mb-2">
                              <Icon icon="lucide:phone" className="w-5 h-5 mr-3 text-indigo-600" />
                              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Teléfono</span>
                            </div>
                            <p className="text-lg text-gray-800 font-medium pl-8">
                              {user.telefono || 'No especificado'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                        <Button 
                          size="md"
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg font-semibold px-6 transition-all duration-200"
                          startContent={<Icon icon="lucide:edit" />}
                          onPress={() => setIsEditing(true)}
                        >
                          Editar perfil
                        </Button>
                        <Button 
                          size="md"
                          variant="bordered"
                          className="border-gray-300 hover:bg-gray-50 font-semibold px-6 transition-all duration-200"
                          startContent={<Icon icon="lucide:lock" />}
                          onPress={() => setIsChangingPassword(!isChangingPassword)}
                        >
                          {isChangingPassword ? 'Cancelar' : 'Cambiar contraseña'}
                        </Button>
                        <Button 
                          size="md"
                          variant="bordered"
                          color="danger"
                          className="border-red-300 hover:bg-red-50 font-semibold px-6 transition-all duration-200"
                          startContent={<Icon icon="lucide:log-out" />}
                          onPress={handleLogout}
                        >
                          Cerrar sesión
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Formulario para cambiar contraseña con diseño mejorado */}
                {isChangingPassword && (
                  <div className="border-t border-gray-200 bg-gray-50/50 p-8">
                    <div className="max-w-2xl">
                      <div className="flex items-center mb-6">
                        <div className="bg-indigo-100 rounded-full p-3 mr-4">
                          <Icon icon="lucide:shield-check" className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">Cambiar Contraseña</h3>
                          <p className="text-gray-600">Actualiza tu contraseña para mantener tu cuenta segura</p>
                          <p className="text-sm text-blue-600 mt-2">
                            <Icon icon="lucide:info" className="w-4 h-4 inline mr-1" />
                            Se enviará un email de confirmación para verificar el cambio
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                            <Icon icon="lucide:lock" className="w-4 h-4 mr-2 text-indigo-600" />
                            Nueva Contraseña
                          </label>
                          <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                            fullWidth
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                            <Icon icon="lucide:check-circle" className="w-4 h-4 mr-2 text-indigo-600" />
                            Confirmar Contraseña
                          </label>
                          <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                            fullWidth
                          />
                        </div>
                      </div>
                      
                      {passwordError && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center">
                            <Icon icon="lucide:alert-circle" className="w-5 h-5 text-red-600 mr-2" />
                            <p className="text-red-700 font-medium">{passwordError}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-3 mt-6">
                        <Button 
                          color="primary" 
                          onPress={changePassword}
                          isLoading={saving}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg font-semibold px-8"
                          startContent={<Icon icon="lucide:shield-check" />}
                        >
                          Cambiar Contraseña
                        </Button>
                        <Button 
                          variant="bordered"
                          onPress={() => {
                            setIsChangingPassword(false);
                            setPasswordError('');
                          }}
                          className="border-gray-300 hover:bg-gray-50 font-semibold px-6"
                          startContent={<Icon icon="lucide:x" />}
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

        {/* Stats Cards - AHORA DENTRO DEL CONTENEDOR PRINCIPAL */}
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
                      <Chip color={getStatusColor(payment.estado_pago)} variant="flat">
                        {payment.estado_pago || 'Sin estado'}
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
    </div>
  );
};
export default ClientDashboard;