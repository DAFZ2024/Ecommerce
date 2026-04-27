<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=2,3,24&height=210&section=header&text=🛒%20Ecommerce01&fontSize=65&fontColor=ffffff&animation=fadeIn&desc=Tienda%20Online%20de%20Repuestos%20Automotrices&descSize=21&descAlignY=68&fontAlignY=42" width="100%" />
</div>

<div align="center">

  ![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-latest-646CFF?style=for-the-badge&logo=vite&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-latest-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
  ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
  ![License](https://img.shields.io/badge/Licencia-MIT-green?style=for-the-badge)

</div>

<br/>

> Plataforma de e-commerce especializada en repuestos, aceites, baterías y accesorios para **autos y motos**. Construida como SPA moderna con React + TypeScript y Supabase como backend.

---

## 📌 Tabla de Contenidos

- [✨ Funcionalidades](#-funcionalidades)
- [🛠️ Tecnologías](#️-tecnologías)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🚀 Instalación](#-instalación)
- [⚙️ Variables de Entorno](#️-variables-de-entorno)
- [📜 Scripts](#-scripts)
- [🏗️ Arquitectura](#️-arquitectura)
- [👨‍💻 Guía para Desarrolladores](#-guía-para-desarrolladores)
- [🤝 Contribuciones](#-contribuciones)

---

## ✨ Funcionalidades

<table>
<tr>
<td width="50%">

### 🛍️ Para Clientes
- Exploración de productos por categoría
- Vista detallada de cada producto
- Carrito de compras persistente
- Autenticación de usuarios
- Historial de pedidos
- Ofertas y promociones activas
- Página de contacto y puntos de venta

</td>
<td width="50%">

### 🔧 Para Administradores
- Panel CRUD completo de productos
- Gestión de categorías
- Control de inventario
- Gestión de pedidos
- Administración de usuarios
- Control de promociones

</td>
</tr>
</table>

---

## 🛠️ Tecnologías

| Capa | Tecnología | Rol |
|------|-----------|-----|
| **UI Framework** | React 18 + TypeScript | SPA con tipado estricto |
| **Build Tool** | Vite | Bundler con HMR ultrarrápido |
| **Estilos** | Tailwind CSS | Utilidades CSS responsive |
| **Componentes UI** | HeroUI | Componentes accesibles y modernos |
| **Iconos** | Iconify | Sistema de iconos flexible |
| **Backend** | Supabase (PostgreSQL) | Auth + base de datos como servicio |
| **Routing** | React Router DOM | Navegación entre páginas |

---

## 📁 Estructura del Proyecto

```
Ecommerce01/
├── 📁 public/                  # Recursos estáticos e imágenes
├── 📁 plugins/                 # Plugins personalizados Vite/Babel
└── 📁 src/
    ├── App.tsx                 # Componente raíz y router
    ├── main.tsx                # Punto de entrada
    ├── index.css               # Estilos globales
    │
    ├── 📁 components/          # Componentes reutilizables
    │   └── (carrito, sliders, modales, navbar, etc.)
    │
    ├── 📁 pages/               # Vistas principales
    │   └── (productos, detalle, dashboard, contacto, etc.)
    │
    ├── 📁 context/             # Estado global
    │   └── (UserContext, CartContext)
    │
    └── 📁 lib/
        ├── supabaseClient.ts   # Cliente Supabase configurado
        └── utils.ts            # Utilidades compartidas
```

---

## 🚀 Instalación

### Prerrequisitos
- Node.js 16+
- Cuenta en [Supabase](https://app.supabase.com/) con un proyecto activo

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd Ecommerce01

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (ver sección siguiente)

# 4. Iniciar en modo desarrollo
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador. 🎉

---

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

Encuéntralas en tu proyecto de Supabase en **Settings → API**.

> ⚠️ Nunca subas el archivo `.env` al repositorio. Asegúrate de que esté en tu `.gitignore`.

### Problemas comunes

| Problema | Solución |
|----------|----------|
| Errores de dependencias | Ejecutar `npm install` nuevamente |
| Falla la conexión a Supabase | Verificar que las variables `.env` sean correctas y el proyecto esté activo |
| Puerto ocupado | Cambiar el puerto en `vite.config.ts` o cerrar el proceso que lo usa |

---

## 📜 Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Compilación para producción |
| `npm run preview` | Vista previa del build de producción |
| `npm run lint` | Análisis estático con ESLint |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────┐
│         React SPA (Frontend)    │
│   React + TypeScript + Vite     │
│   Tailwind CSS + HeroUI         │
└────────────────┬────────────────┘
                 │ supabase-js
┌────────────────▼────────────────┐
│      Supabase (Backend as a     │
│      Service)                   │
│   Auth │ PostgreSQL │ Storage   │
└─────────────────────────────────┘
```

- **Estado global:** Contextos de React para carrito y autenticación de usuario
- **Routing:** React Router DOM con rutas protegidas para el panel admin
- **Data fetching:** Cliente Supabase desde `src/lib/supabaseClient.ts`

---

## 👨‍💻 Guía para Desarrolladores

### Agregar una nueva página

```bash
# 1. Crear el archivo de la página
touch src/pages/MiPagina.tsx

# 2. Registrar la ruta en App.tsx
<Route path="/mi-pagina" element={<MiPagina />} />
```

### Convenciones del proyecto

- ✅ Componentes funcionales con hooks — sin clases
- ✅ TypeScript estricto en todos los archivos
- ✅ Componentes UI con HeroUI + Tailwind para consistencia visual
- ✅ Toda interacción con la base de datos a través de `src/lib/supabaseClient.ts`
- ✅ Estado global en `src/context/` — evitar prop drilling

### Conventional Commits

Usa este formato para los mensajes de commit:

```
feat: agregar filtro por precio en catálogo
fix: corregir total del carrito al aplicar descuento
docs: actualizar variables de entorno en README
refactor: extraer lógica del carrito a custom hook
```

---

## 🤝 Contribuciones

```bash
# 1. Haz fork del proyecto y clónalo
git clone <tu-fork>

# 2. Crea tu rama de feature
git checkout -b feature/nueva-funcionalidad

# 3. Haz commit de tus cambios
git commit -m "feat: descripción clara del cambio"

# 4. Sube y abre un Pull Request
git push origin feature/nueva-funcionalidad
```

---

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=2,3,24&height=120&section=footer" width="100%" />

  <br/>

  Desarrollado con ⚙️ y ❤️ para el mundo automotriz

  © 2025 Ecommerce01 · Licencia MIT

</div>
