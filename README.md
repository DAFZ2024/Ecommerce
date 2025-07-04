# Ecommerce01

Proyecto de tienda online para venta de repuestos, aceites, baterías y accesorios para autos y motos.

## Descripción
Ecommerce01 es una aplicación web moderna desarrollada con React, Vite y Tailwind CSS, que permite a los usuarios explorar productos por categorías, ver detalles, añadir productos al carrito y gestionar compras. Incluye integración con Supabase para la gestión de datos y autenticación.

## Tecnologías utilizadas
- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- HeroUI (componentes UI)
- Iconify (iconos)

## Estructura del proyecto
```
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── (imágenes y recursos estáticos)
├── plugins/
│   └── (plugins personalizados para Vite y Babel)
└── src/
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── components/
    │   └── (componentes reutilizables)
    ├── context/
    ├── lib/
    │   ├── supabaseClient.ts
    │   └── utils.ts
    └── pages/
        └── (páginas principales de la app)
```

## Instalación y configuración

1. **Clona el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd Ecommerce01
   ```
2. **Instala las dependencias:**
   ```bash
   npm install
   ```
3. **Configura las variables de entorno:**
   - Crea un archivo `.env` en la raíz del proyecto con las siguientes variables (ajusta según tu proyecto Supabase):
     ```env
     VITE_SUPABASE_URL=tu_url_supabase
     VITE_SUPABASE_ANON_KEY=tu_anon_key
     ```
   - Puedes encontrar estos valores en la configuración de tu proyecto en [Supabase](https://app.supabase.com/).
4. **Inicia la aplicación en modo desarrollo:**
   ```bash
   npm run dev
   ```
5. **Accede a la app:**
   - Abre tu navegador en `http://localhost:5173` (o el puerto que indique la terminal).

### Problemas comunes
- Si tienes errores de dependencias, ejecuta `npm install` nuevamente.
- Si la conexión a Supabase falla, revisa que las variables de entorno sean correctas y que tu proyecto Supabase esté activo.

## Uso básico
- Selecciona una categoría para ver los productos disponibles.
- Haz clic en un producto para ver detalles o añadirlo al carrito.
- Gestiona tu carrito y procede a la compra.

## Funcionalidades principales
- Visualización de productos por categorías
- Carrito de compras
- Autenticación de usuarios
- Panel de administración CRUD (gestión de productos)
- Historial de pedidos
- Ofertas y promociones
- Página de contacto y puntos de venta

## Documentación Técnica

### Arquitectura
- **Frontend:** SPA desarrollada en React + TypeScript, usando Vite como bundler y Tailwind CSS para estilos.
- **Backend:** Supabase se utiliza como backend as a service para autenticación y base de datos (PostgreSQL).
- **Gestión de estado:** Uso de hooks de React y contextos para manejar el carrito y la autenticación.

### Principales dependencias
- `@heroui/react`: Componentes UI modernos y accesibles.
- `@iconify/react`: Sistema de iconos flexible.
- `supabase-js`: Cliente para interactuar con Supabase.
- `react-router-dom`: Enrutamiento de páginas.
- `tailwindcss`: Utilidades CSS para estilos rápidos y responsivos.

### Estructura de carpetas relevante
- `src/components/`: Componentes reutilizables (carrito, sliders, modales, etc).
- `src/pages/`: Vistas principales (productos, detalle, dashboard, contacto, etc).
- `src/lib/`: Utilidades y configuración de Supabase.
- `src/context/`: Contextos globales (ej. usuario, carrito).

### Consideraciones para desarrolladores
- Seguir la convención de componentes funcionales y hooks.
- Usar TypeScript para tipado estricto.
- Mantener la UI consistente usando los componentes de HeroUI y Tailwind.
- Para agregar nuevas páginas, crear un archivo en `src/pages/` y registrar la ruta en el router principal.
- Para conectar con la base de datos, usar el cliente de Supabase configurado en `src/lib/supabaseClient.ts`.

## Créditos
Desarrollado por el equipo de Ecommerce01.

## Licencia
Este proyecto se distribuye bajo la licencia MIT.

