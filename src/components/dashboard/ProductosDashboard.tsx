import { AnimatePresence, motion } from "framer-motion";
import { Button, Card, CardFooter } from "@heroui/react";
import { Icon } from "@iconify/react";

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

type Categoria = {
  id_categoria: number;
  nombre_categoria: string;
};

type ProductoForm = {
  nombre: string;
  descripcion: string;
  precio: string;
  stock: string;
  puntuacion: string;
  imagen_url: string;
  id_categoria: string;
  en_oferta: boolean;
  descuento: string;
};

type Props = {
  productosFiltrados: Producto[];
  categorias: Categoria[];
  busqueda: string;
  setBusqueda: (v: string) => void;
  showProductoForm: boolean;
  editProductoId: number | null;
  productoForm: ProductoForm;
  imagenArchivo: File | null;
  subiendoImagen: boolean;
  handleAgregarProductoClick: () => void;
  handleEditarProductoClick: (id: number) => void;
  handleEliminarProductoClick: (id: number) => void;
  handleGuardarProducto: () => void;
  handleProductoFormChange: (field: string, value: any) => void;
  handleImagenChange: (file: File | null) => void;
  setShowProductoForm: (show: boolean) => void;
  setEditProductoId: (id: number | null) => void;
  setImagenArchivo: (file: File | null) => void;
};

const ProductosDashboard = ({
  productosFiltrados,
  categorias,
  busqueda,
  setBusqueda,
  showProductoForm,
  editProductoId,
  productoForm,
  imagenArchivo,
  subiendoImagen,
  handleAgregarProductoClick,
  handleEditarProductoClick,
  handleEliminarProductoClick,
  handleGuardarProducto,
  handleProductoFormChange,
  handleImagenChange,
  setShowProductoForm,
  setEditProductoId,
  setImagenArchivo,
}: Props) => (
  <div className="space-y-6">
      {/* Barra de búsqueda mejorada */}
      <div className="mb-6 relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon 
            icon="mdi:magnify" 
            className="text-gray-400 text-xl" 
          />
        </div>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
        />
      </div>
  
      {/* Botón con animación */}
      <div className="mb-6">
        <Button
          onClick={handleAgregarProductoClick}
          variant="solid"
          size="sm"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
        >
          <Icon icon="mdi:plus" className="text-lg" /> 
          Agregar Producto
        </Button>
      </div>
  
      {/* Formulario con animación de entrada/salida */}
      <AnimatePresence>
        {showProductoForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 p-5 border rounded-2xl bg-white shadow-lg overflow-hidden"
          >
            <h3 className="text-xl font-bold mb-5 text-gray-800">
              {editProductoId ? "✏️ Editar Producto" : "✨ Agregar Nuevo Producto"}
            </h3>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Campos del formulario */}
              {[
                { id: 'nombre', label: 'Nombre del Producto', type: 'text', placeholder: 'Nombre del producto' },
                { id: 'id_categoria', label: 'Categoría', type: 'select', options: categorias },
                { id: 'precio', label: 'Precio', type: 'number', placeholder: '0.00' },
                { id: 'stock', label: 'Stock', type: 'number', placeholder: '0' },
                { id: 'puntuacion', label: 'Puntuación', type: 'number', placeholder: '0.0' },
              ].map((field) => (
                <div key={field.id} className={field.id === 'descripcion' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    {field.label}
                  </label>
                  
                  {field.type === 'select' ? (
                    <select
                      value={(productoForm as any)[field.id] || ''}
                      onChange={(e) => handleProductoFormChange(field.id, e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue500 focus:border-transparent transition-colors"
                    >
                      <option value="">Seleccionar categoría</option>
                                         {field.options?.map((categoria) => (
                        <option key={categoria.id_categoria} value={categoria.id_categoria}>
                          {categoria.nombre_categoria}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={(productoForm as any)[field.id] || ''}
                      onChange={(e) => handleProductoFormChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      min={field.id === 'puntuacion' ? 0 : undefined}
                      max={field.id === 'puntuacion' ? 5 : undefined}
                      step={field.id === 'precio' || field.id === 'puntuacion' ? "0.01" : undefined}
                    />
                  )}
                </div>
              ))}
  
              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Descripción
                </label>
                <textarea
                  value={productoForm.descripcion}
                  onChange={(e) => handleProductoFormChange("descripcion", e.target.value)}
                  placeholder="Descripción del producto"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors min-h-[100px]"
                />
              </div>
  
              {/* Imagen */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Imagen
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Icon icon="mdi:cloud-upload" className="text-2xl text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500">
                        {imagenArchivo ? 'Cambiar imagen' : 'Subir imagen'}
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImagenChange(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  {imagenArchivo && (
                    <div className="relative">
                      <img 
                        src={URL.createObjectURL(imagenArchivo)} 
                        alt="Preview" 
                        className="w-24 h-24 object-contain rounded-lg border"
                      />
                      <button 
                        type="button"
                        onClick={() => setImagenArchivo(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <Icon icon="mdi:close" className="text-sm" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
  
              {/* Oferta */}
              <div className="flex items-center gap-4 md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={productoForm.en_oferta}
                      onChange={(e) => handleProductoFormChange("en_oferta", e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${productoForm.en_oferta ? 'bg-blue-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${productoForm.en_oferta ? 'transform translate-x-5' : ''}`}></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">En oferta</span>
                </label>
  
                {productoForm.en_oferta && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Descuento %:</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={productoForm.descuento}
                      onChange={(e) => handleProductoFormChange("descuento", e.target.value)}
                      placeholder="0"
                      className="px-3 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-20 transition-colors"
                    />
                  </div>
                )}
              </div>
            </div>
  
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={handleGuardarProducto} 
                disabled={subiendoImagen}
                className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {subiendoImagen ? (
                  <>
                    <Icon icon="mdi:loading" className="animate-spin" /> Subiendo imagen...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:content-save" /> Guardar
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowProductoForm(false);
                  setEditProductoId(null);
                }}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancelar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
  
      {/* Grid de productos con animaciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productosFiltrados.map((producto, index) => (
          <motion.div
            key={producto.id_producto}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex"
          >
            <Card className="border border-gray-200 p-3 flex flex-col w-full h-full rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group">
              <div className="relative h-48 bg-gray-50 flex items-center justify-center mb-3 overflow-hidden rounded-xl">
                <img
                  src={
                    producto.imagen_url.startsWith("http")
                      ? producto.imagen_url
                      : `http://localhost:3001${producto.imagen_url}`
                  }
                  alt={producto.nombre}
                  className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  {producto.en_oferta && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                      -{producto.descuento}%
                    </span>
                  )}
                  {/* Indicador de stock */}
                  <span className={`px-2 py-1 text-xs font-bold rounded-lg ${
                    producto.stock > 10 
                      ? 'bg-green-500 text-white' 
                      : producto.stock > 0 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    Stock: {producto.stock}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col flex-grow p-2">
                <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {producto.nombre}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                  {producto.descripcion}
                </p>
                
                <div className="flex justify-between items-center mt-auto mb-3">
                  <div className="flex gap-2">
                    <span className={`text-lg font-bold ${producto.en_oferta ? 'text-red-500' : 'text-green-600'}`}>
                      ${typeof producto.precio === 'number' ? producto.precio.toFixed(2) : producto.precio}
                    </span>
                    {producto.en_oferta && (
                      <span className="text-gray-400 text-sm line-through">
                        ${(producto.precio / (1 - producto.descuento / 100)).toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 text-amber-500">
                    <Icon icon="mdi:star" />
                    <span className="font-medium">{producto.puntuacion}</span>
                  </div>
                </div>
  
                {/* Información adicional del stock */}
                <div className="flex items-center gap-2 mb-3">
                  <Icon 
                    icon="mdi:package-variant" 
                    className={`text-sm ${
                      producto.stock > 10 
                        ? 'text-green-500' 
                        : producto.stock > 0 
                        ? 'text-orange-500' 
                        : 'text-red-500'
                    }`} 
                  />
                  <span className={`text-xs font-medium ${
                    producto.stock > 10 
                      ? 'text-green-600' 
                      : producto.stock > 0 
                      ? 'text-orange-600' 
                      : 'text-red-600'
                  }`}>
                    {producto.stock > 10 
                      ? `${producto.stock} disponibles` 
                      : producto.stock > 0 
                      ? `Solo ${producto.stock} disponibles` 
                      : 'Sin stock'}
                  </span>
                </div>
              </div>
              
              <CardFooter className="flex gap-3 p-0 pt-3 border-t border-gray-100 mt-auto">
                <Button
                  size="sm"
                  variant="bordered"
                  className="flex-1 border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                  onClick={() => handleEditarProductoClick(producto.id_producto)}
                >
                  <Icon icon="mdi:pencil" className="text-blue-600 mr-1" /> Editar
                </Button>
                <Button
                  onClick={() => handleEliminarProductoClick(producto.id_producto)}
                  className="bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  size="sm"
                >
                  <Icon icon="mdi:delete" className="mr-1" /> Eliminar
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
);

export default ProductosDashboard;