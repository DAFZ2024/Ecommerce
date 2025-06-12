  import React from 'react';
  import { 
    Users,
    Grid3X3,
    Box,
    Mail,
    ShoppingBag,
    Receipt,
    Wallet
  } from 'lucide-react';

  export type TabType ="estadisticas" | "usuarios" | "categorias" | "productos" | "contactos" | "carritos" | "ordenes" | "pagos";

  interface StyledTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    showAllStyles?: boolean;
  }

  export const StyledTabs = ({ activeTab, onTabChange, showAllStyles = false }: StyledTabsProps) => {
    // Configuración de cada tab con icono y título mejorado
    const tabsConfig = {
      usuarios: { 
        title: "Usuarios", 
        icon: Users, 
        color: "bg-blue-500",
        description: "Gestión de usuarios"
      },
      categorias: { 
        title: "Categorías", 
        icon: Grid3X3, 
        color: "bg-purple-500",
        description: "Organizar productos"
      },
      productos: { 
        title: "Productos", 
        icon: Box, 
        color: "bg-green-500",
        description: "Inventario y catálogo"
      },
      contactos: { 
        title: "Contactos", 
        icon: Mail, 
        color: "bg-orange-500",
        description: "Mensajes y consultas"
      },
      carritos: { 
        title: "Carritos", 
        icon: ShoppingBag, 
        color: "bg-pink-500",
        description: "Carritos activos"
      },
      ordenes: { 
        title: "Órdenes", 
        icon: Receipt, 
        color: "bg-indigo-500",
        description: "Pedidos y ventas"
      },
      pagos: { 
        title: "Pagos", 
        icon: Wallet, 
        color: "bg-emerald-500",
        description: "Transacciones"
      }
    };

    const renderTabStyle1 = () => (
      <div className="flex flex-wrap gap-2 p-2 bg-gray-100 rounded-xl">
        {Object.entries(tabsConfig).map(([key, config]) => {
          const Icon = config.icon;
          const isActive = activeTab === key;
          
          return (
            <button
              key={key}
              onClick={() => onTabChange(key as TabType)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300
                ${isActive 
                  ? 'bg-white text-gray-800 shadow-lg transform scale-105' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }
              `}
            >
              <Icon size={20} />
              <span>{config.title}</span>
            </button>
          );
        })}
      </div>
    );

    const renderTabStyle2 = () => (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {Object.entries(tabsConfig).map(([key, config]) => {
          const Icon = config.icon;
          const isActive = activeTab === key;
          
          return (
            <button
              key={key}
              onClick={() => onTabChange(key as TabType)}
              className={`
                relative p-4 rounded-xl text-white font-medium transition-all duration-300 overflow-hidden
                ${isActive ? 'transform scale-105 shadow-2xl' : 'hover:scale-102 shadow-lg'}
                ${config.color}
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center gap-2">
                <Icon size={24} />
                <span className="text-sm font-semibold">{config.title}</span>
              </div>
              {isActive && (
                <div className="absolute inset-0 ring-4 ring-white/30 rounded-xl"></div>
              )}
            </button>
          );
        })}
      </div>
    );

    const renderTabStyle3 = () => (
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 overflow-x-auto pb-2">
          {Object.entries(tabsConfig).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = activeTab === key;
            
            return (
              <button
                key={key}
                onClick={() => onTabChange(key as TabType)}
                className={`
                  flex items-center gap-2 px-1 py-3 font-medium whitespace-nowrap border-b-2 transition-all duration-300
                  ${isActive 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon size={20} />
                <span>{config.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    );

    const renderTabStyle4 = () => (
      <div className="flex gap-6">
        <div className="w-64 bg-gray-50 rounded-xl p-4">
          <div className="space-y-2">
            {Object.entries(tabsConfig).map(([key, config]) => {
              const Icon = config.icon;
              const isActive = activeTab === key;
              
              return (
                <button
                  key={key}
                  onClick={() => onTabChange(key as TabType)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-white hover:shadow-md'
                    }
                  `}
                >
                  <Icon size={20} />
                  <div className="text-left">
                    <div className="font-semibold">{config.title}</div>
                    <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                      {config.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex-1 bg-white rounded-xl border-2 border-gray-100 p-8">
          <div className="text-center py-12">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${tabsConfig[activeTab].color} text-white mb-4`}>
              {React.createElement(tabsConfig[activeTab].icon, { size: 32 })}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {tabsConfig[activeTab].title}
            </h3>
            <p className="text-gray-600">
              {tabsConfig[activeTab].description}
            </p>
          </div>
        </div>
      </div>
    );

    const renderTabStyle5 = () => (
      <div className="flex flex-wrap gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
        {Object.entries(tabsConfig).map(([key, config]) => {
          const Icon = config.icon;
          const isActive = activeTab === key;
          
          return (
            <button
              key={key}
              onClick={() => onTabChange(key as TabType)}
              className={`
                relative flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl transform scale-105' 
                  : 'bg-white/60 text-gray-700 hover:bg-white hover:shadow-lg hover:scale-102'
                }
              `}
            >
              <Icon size={18} />
              <span>{config.title}</span>
              {isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              )}
            </button>
          );
        })}
      </div>
    );

    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        {showAllStyles ? (
          <>
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Panel de Administración
            </h1>

            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Estilo 1: Tabs Modernos</h2>
              {renderTabStyle1()}
            </div>

            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Estilo 2: Cards con Gradientes</h2>
              {renderTabStyle2()}
            </div>

            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Estilo 3: Línea Indicadora</h2>
              {renderTabStyle3()}
            </div>

            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Estilo 4: Navegación Sidebar</h2>
              {renderTabStyle4()}
            </div>

            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Estilo 5: Pills Animados</h2>
              {renderTabStyle5()}
            </div>
          </>
        ) : (
          renderTabStyle5() // Por defecto muestra solo el estilo 1
        )}
      </div>
    );
  };