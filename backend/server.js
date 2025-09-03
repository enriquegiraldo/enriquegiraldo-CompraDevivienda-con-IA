const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración dinámica de orígenes permitidos para CORS
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : ['http://localhost:8080', 'http://127.0.0.1:8080']; // Valores por defecto para desarrollo

app.use(cors({
    origin: (origin, callback) => {
        // Permitir solicitudes sin origen (como Postman) o si el origen está en la lista de permitidos
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true
}));

// Middleware de seguridad
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, // máximo 50 requests por IP por ventana
    message: {
        error: 'Demasiadas solicitudes, intente de nuevo en 15 minutos'
    }
});
app.use('/api/', limiter);

// Servir favicon para evitar errores 404 (opcional)
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Endpoint para generar documentos con Gemini
app.post('/api/generate-document', async (req, res) => {
    try {
        const { prompt } = req.body;
                
        if (!prompt || prompt.trim().length === 0) {
            return res.status(400).json({
                error: 'El prompt es requerido'
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                error: 'Configuración del servidor incompleta'
            });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${process.env.GEMINI_API_KEY}`;
                
        const payload = {
            contents: [{ parts: [{ text: prompt }] }]
        };

        const fetch = (await import('node-fetch')).default;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Error de la API de Gemini: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();
        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
            res.json({
                success: true,
                content: candidate.content.parts[0].text
            });
        } else {
            res.status(500).json({
                error: 'No se pudo generar el contenido',
                details: 'La API no devolvió contenido válido'
            });
        }
    } catch (error) {
        console.error('Error en /api/generate-document:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

// Endpoint de salud
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Algo salió mal en el servidor'
    });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint no encontrado'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Orígenes CORS permitidos: ${allowedOrigins.join(', ')}`);
});
// Nota: Asegúrate de tener un archivo .env con la variable GEMINI_API_KEY y opcionalmente FRONTEND_URL
// FRONTEND_URL puede contener múltiples URLs separadas por comas para producción
