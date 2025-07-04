// src/pages/HistorialPedidos.tsx
import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { supabase } from "../lib/supabaseClient"; // Asegúrate de importar tu cliente de Supabase

export const HistorialPedidos = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        // Obtener historial de pedidos desde Supabase
        const { data, error } = await supabase
          .from('ordenes')
          .select('*')
          .order('fecha_creacion', { ascending: false });
        if (error) throw error;
        setPedidos(data || []);
        setError(null);
      } catch (error) {
        console.error("Error cargando pedidos:", error);
        setError("Error al cargar los pedidos. Intente nuevamente.");
        setPedidos([]);
      } finally {
        setLoading(false);
      }
    };
    
    cargarPedidos();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Historial de Pedidos</h1>
      
      {loading ? (
        <p>Cargando pedidos...</p>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
          <Button 
            variant="solid" 
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Reintentar
          </Button>
        </div>
      ) : pedidos.length === 0 ? (
        <p>No se encontraron pedidos</p>
      ) : (
        <div className="space-y-4">
          {pedidos.map(pedido => (
            <div key={pedido.id_orden} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Orden #{pedido.id_orden}</h2>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  pedido.estado === 'pagado' 
                    ? 'bg-green-100 text-green-800' 
                    : pedido.estado === 'pendiente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {pedido.estado}
                </span>
              </div>
              <p className="text-gray-600">
                Fecha: {new Date(pedido.fecha_creacion).toLocaleDateString()}
              </p>
              <p className="text-lg font-bold">
                Total: ${Number(pedido.total).toFixed(2)} {pedido.moneda || 'COP'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};