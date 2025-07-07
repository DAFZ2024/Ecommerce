import React, { useMemo } from "react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

// Tipos de props
interface EstadisticasDashboardProps {
  ordenes: any[];
  productos: any[];
  categorias: any[];
  ordenDetalles: any[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

const EstadisticasDashboard: React.FC<EstadisticasDashboardProps> = ({
  ordenes,
  productos,
  categorias,
  ordenDetalles,
}) => {
  // Agregar console.log para debug
  console.log("📊 Datos recibidos:", {
    ordenes: ordenes.length,
    productos: productos.length,
    categorias: categorias.length,
    ordenDetalles: ordenDetalles.length,
  });

  // Calcular estadísticas con useMemo para eficiencia
  const estadisticas = useMemo(() => {
    // Ventas por mes (últimos 6 meses)
    const ventasPorMes: Array<{
      mes: string;
      ventas: number;
      ordenes: number;
    }> = [];
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
        (sum, orden) => sum + Number(orden.total || 0),
        0
      );

      ventasPorMes.push({
        mes: meses[mesActual],
        ventas: totalVentas,
        ordenes: ventasDelMes.length,
      });
    }

    // Productos más vendidos
    const ventasProductos: Record<
      number,
      { nombre: string; cantidad: number; ingresos: number }
    > = {};

    ordenDetalles.forEach((detalle) => {
      const orden = ordenes.find(
        (o) => o.id_orden === detalle.id_orden && o.estado === "pagado"
      );
      if (!orden) return;

      const producto = productos.find(
        (p) => p.id_producto === detalle.id_producto
      );
      if (!producto) return;

      const cantidad = Number(detalle.cantidad || 0);
      const precio = Number(detalle.precio_unitario || 0);

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
    const ventasPorCategoria: Record<
      number,
      { nombre: string; ventas: number; cantidad: number }
    > = {};

    categorias.forEach((categoria) => {
      ventasPorCategoria[categoria.id_categoria] = {
        nombre: categoria.nombre_categoria,
        ventas: 0,
        cantidad: 0,
      };
    });

    ordenDetalles.forEach((detalle) => {
      const orden = ordenes.find(
        (o) => o.id_orden === detalle.id_orden && o.estado === "pagado"
      );
      if (!orden) return;

      const producto = productos.find(
        (p) => p.id_producto === detalle.id_producto
      );
      if (!producto || !ventasPorCategoria[producto.id_categoria]) return;

      const cantidad = Number(detalle.cantidad || 0);
      const precio = Number(detalle.precio_unitario || 0);

      ventasPorCategoria[producto.id_categoria].ventas += cantidad * precio;
      ventasPorCategoria[producto.id_categoria].cantidad += cantidad;
    });

    const ventasCategoria = Object.values(ventasPorCategoria).filter(
      (cat) => cat.ventas > 0
    );

    // Resumen general
    const ordenesPagadas = ordenes.filter((orden) => orden.estado === "pagado");
    const totalVentas = ordenesPagadas.reduce(
      (sum, orden) => sum + Number(orden.total || 0),
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

    const resultado = {
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
    };

    console.log("📊 Estadísticas calculadas:", resultado);
    return resultado;
  }, [ordenes, productos, categorias, ordenDetalles]);

  return (
    <div className="p-6 space-y-8">
      <div className="animate-fade-in">
        <h2 className="text-3xl font-bold mb-6 text-slate-700 flex items-center gap-2">
          📊 Estadísticas de Rendimiento
        </h2>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Ventas</p>
                <p className="text-2xl font-bold">
                  ${estadisticas.resumenGeneral.totalVentas.toLocaleString()}
                </p>
              </div>
              <DollarSign className="text-green-200" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Órdenes</p>
                <p className="text-2xl font-bold">
                  {estadisticas.resumenGeneral.totalOrdenes}
                </p>
              </div>
              <ShoppingCart className="text-blue-200" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Promedio Orden</p>
                <p className="text-2xl font-bold">
                  ${estadisticas.resumenGeneral.promedioOrden.toFixed(0)}
                </p>
              </div>
              <TrendingUp className="text-purple-200" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Clientes Activos</p>
                <p className="text-2xl font-bold">
                  {estadisticas.resumenGeneral.clientesActivos}
                </p>
              </div>
              <Users className="text-orange-200" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm">Productos en Stock</p>
                <p className="text-2xl font-bold">
                  {estadisticas.resumenGeneral.productosEnStock}
                </p>
              </div>
              <Package className="text-teal-200" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm">Órdenes del Mes</p>
                <p className="text-2xl font-bold">
                  {estadisticas.resumenGeneral.ordenesDelMes}
                </p>
              </div>
              <TrendingUp className="text-pink-200" size={32} />
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ventas por mes */}
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <h3 className="text-xl font-semibold mb-4 text-slate-700 flex items-center gap-2">
              📈 Ventas por Mes
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={estadisticas.ventasPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `$${value.toLocaleString()}`,
                    "Ventas",
                  ]}
                />
                <Bar dataKey="ventas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Productos más vendidos */}
          <div className="p-6 bg-white shadow-lg rounded-xl">
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
          </div>

          {/* Ventas por categoría (Pie Chart) */}
          <div className="p-6 bg-white shadow-lg rounded-xl">
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
                  {estadisticas.ventasPorCategoria.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `$${value.toLocaleString()}`,
                    "Ventas",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Tendencia de órdenes */}
          <div className="p-6 bg-white shadow-lg rounded-xl">
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
          </div>
        </div>

        {/* Tabla de productos top */}
        <div className="p-6 bg-white shadow-lg rounded-xl">
          <h3 className="text-xl font-semibold mb-4 text-slate-700 flex items-center gap-2">
            💰 Top Productos por Ingresos
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 px-4 text-left">#</th>
                  <th className="py-2 px-4 text-left">Producto</th>
                  <th className="py-2 px-4 text-left">Cantidad</th>
                  <th className="py-2 px-4 text-left">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {estadisticas.productosMasVendidos.map((producto, index) => (
                  <tr
                    key={producto.nombre}
                    className="border-b border-slate-100"
                  >
                    <td className="py-2 px-4">{index + 1}</td>
                    <td className="py-2 px-4">{producto.nombre}</td>
                    <td className="py-2 px-4">{producto.cantidad}</td>
                    <td className="py-2 px-4">
                      ${producto.ingresos.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasDashboard;
