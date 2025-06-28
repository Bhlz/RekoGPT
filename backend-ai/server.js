// backend-ai/server.js
require('dotenv').config(); // Carga las variables de entorno desde .env
const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');

const app = express();

// Configura el cliente de OpenAI con tu clave API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Usa la clave desde las variables de entorno
});

// Middlewares
// CORS middleware: Configuración más robusta para producción en Vercel
// Es recomendable usar el paquete 'cors' aquí, incluso si ya tienes encabezados en vercel.json,
// porque puede manejar preflights OPTIONS requests.
app.use(cors({
    origin: '*', // Permite cualquier origen. Para producción real, se recomienda poner el dominio de tu frontend.
    methods: ['GET', 'POST', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
}));
app.use(express.json()); // Permite al servidor entender JSON en el cuerpo de las solicitudes

// Ruta para manejar las solicitudes de chat
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: 'Mensaje no proporcionado.' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userMessage }],
            max_tokens: 150,
            temperature: 0.7,
        });

        const aiResponse = completion.choices[0].message.content;
        res.json({ reply: aiResponse });

    } catch (error) {
        console.error('Error al comunicarse con OpenAI:', error);
        // Vercel Serverless Functions no tienen 'error.response' como un servidor tradicional,
        // así que capturamos el mensaje general o detalles específicos si están disponibles.
        const errorMessage = error.message || 'Error desconocido al obtener respuesta de la IA.';
        console.error('Detalle del error:', errorMessage);

        // Envía un error 500 con un mensaje más descriptivo si es posible
        res.status(500).json({ 
            error: 'Error al obtener respuesta de la IA.', 
            details: process.env.NODE_ENV === 'development' ? errorMessage : 'Un error ha ocurrido en el servidor.' 
        });
    }
});

// ¡IMPORTANTE! Exporta la aplicación Express para que Vercel pueda usarla.
// Remueve app.listen()
module.exports = app;