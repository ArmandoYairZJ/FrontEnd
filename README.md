# Frontend - Sistema de Gestión de Productos

Aplicación web desarrollada con Next.js para la gestión de productos, incluyendo funcionalidades de autenticación, creación, consulta, actualización y eliminación de productos.

## Características

- **Autenticación OAuth2**: Login con email y contraseña usando el flujo Password Grant
- **Gestión de Productos**:
  - ✅ Consultar todos los productos
  - ✅ Consultar producto por ID
  - ✅ Crear nuevos productos
  - ✅ Actualizar productos existentes
  - ✅ Eliminar productos
- **Sistema de Logs**: Registro automático de cambios con descripción obligatoria
- **Interfaz Responsive**: Diseño adaptativo para móviles y escritorio
- **Manejo de Errores**: Mensajes de error claros y personalizados
- **Secuenta con usuario invitado**: Los usuarios invitados solo pueden ver lo que son los productos y nada más.

##  Requisitos Previos

- Node.js 18+ 
- npm o pnpm
- Backend API configurado y disponible

##  Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd FrontEnd
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   pnpm install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   NEXT_PUBLIC_API_URL=https://tu-backend-url.com
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   # o
   pnpm dev
   ```

   La aplicación estará disponible en `http://localhost:3000`