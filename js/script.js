let isOrbActive = false;
let typingTimeout;

const responses = [
    "Hola, soy tu asistente de IA personal. Estoy aquí para ayudarte con cualquier pregunta o tarea que tengas.",
    "Puedo ayudarte con análisis de datos, escritura creativa, programación, y mucho más. ¿En qué puedo asistirte hoy?",
    "Desde resolver problemas complejos hasta tareas cotidianas, estoy diseñado para adaptarme a tus necesidades específicas."
];

// Mobile menu functionality
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    // Animate hamburger menu
    const spans = menuToggle.querySelectorAll('span');
    if (navMenu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// Close menu when clicking on links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

function activateOrb() {
    if (isOrbActive) return;
    
    isOrbActive = true;
    const homeSection = document.getElementById('homeSection');
    const orbSection = document.getElementById('orbSection');
    const backButton = document.querySelector('.back-button');
    const chatSection = document.getElementById('chatSection'); // Get chat section

    // Ocultar sección home y mostrar orbe
    homeSection.classList.add('hidden');
    orbSection.classList.add('active');
    backButton.classList.add('visible');
    
    // Después de 6 segundos, animar el orbe a la izquierda, mostrar texto y chat
    setTimeout(() => {
        orbSection.classList.add('slide-left');
        startTypingAnimation();
        chatSection.classList.add('active'); // Show chat section
    }, 6000);
}

function startTypingAnimation() {
    const textSection = document.getElementById('textSection');
    const typingText = document.getElementById('typingText');
    
    textSection.classList.add('active');
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    typeText(typingText, randomResponse);
}

function typeText(element, text, callback) {
    element.innerHTML = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            typingTimeout = setTimeout(type, 50 + Math.random() * 30); // Velocidad variable más natural
        } else {
            element.innerHTML += '<span class="cursor"></span>';
            if (callback) callback();
        }
    }
    
    type();
}

function goBack() {
    const homeSection = document.getElementById('homeSection');
    const orbSection = document.getElementById('orbSection');
    const textSection = document.getElementById('textSection');
    const backButton = document.querySelector('.back-button');
    const chatSection = document.getElementById('chatSection'); // Get chat section
    
    // Resetear estados
    isOrbActive = false;
    homeSection.classList.remove('hidden');
    orbSection.classList.remove('active', 'slide-left');
    textSection.classList.remove('active');
    backButton.classList.remove('visible');
    chatSection.classList.remove('active'); // Hide chat section
    
    // Limpiar texto
    document.getElementById('typingText').innerHTML = '';
    
    // Limpiar timeout si existe
    if (typingTimeout) {
        clearTimeout(typingTimeout);
    }

    // Clear chat messages
    document.getElementById('chatMessages').innerHTML = '';
}

// Efectos adicionales para la cara
const face = document.querySelector('.face');
const eyes = document.querySelectorAll('.eye');

// Seguimiento del mouse sutil para los ojos
document.addEventListener('mousemove', (e) => {
    if (isOrbActive) return;
    
    const rect = face.getBoundingClientRect();
    const faceCenterX = rect.left + rect.width / 2;
    const faceCenterY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    const deltaX = (mouseX - faceCenterX) / 100;
    const deltaY = (mouseY - faceCenterY) / 100;
    
    eyes.forEach(eye => {
        eye.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    });
});

// Parpadeo aleatorio adicional
setInterval(() => {
    if (!isOrbActive && Math.random() > 0.7) {
        eyes.forEach(eye => {
            eye.style.animation = 'none';
            eye.style.transform = 'scaleY(0.1)';
            eye.style.opacity = '0.3';
            
            setTimeout(() => {
                eye.style.animation = 'blink 3s infinite';
                eye.style.transform = '';
                eye.style.opacity = '';
            }, 150);
        });
    }
}, 5000);


// Chat functionality
const chatInput = document.getElementById('chatInput');
const sendMessageButton = document.getElementById('sendMessageButton');
const chatMessages = document.getElementById('chatMessages');

sendMessageButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

   async function sendMessage() {
    const messageText = chatInput.value.trim();
    if (messageText === '') return;

    appendMessage(messageText, 'user');
    chatInput.value = ''; // Limpiar el input inmediatamente

    // Mensaje de "escribiendo..." de la IA
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('chat-message', 'ai', 'typing-indicator');
    typingIndicator.innerHTML = '<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>'; // Simple animación de puntos
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const response = await fetch('/chat', { // <-- ¡Cambia aquí!
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: messageText }),
});

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        // Eliminar el indicador de "escribiendo..."
        chatMessages.removeChild(typingIndicator);

        appendMessage(data.reply, 'ai');
        chatMessages.scrollTop = chatMessages.scrollHeight; // Desplazar al final

    } catch (error) {
        console.error('Error al enviar mensaje al backend:', error);
        // Eliminar el indicador de "escribiendo..." si hubo un error
        if(chatMessages.contains(typingIndicator)) {
            chatMessages.removeChild(typingIndicator);
        }
        appendMessage("Lo siento, no pude obtener una respuesta de la IA. Intenta de nuevo más tarde.", 'ai');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}


function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', sender);
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
}

function getRandomAIResponse(userMessage) {
    const lowerCaseMessage = userMessage.toLowerCase();
    if (lowerCaseMessage.includes('hola')) {
        return "¡Hola! ¿En qué puedo ayudarte hoy?";
    } else if (lowerCaseMessage.includes('cómo estás')) {
        return "Soy una IA, no tengo sentimientos, pero estoy listo para asistirte.";
    } else if (lowerCaseMessage.includes('nombre')) {
        return "Mi nombre es Platoo, tu asistente de IA.";
    } else if (lowerCaseMessage.includes('gracias')) {
        return "De nada, estoy aquí para servirte.";
    } else if (lowerCaseMessage.includes('ayuda')) {
        return "Claro, dime qué necesitas y haré lo mejor para ayudarte.";
    } else if (lowerCaseMessage.includes('clima')) {
        return "No tengo acceso a información en tiempo real como el clima, pero puedo responder otras preguntas.";
    }
    return "Espera un momento...";
}