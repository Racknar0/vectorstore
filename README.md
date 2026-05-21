# 🎮 Vector Store - E-Commerce de Plantillas & Diseños Vectoriales

[![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Express%20%7C%20MySQL%20%7C%20Prisma-blue.svg)](#-tecnologías)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)
[![Status: Development](https://img.shields.io/badge/Status-Desarrollo-green.svg)](#)

**Vector Store** es una plataforma moderna de comercio electrónico diseñada para la venta y distribución de plantillas vectoriales premium para camisetas y artículos deportivos (Fútbol, Motocross, E-Sports y Casual). Cuenta con una integración fluida entre un frontend dinámico e interactivo y un backend robusto con base de datos relacional MySQL y flujos automatizados de mensajería transaccional.

---

## 🚀 Características Clave

### 🛒 Portal del Cliente (Frontend)
*   **Catálogo Interactivo:** Búsqueda y filtrado dinámico de diseños organizados por categorías utilizando una interfaz limpia, moderna y animada.
*   **Soporte Multidivisa:** Visualización y gestión de precios adaptados en Soles Peruanos (PEN) y Dólares Americanos (USD), con soporte para descuentos.
*   **Carrito de Compras Responsivo:** Carrito lateral flotante gestionado eficientemente con **Zustand**.
*   **Flujo de Checkout Seguro:** Envío de datos del cliente, selección de pasarelas de pago y subida directa del comprobante de transferencia/QR al servidor.
*   **Código de Pedido Único:** Generación automática de códigos con formato `ORD-YYYYMMDD-XXXX`.

### 🛡️ Panel de Administración (Dashboard)
*   **Autenticación Protegida:** Rutas administrativas `/dashboard/*` protegidas al 100% mediante **Next.js Middleware** con verificación de tokens JWT a nivel de servidor a través de cookies de sesión (`vector_store_token`).
*   **Métricas en Tiempo Real (KPIs):** Panel principal con indicadores clave de rendimiento (Ingresos totales, Ventas concretadas, Pedidos pendientes, Diseños más descargados).
*   **Gestión de Pedidos (Aprobación/Rechazo):** 
    *   Revisión visual del comprobante de pago subido.
    *   **Flujo Automatizado:** Al aprobar un pedido, el sistema incrementa el contador de descargas de los vectores y dispara un correo electrónico transaccional vía **Google SMTP** al cliente con los enlaces directos de descarga (MEGA).
    *   **Control de Rechazos:** Opción de ingresar el motivo del rechazo para notificar al cliente.
*   **CRUDs Administrativos Dinámicos:**
    *   **Categorías:** Creación, edición y eliminación de categorías (con soporte de iconos y slugs únicos) a través de ventanas emergentes interactivas con **SweetAlert2**.
    *   **Diseños:** Subida física del archivo de mockup, control del formato (.AI, .PSD), asignación de precios/descuentos e indicación de si el recurso es gratuito (`isFree`).
    *   **Métodos de Pago:** Gestión de cuentas, enlaces de pasarela (PayPal/Stripe) y códigos QR (con soporte de imágenes).

---

## 🛠️ Tecnologías

### Frontend (`/front`)
*   **Next.js 16 (App Router)** - Framework React para producción.
*   **Zustand** - Gestor de estado ultraligero y rápido para el carrito de compras.
*   **Sass (SCSS)** - Estilos dinámicos, flexibles y responsive.
*   **SweetAlert2** - Modales interactivos elegantes para notificaciones y CRUDs rápidos.

### Backend (`/back`)
*   **Node.js & Express** - Servidor REST API rápido y modular.
*   **Prisma ORM** - Modelado y gestión de base de datos relacional de tipo type-safe.
*   **MySQL** - Base de datos lista para entornos de producción.
*   **Multer** - Middleware para procesamiento y almacenamiento seguro de imágenes subidas (mockups y comprobantes).
*   **Nodemailer** - Automatización de envío de correos utilizando el servicio SMTP de Google.

---

## 📁 Estructura del Proyecto

```bash
vectorstore/
├── back/                      # Servidor API REST
│   ├── helpers/               # Funciones utilitarias (ej: correo electrónico)
│   ├── middlewares/           # Middleware de autenticación JWT
│   ├── prisma/                # Migraciones y esquema Prisma (MySQL)
│   │   ├── migrations/        # Historial de migraciones SQL
│   │   ├── schema.prisma      # Esquema de modelos
│   │   └── seed.js            # Semilla de base de datos
│   ├── routes/                # Controladores y rutas de Express
│   ├── uploads/               # Carpeta de almacenamiento para archivos subidos
│   ├── package.json
│   └── server.js              # Archivo de entrada del backend
│
├── front/                     # Aplicación Next.js
│   ├── src/
│   │   ├── app/               # Enrutamiento App Router (Páginas públicas y Dashboard)
│   │   ├── helpers/           # Clientes HTTP y utilidades API
│   │   ├── store/             # Tiendas de Zustand (Carrito de compras)
│   │   └── middleware.js      # Middleware de protección de rutas
│   ├── package.json
│   └── next.config.mjs
│
└── .gitignore                 # Exclusiones de Git globales
```

---

## ⚙️ Configuración del Entorno Local

### Requisitos Previos
*   **Node.js** (v18 o superior recomendado)
*   **MySQL Server** (por defecto configurado en puerto `3306`)

---

### Paso 1: Configurar Variables de Entorno

#### 1. Configuración del Backend (`back/.env`)
Crea un archivo `.env` dentro de la carpeta `back` guiándote de `.env.example`:
```env
PORT=5000
DATABASE_URL="mysql://usuario:contrasena@localhost:3306/nombre_base_datos"
JWT_SECRET="tu_clave_secreta_jwt_muy_segura"

# SMTP Google Config (Envío de correos para enlaces de descarga)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_correo_gmail@gmail.com
SMTP_PASS=tu_contrasena_de_aplicacion_google
SMTP_FROM="Vector Store <tu_correo_gmail@gmail.com>"
```

#### 2. Configuración del Frontend (`front/.env.local`)
Crea un archivo `.env.local` en la carpeta `front`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

### Paso 2: Instalar y Desplegar Base de Datos

En la carpeta **`back`**, instala las dependencias y ejecuta el flujo de migraciones:

```bash
# 1. Instalar dependencias
npm install

# 2. Correr migraciones de Prisma en tu MySQL local
npx prisma migrate dev --name init_mysql

# 3. Poblar la base de datos con los datos semilla (Administrador, Categorías, Métodos de Pago)
npx prisma db seed
```

---

### Paso 3: Inicializar los Servidores

#### Levantar el Backend (Express)
```bash
cd back
npm run dev
# El servidor correrá en http://localhost:5000
```

#### Levantar el Frontend (Next.js)
```bash
cd front
npm install
npm run dev
# La web correrá en http://localhost:3000
```

---

## 🔑 Credenciales de Prueba

Una vez poblada la base de datos con el comando `db seed`, puedes acceder al panel administrativo con las siguientes credenciales predeterminadas:

*   **URL de Acceso:** `http://localhost:3000/login`
*   **Usuario Administrador:** `admin@vectorstore.com`
*   **Contraseña:** `admin123`

---

## 🐳 Flujo de Producción y Despliegue

> [!IMPORTANT]
> **REGLA DE ORO DE LA BASE DE DATOS:**
> Nunca utilices `prisma db push` para realizar cambios de esquema en entornos de staging o producción.
> Utiliza siempre el flujo de migraciones:
> `npx prisma migrate dev --name descripcion_cambio`
> De esta forma, el ORM genera los archivos SQL en `/prisma/migrations` que se ejecutarán automáticamente al hacer deploy en producción usando:
> `npx prisma migrate deploy`

---

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Siéntete libre de adaptarlo y usarlo.
