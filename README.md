# Raptoreum Marketplace Frontend

## Índice
1. [Introducción](#introducción)
2. [Características Principales](#características-principales)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Configuración e Instalación](#configuración-e-instalación)
6. [Personalización](#personalización)
7. [Contribución](#contribución)
8. [Licencia](#licencia)
9. [Contacto](#contacto)

## Introducción
Raptoreum Marketplace Frontend es una interfaz moderna para un marketplace de NFTs sobre la blockchain de Raptoreum, desarrollada con React y Chakra UI. Permite a los usuarios crear, importar, visualizar, comprar, vender y gestionar activos digitales (NFTs) en la red Raptoreum, priorizando la usabilidad, seguridad y una experiencia fluida.

## Características Principales

### Autenticación y Gestión de Usuarios
- **Registro**: Crea una cuenta con email, contraseña y nombre.
- **Inicio de sesión**: Acceso seguro mediante autenticación JWT.
- **Restablecimiento de contraseña**: Solicita un enlace de recuperación y establece una nueva contraseña.
- **Gestión de sesión**: Validación automática y redirección si el token es inválido o expirado.

### Gestión de Activos (NFTs)
- **Página principal**: Galería de todos los NFTs disponibles con tarjetas detalladas (nombre, precio, imagen).
- **Detalles del activo**: Información completa de cada NFT (propietario, precio, descripción, imagen). Los propietarios pueden editar precio y descripción, transferir el activo o aceptar ofertas.
- **Crear activo**: Sube un nuevo NFT con nombre, descripción, precio e imagen (con previsualización).
- **Importar activo**: Importa un NFT existente proporcionando sus datos.

### Ofertas y Transacciones
- **Realizar ofertas**: Haz ofertas de compra sobre NFTs, indicando precio y expiración.
- **Ver ofertas**: Consulta todas las ofertas enviadas y recibidas. Acepta o rechaza desde la misma interfaz.
- **Historial de transacciones**: Visualiza el historial completo de tus transacciones y el de cada NFT.

### Navegación y UI
- **Navbar responsiva**: Barra de navegación dinámica con login/logout, balance y acceso rápido a todas las páginas.
- **Toasts y modales**: Notificaciones personalizadas (éxito, error, info, carga) y modales para información y flujos de recuperación.
- **Modo oscuro/claro**: Alterna entre temas usando Chakra UI.

### Seguridad
- **Validación JWT**: Todas las rutas protegidas validan el token localmente y contra el backend.
- **Integración API**: Toda la información se obtiene de una API backend segura, con manejo de errores y feedback al usuario.

## Tecnologías Utilizadas
- **React** (con hooks)
- **Chakra UI** (componentes UI modernos y accesibles)
- **React Router** (ruteo SPA)
- **JWT** (autenticación)
- **Toasts y modales personalizados**

## Estructura del Proyecto

```
raptoreum-opensea-frontend/
  ├── public/                # Recursos estáticos
  ├── src/
  │   ├── Components/        # Componentes reutilizables (Navbar, AssetCard, Modals, Toasts, etc.)
  │   ├── Pages/             # Páginas principales (Home, Login, Signup, Account, AssetDetails, etc.)
  │   ├── data/              # Datos e imágenes estáticas
  │   ├── App.js             # App principal con ruteo y lógica de autenticación
  │   ├── index.js           # Punto de entrada
  │   └── ...
  ├── package.json
  └── README.md
```

## Configuración e Instalación

### Requisitos previos
- Node.js (recomendado v16+)
- npm o yarn

### Instalación
```bash
npm install
# o
yarn install
```

### Ejecución en desarrollo
```bash
npm start
# o
yarn start
```
La app estará disponible en `http://localhost:3000` por defecto.

### Compilación para producción
```bash
npm run build
# o
yarn build
```

### Variables de entorno
- El frontend espera que la API backend esté disponible en `https://rtm.api.test.unknowngravity.com/`.
- Si tu backend está en otra URL, ajusta los endpoints en el código.

## Personalización
- **Tema UI**: Cambia fácilmente entre modo oscuro y claro.
- **Endpoints API**: Modifica las URLs de la API en el código para apuntar a tu backend.
- **Branding**: Reemplaza logos y colores en `/public` y `/src/data` según tu marca.

## Contribución
¡Las pull requests son bienvenidas! Para cambios mayores, abre primero un issue para discutir lo que te gustaría modificar.

## Licencia
[MIT](LICENSE)

---

## Contacto
Para dudas o soporte, abre un issue o contacta al mantenedor.
