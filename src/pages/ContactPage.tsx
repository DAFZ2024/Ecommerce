import React, { useState } from "react";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    mensaje: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await axios.post("http://localhost:3001/api/contactos", formData);
      setSuccessMessage(res.data.message);
      setFormData({ nombre: "", correo: "", mensaje: "" });
    } catch (error) {
      setErrorMessage("Error al enviar el mensaje, intenta de nuevo.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 px-4 bg-content1">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">Contáctanos</h2>
        <p className="text-default-500 text-center mb-8">
          ¿Tienes preguntas o deseas más información? Estamos aquí para ayudarte.
        </p>

        <Card className="border border-default-200 shadow-md">
          <CardBody className="p-8">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-default-600 mb-1">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className="w-full p-3 border border-default-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-default-600 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="tucorreo@example.com"
                  className="w-full p-3 border border-default-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-default-600 mb-1">Mensaje</label>
                <textarea
                  name="mensaje"
                  rows={5}
                  value={formData.mensaje}
                  onChange={handleChange}
                  placeholder="Escribe tu mensaje aquí..."
                  className="w-full p-3 border border-default-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? "Enviando..." : "Enviar mensaje"}
                </button>
              </div>
            </form>

            {successMessage && (
              <p className="mt-4 text-green-600 font-semibold text-center">{successMessage}</p>
            )}
            {errorMessage && (
              <p className="mt-4 text-red-600 font-semibold text-center">{errorMessage}</p>
            )}
          </CardBody>
        </Card>

        {/* ... El resto de la sección de contacto con iconos */}
      </div>
    </section>
  );
};
