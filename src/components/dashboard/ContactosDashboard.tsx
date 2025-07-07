import { Card, CardBody, CardFooter, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import React from "react";

interface Contacto {
  id_contacto: number;
  nombre: string;
  correo: string;
  mensaje: string;
  fecha: string;
}

interface ContactosDashboardProps {
  contactosFiltrados: Contacto[];
  busquedaCorreo: string;
  setBusquedaCorreo: (correo: string) => void;
  handleEliminarContacto: (id_contacto: number) => void;
}

const ContactosDashboard: React.FC<ContactosDashboardProps> = ({
  contactosFiltrados,
  busquedaCorreo,
  setBusquedaCorreo,
  handleEliminarContacto,
}) => {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-slate-700 flex items-center gap-2">
        📬 Mensajes de Contacto
      </h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por correo..."
          value={busquedaCorreo}
          onChange={e => setBusquedaCorreo(e.target.value)}
          className="border border-slate-300 px-3 py-2 rounded w-full md:w-1/2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>
      <div className="space-y-6">
        {contactosFiltrados.map((contacto) => (
          <Card
            key={contacto.id_contacto}
            className="border border-slate-300 bg-slate-50 rounded-xl shadow-sm hover:shadow-md transition"
          >
            <CardBody className="p-5">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-slate-800">{contacto.nombre}</h3>
                  <span className="text-xs text-slate-500 italic">
                    {new Date(contacto.fecha).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{contacto.correo}</p>
                <div className="bg-white border border-slate-200 p-4 rounded-md text-slate-700 whitespace-pre-line text-sm shadow-inner">
                  {contacto.mensaje}
                </div>
              </div>
            </CardBody>
            <CardFooter className="flex justify-end p-4">
              <Button
                variant="solid"
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm shadow"
                onClick={() => handleEliminarContacto(contacto.id_contacto)}
              >
                <Icon icon="mdi:delete-outline" className="text-base" />
                Eliminar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContactosDashboard;
