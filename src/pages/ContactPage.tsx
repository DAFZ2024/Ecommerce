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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
      const res = await axios.post("/api/contactos", formData);
      setSuccessMessage(res.data.message);
      setFormData({ nombre: "", correo: "", mensaje: "" });
    } catch (error) {
      setErrorMessage("Error al enviar el mensaje, intenta de nuevo.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    const phone = "573114996440"; // Número de la empresa
    const message = encodeURIComponent(
      "Hola, necesito más información sobre sus servicios."
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const contactInfo = [
    {
      icon: "heroicons:phone-20-solid",
      title: "Teléfono",
      value: "+57 (1) 234-5678",
      description: "Lunes a Viernes, 8:00 AM - 6:00 PM",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: "heroicons:envelope-20-solid",
      title: "Correo Electrónico",
      value: "contacto@empresa.com",
      description: "Respuesta en 24 horas",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      icon: "heroicons:map-pin-20-solid",
      title: "Ubicación",
      value: "Bogotá, Colombia",
      description: "Calle 123 #45-67, Zona Rosa",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      icon: "heroicons:clock-20-solid",
      title: "Horario de Atención",
      value: "Lun - Vie: 8:00 AM - 6:00 PM",
      description: "Sáb: 9:00 AM - 2:00 PM",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-content1 via-content1 to-default-50 min-h-screen">
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
            <Icon
              icon="heroicons:chat-bubble-left-right-20-solid"
              className="w-8 h-8 text-primary"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
            Contáctanos
          </h1>
          <p className="text-xl text-default-500 max-w-2xl mx-auto leading-relaxed">
            ¿Tienes preguntas o deseas más información? Estamos aquí para
            ayudarte. Conecta con nosotros y descubre cómo podemos colaborar
            juntos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information Cards */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-2xl font-bold text-default-800 mb-6">
              Información de Contacto
            </h3>

            {contactInfo.map((info, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardBody className="p-6">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 ${info.bgColor} rounded-xl flex items-center justify-center`}
                    >
                      <Icon
                        icon={info.icon}
                        className={`w-6 h-6 ${info.color}`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-default-800 mb-1">
                        {info.title}
                      </h4>
                      <p className={`font-medium ${info.color} mb-1`}>
                        {info.value}
                      </p>
                      <p className="text-sm text-default-500">
                        {info.description}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}

            {/* Social Media Section */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardBody className="p-6">
                <h4 className="font-semibold text-default-800 mb-4">
                  Síguenos en Redes Sociales
                </h4>
                <div className="flex space-x-4">
                  {[
                    {
                      icon: "ri:facebook-fill",
                      color: "text-blue-600 hover:text-blue-700",
                    },
                    {
                      icon: "ri:twitter-x-fill",
                      color: "text-gray-800 hover:text-gray-900",
                    },
                    {
                      icon: "ri:instagram-fill",
                      color: "text-pink-600 hover:text-pink-700",
                    },
                    {
                      icon: "ri:linkedin-fill",
                      color: "text-blue-800 hover:text-blue-900",
                    },
                  ].map((social, index) => (
                    <button
                      key={index}
                      className={`w-10 h-10 rounded-xl bg-white hover:bg-default-50 ${social.color} flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md`}
                    >
                      <Icon icon={social.icon} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardBody className="p-8 lg:p-12">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-default-800 mb-2">
                    Envíanos un Mensaje
                  </h3>
                  <p className="text-default-500">
                    Completa el formulario y nos pondremos en contacto contigo
                    lo antes posible.
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-default-700">
                        Nombre Completo
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          placeholder="Tu nombre completo"
                          className="w-full p-4 pl-12 border border-default-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-white/80"
                          required
                        />
                        <Icon
                          icon="heroicons:user-20-solid"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-default-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-default-700">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="correo"
                          value={formData.correo}
                          onChange={handleChange}
                          placeholder="tucorreo@example.com"
                          className="w-full p-4 pl-12 border border-default-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-white/80"
                          required
                        />
                        <Icon
                          icon="heroicons:envelope-20-solid"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-default-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-default-700">
                      Mensaje
                    </label>
                    <div className="relative">
                      <textarea
                        name="mensaje"
                        rows={6}
                        value={formData.mensaje}
                        onChange={handleChange}
                        placeholder="Escribe tu mensaje aquí. Cuéntanos en qué podemos ayudarte..."
                        className="w-full p-4 pl-12 border border-default-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-white/80 resize-none"
                        required
                      />
                      <Icon
                        icon="heroicons:chat-bubble-left-20-solid"
                        className="absolute left-4 top-4 w-5 h-5 text-default-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary-600 text-white font-semibold px-8 py-4 rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center space-x-3">
                        {loading ? (
                          <>
                            <Icon
                              icon="heroicons:arrow-path-20-solid"
                              className="w-5 h-5 animate-spin"
                            />
                            <span>Enviando...</span>
                          </>
                        ) : (
                          <>
                            <span>Enviar Mensaje</span>
                            <Icon
                              icon="heroicons:paper-airplane-20-solid"
                              className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
                            />
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </form>

                {/* Success/Error Messages */}
                {successMessage && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <Icon
                        icon="heroicons:check-circle-20-solid"
                        className="w-6 h-6 text-green-500"
                      />
                      <p className="text-green-700 font-medium">
                        {successMessage}
                      </p>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <Icon
                        icon="heroicons:exclamation-triangle-20-solid"
                        className="w-6 h-6 text-red-500"
                      />
                      <p className="text-red-700 font-medium">{errorMessage}</p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Additional Contact Options */}
        <div className="mt-16">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 via-transparent to-secondary/5">
            <CardBody className="p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-default-800 mb-4">
                  ¿Necesitas Ayuda Inmediata?
                </h3>
                <p className="text-default-600 mb-6 max-w-2xl mx-auto">
                  Para consultas urgentes o soporte técnico inmediato, no dudes
                  en contactarnos directamente.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="tel:+573114996440">
                    <button className="flex items-center justify-center space-x-3 bg-white hover:bg-default-50 text-default-800 font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-default-200">
                      <Icon
                        icon="heroicons:phone-20-solid"
                        className="w-5 h-5 text-blue-500"
                      />
                      <span>Llamar Ahora</span>
                    </button>
                  </a>

                  <button
                    onClick={handleWhatsAppClick}
                    className="flex items-center justify-center space-x-3 bg-white hover:bg-default-50 text-default-800 font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-default-200"
                  >
                    <Icon
                      icon="ri:whatsapp-fill"
                      className="w-5 h-5 text-green-500"
                    />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
};
