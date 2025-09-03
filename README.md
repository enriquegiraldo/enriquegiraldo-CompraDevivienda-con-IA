Guía Legal de Inmuebles - Aplicación Full-Stack
Esta aplicación consta de un frontend interactivo y un backend seguro de Node.js para ayudar a los usuarios en el proceso de legalización de un inmueble en Colombia.

Estructura del Proyecto
proyecto/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    └── index.html

Requisitos
Node.js (versión 18 o superior)

npm (se instala con Node.js)

Una clave API de Google Gemini (puedes obtenerla en Google AI Studio)

Configuración y Ejecución
Sigue estos pasos para poner en marcha la aplicación.

1. Configurar el Backend
Primero, navega a la carpeta del backend e instala las dependencias.

cd backend
npm install

A continuación, necesitas configurar tu clave de API. Renombra el archivo .env.example a .env (si existe) o crea un nuevo archivo llamado .env. Ábrelo y pega tu clave de API de Gemini.

# backend/.env

GEMINI_API_KEY="aqui_va_tu_clave_secreta_de_gemini"
FRONTEND_URL="http://localhost:8080"
NODE_ENV=development
PORT=3000

2. Iniciar el Servidor Backend
Una vez configurado, puedes iniciar el servidor.

# Desde la carpeta /backend
npm start

Deberías ver un mensaje en tu terminal confirmando que el servidor está corriendo en el puerto 3000.

3. Ejecutar el Frontend
El frontend es un simple archivo HTML. Necesitas servirlo a través de un servidor web local para que las peticiones al backend funcionen correctamente.

Abre una nueva terminal y navega a la carpeta del frontend.

cd frontend

La forma más sencilla de iniciar un servidor web es usando npx, que viene con Node.js.

# Desde la carpeta /frontend
npx http-server -p 8080

Este comando iniciará un servidor en el puerto 8080.

4. Usar la Aplicación
Abre tu navegador web y ve a la siguiente dirección:

http://localhost:8080

Ahora puedes interactuar con la aplicación. Las solicitudes a la IA se enviarán de forma segura a través de tu backend de Node.js.