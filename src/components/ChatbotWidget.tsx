import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Card, CardBody, Avatar } from '@heroui/react';
import { Icon } from '@iconify/react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

interface ProductBot {
  id_producto: number;
  nombre: string;
  precio: number;
  imagen_url?: string;
}

type ChatMessage = Message | { id: string; type: 'products'; products: ProductBot[]; timestamp: Date; };

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Respuestas predefinidas del chatbot
  const botResponses = {
    greeting: [
      "¡Hola! 👋 Soy el asistente virtual de AutoPartesBogota. ¿En qué puedo ayudarte hoy?",
      "¡Bienvenido! 🚗 Estoy aquí para ayudarte con tus consultas sobre autopartes. ¿Qué necesitas?",
      "¡Hola! Soy tu asistente para autopartes. ¿Buscas algún repuesto en particular?"
    ],
    products: [
      "Tenemos una amplia variedad de autopartes para diferentes marcas y modelos. ¿Qué tipo de repuesto necesitas? 🔧",
      "Contamos con frenos, filtros, aceites, baterías, llantas y mucho más. ¿Para qué vehículo necesitas el repuesto? 🚙",
      "Nuestro catálogo incluye repuestos originales y alternativos. ¿Me puedes decir la marca y modelo de tu vehículo? 🔍"
    ],
    offers: [
      "¡Tenemos ofertas especiales! Visita nuestra sección de ofertas para ver descuentos de hasta 50% en productos seleccionados. 🎉",
      "Actualmente tenemos promociones en frenos, filtros y aceites. ¿Te interesa alguna categoría en particular? 💰",
      "¡No te pierdas nuestras ofertas! Hay descuentos especiales que cambian semanalmente. 🔥"
    ],
    delivery: [
      "Hacemos entregas en toda Bogotá y alrededores. El tiempo de entrega es de 1-3 días hábiles. 🚚",
      "Tenemos servicio de domicilio sin costo adicional en compras superiores a $100.000. 📦",
      "También puedes recoger tu pedido en nuestros puntos de venta. ¿Prefieres entrega a domicilio? 🏪"
    ],
    payment: [
      "Aceptamos efectivo, tarjetas de crédito/débito, transferencias bancarias y pagos en línea. 💳",
      "Puedes pagar contra entrega o por adelantado. ¿Cuál prefieres? 💰",
      "Ofrecemos facilidades de pago para compras mayores. ¿Te interesa conocer más? 🏦"
    ],
    contact: [
      "Puedes contactarnos por WhatsApp, teléfono o visitarnos en nuestras tiendas físicas. 📞",
      "Nuestro equipo de atención al cliente está disponible de lunes a sábado de 8 AM a 6 PM. ⏰",
      "¿Prefieres que te contacte un asesor especializado? 👨‍💼"
    ],
    help: [
      "Puedo ayudarte con: buscar productos, información sobre ofertas, métodos de pago, entregas y contacto. ¿Qué necesitas? 🤔",
      "Estoy aquí para resolver tus dudas sobre autopartes, precios, disponibilidad y más. ¡Pregúntame! 💬",
      "¿Necesitas ayuda para encontrar un repuesto específico? Puedo guiarte en tu búsqueda. 🎯"
    ],
    frenos: [
      "Tenemos frenos para una gran variedad de vehículos. ¿Para qué marca y modelo necesitas los frenos? 🛑",
      "Ofrecemos frenos originales y alternativos. ¿Te gustaría ver nuestras ofertas en frenos?",
      "¿Buscas frenos delanteros, traseros o ambos? ¡Puedo ayudarte a encontrarlos!"
    ],
    baterias: [
      "Contamos con baterías de diferentes capacidades y marcas. ¿Para qué vehículo necesitas la batería? 🔋",
      "¿Buscas una batería libre de mantenimiento o convencional? ¡Te ayudo a elegir la mejor opción!",
      "Tenemos baterías con garantía y entrega a domicilio. ¿Te gustaría ver opciones?"
    ],
    aceites: [
      "Tenemos aceites para motor, caja y transmisión de las mejores marcas. ¿Qué tipo de aceite buscas? 🛢️",
      "¿Prefieres aceite sintético, semisintético o mineral? Puedo mostrarte las opciones disponibles.",
      "Ofrecemos aceites recomendados para cada tipo de motor. ¿Me indicas la marca y modelo de tu vehículo?"
    ],
    filtros: [
      "Disponemos de filtros de aire, aceite, combustible y cabina. ¿Cuál necesitas? 🧰",
      "¿Buscas filtros originales o alternativos? Te ayudo a encontrar el adecuado.",
      "Tenemos filtros para todas las marcas y modelos. ¿Para qué vehículo lo necesitas?"
    ],
    motor: [
      "¿Buscas repuestos o información para motores? Tenemos piezas y asesoría especializada. 🚗",
      "Ofrecemos repuestos de motor como pistones, anillos, empaques y más. ¿Qué necesitas exactamente?",
      "¿Quieres cotizar un motor completo o alguna pieza específica? ¡Dímelo y te ayudo!"
    ],
    luces: [
      "Tenemos luces, bombillos y kits LED para todo tipo de vehículos. ¿Qué tipo de luz buscas? 💡",
      "¿Buscas luces delanteras, traseras o interiores? Te ayudo a encontrarlas.",
      "Ofrecemos instalación de luces LED y halógenas. ¿Te gustaría ver opciones?"
    ],
    default: [
      "Entiendo tu consulta. Un asesor especializado te puede brindar información más detallada. ¿Quieres que te contacte? 📱",
      "Para consultas específicas sobre productos, te recomiendo navegar por nuestro catálogo o contactar a un asesor. 🔍",
      "¡Gracias por tu pregunta! Para darte la mejor respuesta, ¿podrías ser más específico sobre lo que necesitas? 🤓"
    ]
  };

  // Función para detectar el tipo de consulta
  const detectIntent = (message: string): keyof typeof botResponses | 'llantas' | 'frenos' | 'baterias' | 'aceites' | 'filtros' | 'motor' | 'luces' => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('llanta') || lowerMessage.includes('llantas') || lowerMessage.includes('neumático')) {
      return 'llantas';
    }
    if (lowerMessage.includes('freno') || lowerMessage.includes('frenos')) {
      return 'frenos';
    }
    if (lowerMessage.includes('batería') || lowerMessage.includes('baterias') || lowerMessage.includes('bateria')) {
      return 'baterias';
    }
    if (lowerMessage.includes('aceite') || lowerMessage.includes('aceites')) {
      return 'aceites';
    }
    if (lowerMessage.includes('filtro') || lowerMessage.includes('filtros')) {
      return 'filtros';
    }
    if (lowerMessage.includes('motor') || lowerMessage.includes('motores')) {
      return 'motor';
    }
    if (lowerMessage.includes('luz') || lowerMessage.includes('luces') || lowerMessage.includes('led')) {
      return 'luces';
    }
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('buenas')) {
      return 'greeting';
    }
    if (lowerMessage.includes('producto') || lowerMessage.includes('repuesto') || lowerMessage.includes('parte')) {
      return 'products';
    }
    if (lowerMessage.includes('oferta') || lowerMessage.includes('descuento') || lowerMessage.includes('promoción')) {
      return 'offers';
    }
    if (lowerMessage.includes('entrega') || lowerMessage.includes('envío') || lowerMessage.includes('domicilio')) {
      return 'delivery';
    }
    if (lowerMessage.includes('pago') || lowerMessage.includes('precio') || lowerMessage.includes('costo')) {
      return 'payment';
    }
    if (lowerMessage.includes('contacto') || lowerMessage.includes('teléfono') || lowerMessage.includes('whatsapp')) {
      return 'contact';
    }
    if (lowerMessage.includes('ayuda') || lowerMessage.includes('ayúdame') || lowerMessage.includes('help')) {
      return 'help';
    }
    return 'default';
  };

  // Función para generar respuesta del bot
  const generateBotResponse = async (userMessage: string): Promise<ChatMessage> => {
    const intent = detectIntent(userMessage);
    // Intents de productos específicos
    const productIntents = {
      llantas: ['%llanta%', '%neumático%'],
      frenos: ['%freno%', '%pastilla%', '%disco%'],
      baterias: ['%bateria%', '%batería%'],
      aceites: ['%aceite%'],
      filtros: ['%filtro%'],
      motor: ['%motor%'],
      luces: ['%luz%', '%led%', '%bombillo%']
    };
    if (intent in productIntents) {
      try {
        let productos: any[] = [];
        let error: any = null;
        for (const keyword of productIntents[intent as keyof typeof productIntents]) {
          const { data, error: err } = await supabase
            .from('productos')
            .select('id_producto, nombre, precio, imagen_url')
            .ilike('nombre', keyword);
          console.log(`Consulta para '${intent}' con keyword '${keyword}':`, data, err);
          if (err) { error = err; break; }
          if (data && data.length > 0) {
            productos = productos.concat(data);
          }
        }
        // Eliminar duplicados por id_producto
        productos = productos.filter((v,i,a)=>a.findIndex(t=>(t.id_producto===v.id_producto))===i);
        if (error) throw error;
        if (productos.length > 0) {
          return {
            id: (Date.now() + 1).toString(),
            type: 'products',
            products: productos.map((p: any) => ({ id_producto: p.id_producto, nombre: p.nombre, precio: p.precio, imagen_url: p.imagen_url })),
            timestamp: new Date()
          };
        } else {
          return {
            id: (Date.now() + 1).toString(),
            text: `No se encontraron productos relacionados con ${intent} en este momento.`,
            sender: 'bot',
            timestamp: new Date()
          };
        }
      } catch (err) {
        return {
          id: (Date.now() + 1).toString(),
          text: `Hubo un error al buscar productos de ${intent}.`,
          sender: 'bot',
          timestamp: new Date()
        };
      }
    }
    const responses = botResponses[intent as keyof typeof botResponses];
    return {
      id: (Date.now() + 1).toString(),
      text: responses[Math.floor(Math.random() * responses.length)],
      sender: 'bot',
      timestamp: new Date()
    };
  };

  // Mensaje de bienvenida inicial
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: "¡Hola! 👋 Soy el asistente virtual de AutoPartesBogota. ¿En qué puedo ayudarte hoy?",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  // Scroll automático al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setTimeout(async () => {
      const botResponse = await generateBotResponse(inputMessage);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "¿Tienen frenos para Toyota?",
    "¿Cuáles son sus ofertas?",
    "¿Hacen envíos a domicilio?",
    "¿Qué formas de pago aceptan?"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-8 right-8 w-[480px] h-[650px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full">
            <Icon icon="mdi:robot-excited-outline" className="text-2xl text-blue-600" />
          </div>
          <div className="flex items-center gap-1">
            
            <h3 className="font-semibold text-sm">Asistente Virtual</h3>
          </div>
          <p className="text-xs opacity-90">AutoPartesBogota</p>
        </div>
        <Button
          isIconOnly
          variant="light"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-white/10"
        >
          <Icon icon="lucide:x" className="text-lg" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => {
          if ('type' in message && message.type === 'products') {
            if (!message.products || message.products.length === 0) {
              return (
                <div key={message.id} className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-2 text-sm text-gray-700">
                    No se encontraron productos para tu búsqueda.
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              );
            }
            return (
              <div key={message.id} className="flex justify-start">
                <div className="grid grid-cols-1 gap-2 w-full">
                  {message.products.map((prod) => (
                    <Link
                      key={prod.id_producto}
                      to={`/productos/${prod.id_producto}`}
                      className="flex items-center bg-gray-100 rounded-lg p-2 shadow hover:bg-blue-100 transition-colors cursor-pointer"
                      style={{ textDecoration: 'none' }}
                    >
                      {prod.imagen_url && (
                        <img src={prod.imagen_url} alt={prod.nombre} className="w-12 h-12 object-cover rounded mr-3" />
                      )}
                      <div>
                        <div className="font-semibold text-sm">{prod.nombre}</div>
                        <div className="text-xs text-blue-700 font-bold">${prod.precio}</div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-1">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            );
          }
          // Mensaje normal
          if ('sender' in message && 'text' in message) {
            return (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.text}
                  <div className={`text-xs mt-1 opacity-70 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="px-6 pb-3">
          <p className="text-xs text-gray-500 mb-2">Preguntas frecuentes:</p>
          <div className="space-y-1">
            {quickQuestions.slice(0, 2).map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="w-full text-left text-xs p-2 bg-gray-50 hover:bg-gray-100 rounded border text-gray-700"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-5 border-t border-gray-200">
        <div className="flex gap-3">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu pregunta..."
            size="sm"
            className="flex-1"
          />
          <Button
            isIconOnly
            color="primary"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            size="sm"
          >
            <Icon icon="lucide:send" className="text-lg" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Botón flotante para abrir el chat
const ChatButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Button
      isIconOnly
      color="primary"
      onClick={onClick}
      className={`fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg z-40 ${
        isAnimating ? 'animate-pulse' : ''
      }`}
      size="lg"
    >
      <span className="text-2xl">💬</span>
      {/* <Icon icon="lucide:message-circle" className="text-2xl" /> */}
      {/* Badge eliminado para evitar superposición */}
    </Button>
  );
};

// Componente principal exportable
export default function ChatbotWidget({ user, clearOnLogout }: { user?: any, clearOnLogout?: boolean }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (clearOnLogout) {
      setResetKey(prev => prev + 1);
    }
  }, [clearOnLogout]);

  return (
    <>
      {!isChatOpen && (
        <ChatButton onClick={() => setIsChatOpen(true)} />
      )}
      {/* Usar resetKey como key para forzar el reseteo del estado interno del chat */}
      <Chatbot
        key={resetKey}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        user={user}
      />
    </>
  );
}