import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/react";

export const Gracias = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  const estado = queryParams.get('estado');
  const mensaje = queryParams.get('mensaje');
  const orden = queryParams.get('orden');
  const monto = queryParams.get('monto');

  useEffect(() => {
    if (!estado) {
      navigate('/');
    }
  }, [estado, navigate]);

  const getIconAndColor = () => {
    switch(estado) {
      case 'success':
        return { icon: "lucide:check-circle", color: "text-green-500" };
      case 'cancelled':
        return { icon: "lucide:x-circle", color: "text-yellow-500" };
      case 'error':
        return { icon: "lucide:alert-circle", color: "text-red-500" };
      default:
        return { icon: "lucide:clock", color: "text-blue-500" };
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <Icon icon={icon} className={`text-6xl mx-auto mb-4 ${color}`} />
      <h1 className="text-2xl font-bold mb-2">
        {mensaje || 'Gracias por tu compra'}
      </h1>
      
      {orden && (
        <p className="text-default-600 mb-2">
          Número de orden: <span className="font-semibold">{orden}</span>
        </p>
      )}
      
      {monto && (
        <p className="text-default-600 mb-4">
          Monto: <span className="font-semibold">${parseFloat(monto).toFixed(2)}</span>
        </p>
      )}
      
      <Button 
        color="primary" 
        onPress={() => navigate('/')}
        className="mt-6"
      >
        Volver al Inicio
      </Button>
    </div>
  );
};
export default Gracias; 