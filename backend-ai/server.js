// server.js
require('dotenv').config(); // Carga las variables de entorno desde .env
const express = require('express');
const { OpenAI } = require('openai'); // Importa OpenAI SDK v4
const cors = require('cors'); // Para manejar CORS

const app = express();
const port = process.env.PORT || 3000; // Puerto del servidor

// Configura el cliente de OpenAI con tu clave API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Usa la clave desde las variables de entorno
});

// Middlewares
app.use(cors()); // Permite solicitudes desde tu frontend
app.use(express.json()); // Permite al servidor entender JSON en el cuerpo de las solicitudes

// Ruta para manejar las solicitudes de chat
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: 'Mensaje no proporcionado.' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // O "gpt-4" si tienes acceso y lo prefieres
            messages: [{ role: "user", content: userMessage }],
            max_tokens: 150, // Límite de tokens para la respuesta
            temperature: 0.7, // Creatividad de la respuesta (0.0 a 1.0)
        });

        const aiResponse = completion.choices[0].message.content;
        res.json({ reply: aiResponse });

    } catch (error) {
        console.error('Error al comunicarse con OpenAI:', error);
        if (error.response) {
            console.error('Estado HTTP:', error.response.status);
            console.error('Datos de error:', error.response.data);
        }
        res.status(500).json({ error: 'Error al obtener respuesta de la IA.' });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor backend escuchando en http://localhost:${port}`);
    console.log('¡Recuerda iniciar este servidor antes de usar tu frontend!');
});