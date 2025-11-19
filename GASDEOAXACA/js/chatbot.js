// Chatbot de Gas de Oaxaca - Conectado a OpenAI API
class GasOaxacaChatbot {
    constructor() {
        this.apiKey = 'sk-proj-iYYZG44r2ar-VNmoJARv3Lo6r7QKfUGuCOvbYKxVuUTdmZayDPtOkKMauYcImhfRsG4Tm9BDtT3BlbkFJ_SN11rn017tmcqCmVZEko8CtnNm6fn5U8uAoofkp9tVB7JxEpGwqJB2GqYaDmFvXV5Zqz-ES0A';
        this.isOpen = false;
        this.conversationHistory = [];
        this.maxHistoryLength = 10;

        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupInitialContext();
    }

    cacheElements() {
        this.container = document.getElementById('chatbotContainer');
        this.toggleBtn = document.getElementById('chatbotToggle');
        this.closeBtn = document.getElementById('chatbotClose');
        this.messagesContainer = document.getElementById('chatbotMessages');
        this.inputField = document.getElementById('chatbotInput');
        this.sendBtn = document.getElementById('chatbotSend');
        this.suggestionBtns = document.querySelectorAll('.suggestion-btn');
        this.typingIndicator = document.getElementById('typingIndicator');
    }

    bindEvents() {
        // Toggle chat
        this.toggleBtn.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.closeChat());

        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Suggestion buttons
        this.suggestionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.getAttribute('data-message');
                this.inputField.value = message;
                this.sendMessage();
            });
        });

        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen &&
                !this.container.contains(e.target) &&
                !this.toggleBtn.contains(e.target)) {
                // Optional: uncomment to close on outside click
                // this.closeChat();
            }
        });
    }

    setupInitialContext() {
        // Contexto inicial para el asistente de Gas de Oaxaca
        this.systemContext = {
            role: 'system',
            content: `Eres un asistente virtual experto de "Gas de Oaxaca S.A. DE C.V.", una empresa mexicana que distribuye gas LP.

INFORMACIÓN DE LA EMPRESA:
- Nombre: Gas de Oaxaca S.A. DE C.V.
- Ubicación: Calle Principal #123, Colonia Centro, Oaxaca, Oax. C.P. 68000, México
- Teléfonos: Oficina (951) 123-4567, WhatsApp (951) 987-6543, Emergencias 24/7 (951) 242-4738
- Email: info@gasdeoaxaca.com, ventas@gasdeoaxaca.com, soporte@gasdeoaxaca.com
- Horario: Lunes-Viernes 8:00-18:00, Sábado 9:00-14:00, Emergencias 24/7

PRODUCTOS Y SERVICIOS:
- Gas LP Residencial para uso doméstico
- Gas Industrial para empresas y fábricas
- Gas Comercial para negocios y restaurantes
- Instalación y mantenimiento de equipos
- Servicio de emergencias las 24 horas
- Distribución y venta de tanques estacionarios
- Servicio de reparación de fugas

TONO Y ESTILO:
- Ser siempre amable, profesional y servicial
- Usar lenguaje claro y fácil de entender
- Proporcionar información precisa y útil
- Ante preguntas fuera de contexto, redirigir amablemente a los servicios de Gas de Oaxaca
- Incluir emojis apropiados para hacer la conversación más amigable
- Ser proactivo sugiriendo servicios relevantes

RESPUESTAS A PREGUNTAS FRECUENTES:
- Precios: Solicitar contacto para cotización personalizada
- Emergencias: Proporcionar número 24/7 inmediatamente
- Pedidos: Redirigir a formulario de contacto o WhatsApp
- Ubicación: Proporcionar dirección completa y mapa
- Horarios: Informar horarios de atención y emergencias

IMPORTANTE: Siempre mantén la confidencialidad de la información del cliente y nunca compartas datos sensibles.`
        };

        this.conversationHistory.push(this.systemContext);
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        this.container.classList.add('show');
        this.isOpen = true;
        this.inputField.focus();
    }

    closeChat() {
        this.container.classList.remove('show');
        this.isOpen = false;
    }

    async sendMessage() {
        const message = this.inputField.value.trim();
        if (!message) return;

        // Add user message to UI
        this.addMessageToUI(message, 'user');
        this.inputField.value = '';

        // Disable input while processing
        this.setInputState(false);

        try {
            // Add user message to conversation history
            this.conversationHistory.push({
                role: 'user',
                content: message
            });

            // Show typing indicator
            this.showTypingIndicator();

            // Get response from OpenAI
            const response = await this.callOpenAI();

            // Hide typing indicator
            this.hideTypingIndicator();

            // Add bot response to UI and history
            this.addMessageToUI(response, 'bot');
            this.conversationHistory.push({
                role: 'assistant',
                content: response
            });

            // Trim conversation history if too long
            this.trimConversationHistory();

        } catch (error) {
            console.error('Error en chatbot:', error);
            this.hideTypingIndicator();
            this.addMessageToUI(
                'Lo siento, estoy teniendo dificultades para responder en este momento. Por favor, intenta más tarde o contáctanos directamente por teléfono en el (951) 123-4567.',
                'bot'
            );
        }

        // Re-enable input
        this.setInputState(true);
        this.inputField.focus();
    }

    async callOpenAI() {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: this.conversationHistory,
                    max_tokens: 300,
                    temperature: 0.7,
                    top_p: 0.9,
                    frequency_penalty: 0.5,
                    presence_penalty: 0.5
                })
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();

        } catch (error) {
            console.error('Error llamando a OpenAI:', error);

            // Respuesta de emergencia si falla la API
            return this.getEmergencyResponse();
        }
    }

    getEmergencyResponse() {
        const responses = [
            'Soy el asistente virtual de Gas de Oaxaca. Puedo ayudarte con información sobre nuestros productos de gas LP, servicios de instalación, y atención a emergencias las 24 horas. ¿Qué te gustaría saber?',
            '¡Hola! Estoy aquí para asistirte con tus necesidades de gas LP. Ofrecemos servicio residencial, comercial e industrial con distribución en Oaxaca. ¿En qué puedo ayudarte?',
            'Bienvenido a Gas de Oaxaca. Soy tu asistente virtual. Puedo orientarte sobre nuestros productos, horarios de atención, y servicios de emergencia. ¿Cuál es tu consulta?'
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    addMessageToUI(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? '👤' : '🤖';

        const content = document.createElement('div');
        content.className = 'message-content';

        // Format message with line breaks
        const formattedMessage = message
            .split('\n')
            .filter(line => line.trim())
            .map(line => `<p>${line}</p>`)
            .join('');

        content.innerHTML = formattedMessage;

        if (sender === 'user') {
            messageDiv.appendChild(content);
            messageDiv.appendChild(avatar);
        } else {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(content);
        }

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }

    setInputState(enabled) {
        this.inputField.disabled = !enabled;
        this.sendBtn.disabled = !enabled;
        this.suggestionBtns.forEach(btn => btn.disabled = !enabled);
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    trimConversationHistory() {
        // Keep system context and last messages
        if (this.conversationHistory.length > this.maxHistoryLength) {
            const systemContext = this.conversationHistory[0];
            const recentMessages = this.conversationHistory.slice(-this.maxHistoryLength + 1);
            this.conversationHistory = [systemContext, ...recentMessages];
        }
    }

    // Public methods for external access
    reset() {
        this.conversationHistory = [this.systemContext];
        this.messagesContainer.innerHTML = `
            <div class="message bot-message">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <p>¡Hola! 👋 Soy el asistente virtual de Gas de Oaxaca.</p>
                    <p>Estoy aquí para ayudarte con información sobre nuestros productos, servicios, cotizaciones o cualquier duda que tengas.</p>
                    <p>¿En qué puedo asistirte hoy?</p>
                </div>
            </div>
        `;
    }

    addQuickAction(action) {
        this.inputField.value = action;
        this.sendMessage();
    }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gasOaxacaChatbot = new GasOaxacaChatbot();

    // Add some keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to toggle chat
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            window.gasOaxacaChatbot.toggleChat();
        }

        // Escape to close chat
        if (e.key === 'Escape' && window.gasOaxacaChatbot.isOpen) {
            window.gasOaxacaChatbot.closeChat();
        }
    });

    console.log('Chatbot de Gas de Oaxaca inicializado correctamente');
});