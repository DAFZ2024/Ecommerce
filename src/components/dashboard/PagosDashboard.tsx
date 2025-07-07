import { Card, CardBody, CardFooter, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import Swal from 'sweetalert2';
import { supabase } from '../../lib/supabaseClient';

interface Pago {
  id_pago: number;
  id_orden: number;
  id_usuario: string;
  fecha_pago: string;
  fecha_actualizacion: string;
  metodo_pago: string;
  numero_tarjeta: string;
  estado: string;
  monto?: number;
  id_transaccion?: string;
  fecha_procesamiento?: string;
  firma?: string;
}

interface Orden {
  id_orden: number;
  id_usuario: string;
}

interface Usuario {
  id_usuario: string;
  nombre_completo: string;
}

interface PagosDashboardProps {
  pagosFiltrados: Pago[];
  ordenes: Orden[];
  usuarios: Usuario[];
  busquedaPagoUsuario: string;
  setBusquedaPagoUsuario: (v: string) => void;
}

const PagosDashboard: React.FC<PagosDashboardProps> = ({
  pagosFiltrados,
  ordenes,
  usuarios,
  busquedaPagoUsuario,
  setBusquedaPagoUsuario,
}) => {
  // Si no se pasa la función como prop, la definimos aquí
  const eliminarPago = async (id_pago: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el pago permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from('pagos')
          .delete()
          .eq('id_pago', id_pago);
        if (error) throw error;
        await Swal.fire('¡Eliminado!', 'El pago ha sido eliminado con éxito.', 'success');
        window.location.reload(); // Recarga la página para actualizar la lista
      } catch (error) {
        console.error('❌ Error al eliminar pago:', error);
        Swal.fire('Error', 'Hubo un problema al eliminar el pago.', 'error');
      }
    }
  };

  return (
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
          const orden = ordenes.find((o) => o.id_orden === pago.id_orden);
          const usuario = orden ? usuarios.find((u) => u.id_usuario === orden.id_usuario) : null;
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
                          pago.estado === 'completado' || pago.estado === 'pagado' || pago.estado === 'aprobado' ? 'text-green-600' :
                          pago.estado === 'pendiente' ? 'text-yellow-600' :
                          (pago.estado === 'cancelado' || pago.estado === 'rechazado' || pago.estado === 'fallido' || pago.estado === 'error') ? 'text-red-600' :
                          'text-gray-600'
                        }>
                          {pago.estado === 'completado' || pago.estado === 'pagado' || pago.estado === 'aprobado'
                            ? 'Completado'
                            : pago.estado === 'pendiente'
                              ? 'Pendiente'
                              : (pago.estado === 'cancelado' || pago.estado === 'rechazado' || pago.estado === 'fallido' || pago.estado === 'error')
                                ? 'Fallido'
                                : pago.estado}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Monto: </span>
                        <span>{pago.monto !== undefined ? `$${pago.monto}` : ''}</span>
                      </div>
                      <div>
                        <span className="font-medium">ID Transacción: </span>
                        <span className="font-mono">{pago.id_transaccion || ''}</span>
                      </div>
                      <div>
                        <span className="font-medium">Fecha Procesamiento: </span>
                        <span>{pago.fecha_procesamiento || ''}</span>
                      </div>
                      <div>
                        <span className="font-medium">Firma: </span>
                        <span className="font-mono truncate max-w-xs inline-block">{pago.firma || ''}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
              <CardFooter className="flex justify-end p-4">
                <Button
                  variant="solid"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm shadow"
                  onClick={() => eliminarPago(pago.id_pago)}
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
};

export default PagosDashboard;
