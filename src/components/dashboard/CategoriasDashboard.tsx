import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Card } from "@heroui/react";

type Categoria = {
  id_categoria: number;
  nombre_categoria: string;
  imagen_url?: string;
};

type Props = {
  categorias: Categoria[];
  showCategoriaForm: boolean;
  editCategoriaId: number | null;
  nombreCategoria: string;
  setNombreCategoria: (nombre: string) => void; // <-- Agrega esto
  imagenCategoriaArchivo: File | null;
  imagenCategoriaPreview: string;
  handleAgregarCategoriaClick: () => void;
  handleEditarCategoriaClick: (id: number) => void;
  handleEliminarCategoriaClick: (id: number) => void;
  handleGuardarCategoria: () => void;
  handleImagenCategoriaChange: (file: File | null) => void;
  setShowCategoriaForm: (show: boolean) => void;
  setEditCategoriaId: (id: number | null) => void;
  setImagenCategoriaArchivo: (file: File | null) => void;
  setImagenCategoriaPreview: (url: string) => void;
  categoriaIcons: any[];
};

const CategoriasDashboard = ({
  categorias,
  showCategoriaForm,
  editCategoriaId,
  nombreCategoria,
  setNombreCategoria, // <-- Agrega esto
  imagenCategoriaArchivo,
  imagenCategoriaPreview,
  handleAgregarCategoriaClick,
  handleEditarCategoriaClick,
  handleEliminarCategoriaClick,
  handleGuardarCategoria,
  handleImagenCategoriaChange,
  setShowCategoriaForm,
  setEditCategoriaId,
  setImagenCategoriaArchivo,
  setImagenCategoriaPreview,
  categoriaIcons,
}: Props) => (
  <div className="p-6 max-w-7xl mx-auto">
    <div className="mb-8 flex justify-between items-center">
      <h2 className="text-2xl font-bold text-slate-800">Gestión de Categorías</h2>
      <Button
        onClick={handleAgregarCategoriaClick}
        variant="solid"
        size="sm"
        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
      >
        <Icon icon="mdi:plus" className="text-lg" />
        Agregar Categoría
      </Button>
    </div>

    <AnimatePresence>
      {showCategoriaForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", damping: 25 }}
          className="mb-8 max-w-md bg-white p-6 rounded-xl shadow-lg border border-slate-100"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {editCategoriaId ? "Editar Categoría" : "Nueva Categoría"}
          </h3>
          <input
            type="text"
            value={nombreCategoria}
            onChange={(e) => setNombreCategoria(e.target.value)} // <-- Usa la función aquí
            placeholder="Nombre de la categoría"
            className="border border-slate-200 px-4 py-2.5 rounded-lg w-full text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
          />
          {/* Input para imagen de categoría */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2 text-gray-700">Imagen de la categoría</label>
            <div className="flex items-center gap-4">
              <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Icon icon="mdi:cloud-upload" className="text-2xl text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500">
                    {imagenCategoriaArchivo ? 'Cambiar imagen' : 'Subir imagen'}
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImagenCategoriaChange(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              {(imagenCategoriaPreview || (editCategoriaId && categorias.find(c => c.id_categoria === editCategoriaId)?.imagen_url)) && (
                <div className="relative">
                  <img
                    src={imagenCategoriaPreview || categorias.find(c => c.id_categoria === editCategoriaId)?.imagen_url}
                    alt="Preview"
                    className="w-24 h-24 object-contain rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => { setImagenCategoriaArchivo(null); setImagenCategoriaPreview(""); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <Icon icon="mdi:close" className="text-sm" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <Button
              onClick={() => {
                setShowCategoriaForm(false);
                setEditCategoriaId(null);
                setImagenCategoriaArchivo(null);
                setImagenCategoriaPreview("");
              }}
              variant="bordered"
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGuardarCategoria}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow hover:shadow-md transition-all"
            >
              <Icon icon="mdi:content-save" className="text-lg" />
              Guardar
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
      <AnimatePresence>
        {categorias.map((categoria) => {
          const iconData = categoriaIcons.find((c) => c.id_categoria === categoria.id_categoria);

          return (
            <motion.div
              key={categoria.id_categoria}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, type: "spring" }}
              whileHover={{ y: -5 }}
            >
              <Card className="flex flex-col items-center p-6 cursor-default border border-slate-100 rounded-xl bg-white hover:shadow-lg transition-all duration-300 group">
                {categoria.imagen_url ? (
                  <img src={categoria.imagen_url} alt={categoria.nombre_categoria} className="w-16 h-16 object-contain rounded-2xl mb-5 border" />
                ) : iconData ? (
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${iconData.bgColor} mb-5 shadow-inner group-hover:shadow-md transition`}>
                    <Icon icon={iconData.icon} className={`text-3xl ${iconData.color} transition-transform group-hover:scale-110`} />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-5 text-2xl font-bold group-hover:bg-slate-200 transition">
                    ?
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-800 mb-1 line-clamp-2">
                    {categoria.nombre_categoria}
                  </h3>
                  <span className="text-xs text-slate-500">ID: {categoria.id_categoria}</span>
                </div>

                <div className="flex gap-2 mt-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="sm"
                    variant="bordered"
                    onClick={() => handleEditarCategoriaClick(categoria.id_categoria)}
                    className="w-10 h-10 p-2 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all rounded-xl"
                    title="Editar categoría"
                  >
                    <Icon icon="mdi:pencil" className="text-lg" />
                  </Button>
                  <Button
                    size="sm"
                    variant="bordered"
                    onClick={() => handleEliminarCategoriaClick(categoria.id_categoria)}
                    className="w-10 h-10 p-2 flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all rounded-xl"
                    title="Eliminar categoría"
                  >
                    <Icon icon="mdi:delete" className="text-lg" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  </div>
);

export default CategoriasDashboard;