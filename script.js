/**
 * GFK Begleiter - Empathischer Chat mit DeepSeek AI
 * Gewaltfreie Kommunikation (GFK) nach Marshall B. Rosenberg
 */

// ==========================================
// SYSTEM PROMPT - Psychologisch fundiert für GFK
// ==========================================

const SYSTEM_PROMPT = `Du bist ein einfühlsamer, warmherziger Begleiter, der in der Kunst der Gewaltfreien Kommunikation (GFK) nach Marshall B. Rosenberg tiefgreifend geschult ist. Du erschaffst einen sicheren, urteilsfreien Raum, in dem Menschen sich gehört und verstanden fühlen.

## DEINE ESSENZ
Du verkörperst die Giraffe – das Tier mit dem größten Herzen aller Landsäugetiere. Du hörst mit dem Herzen, nicht mit den Ohren. Deine Präsenz allein vermittelt: "Du bist willkommen, so wie du bist."

## DIE 4 SCHRITTE DER GFK – Dein innerer Kompass

1. **BEOBACHTUNG** (ohne Bewertung)
   - Hilf dem Menschen, konkrete Situationen zu beschreiben
   - Trenne Beobachtung von Interpretation
   - Frage: "Was genau ist passiert?" nicht "Warum?"

2. **GEFÜHL** (nicht Gedanke)
   - Unterscheide echte Gefühle von Pseudo-Gefühlen
   - "Ich fühle mich ignoriert" → "Ich fühle mich traurig/einsam"
   - Gefühle sind Boten der Bedürfnisse

3. **BEDÜRFNIS** (universal & positiv)
   - Hinter jedem Vorwurf steckt ein unerfülltes Bedürfnis
   - Bedürfnisse sind nie gegen jemanden gerichtet
   - Beispiele: Verbindung, Respekt, Autonomie, Sicherheit, Wertschätzung

4. **BITTE** (konkret & erfüllbar)
   - Nicht: "Sei netter" → Sondern: "Könntest du mir morgen 10 Minuten zuhören?"
   - Eine Bitte ist keine Forderung – "Nein" bleibt möglich

## WOLFSSPRACHE → GIRAFFENSPRACHE (Übersetzung)

Wenn Menschen in Urteilen, Vorwürfen oder Schuldzuweisungen sprechen (Wolfssprache), übersetze dies sanft und ohne Belehrung:

| Wolfssprache | Deine empathische Übersetzung |
|--------------|-------------------------------|
| "Er ist so egoistisch!" | "Es klingt so, als ob du dir mehr Rücksichtnahme wünschst. Was genau ist passiert?" |
| "Das ist total unfair!" | "Da scheint dir Gerechtigkeit wirklich wichtig zu sein. Magst du mir mehr erzählen?" |
| "Sie respektiert mich nie!" | "Ich höre, wie sehr du dir Respekt und Anerkennung wünschst. Was hat dich gerade so berührt?" |
| "Ich bin so ein Versager" | "Das klingt schwer. Was brauchst du gerade? Vielleicht etwas Selbstmitgefühl?" |

## DEIN ANTWORTVERHALTEN

**Format:**
- Beginne IMMER mit empathischer Resonanz (1-2 Sätze)
- Stelle maximal EINE offene Frage pro Nachricht
- Halte Antworten kurz (3-5 Sätze), außer tiefere Exploration ist angebracht
- Nutze Emojis sparsam und mit Bedacht: 💚 (Wärme), 🌱 (Wachstum), 🦒 (GFK)

**Empathie-Starter (variiere diese):**
- "Das klingt wirklich belastend..."
- "Ich kann hören, wie sehr dich das bewegt..."
- "Da scheint gerade viel in dir los zu sein..."
- "Danke, dass du das mit mir teilst..."

**Vermeide unbedingt:**
- Ratschläge geben (außer explizit gewünscht)
- Bewerten oder interpretieren
- "Du solltest...", "Du musst...", "Das Problem ist..."
- Zu schnell Lösungen anbieten
- Eigene Geschichten erzählen

**Stattdessen:**
- Spiegeln, was du hörst
- Nachfragen, um tiefer zu verstehen
- Raum lassen für Stille und Reflexion
- Die Gefühle und Bedürfnisse benennen, die du wahrnimmst

## BEISPIEL-DIALOG

**User:** "Mein Chef hat mich heute vor allen bloßgestellt. Der ist so ein Arschloch!"

**Du:** "Oh, das klingt wirklich verletzend 💚. Vor anderen kritisiert zu werden – da kann man sich so klein und ausgeliefert fühlen. Magst du mir erzählen, was genau passiert ist?"

**User:** "Er hat gesagt, dass mein Bericht Müll ist, dabei hab ich echt hart dran gearbeitet!"

**Du:** "Ich höre, wie enttäuscht und vielleicht auch wütend du bist. Du hast viel Mühe reingesteckt, und dann kommt so eine Reaktion... Klingt so, als wäre dir Wertschätzung für deine Arbeit wichtig. Ist das so?"

## WICHTIG

Du bist kein Therapeut und gibst keine Diagnosen. Bei Anzeichen von Selbstverletzung, Suizidgedanken oder akuter Krise, weise sanft auf professionelle Hilfe hin (Telefonseelsorge: 0800 111 0 111).

Sei geduldig. Echte Empathie braucht Zeit. 🌱`;

// ==========================================
// STATE MANAGEMENT
// ==========================================

const state = {
    apiKey: localStorage.getItem('deepseek_api_key') || '',
    messages: JSON.parse(localStorage.getItem('chat_messages') || '[]'),
    isTyping: false
};

// ==========================================
// DOM ELEMENTS
// ==========================================

const elements = {
    chatMessages: document.getElementById('chat-messages'),
    messageInput: document.getElementById('message-input'),
    sendBtn: document.getElementById('send-btn'),
    chatForm: document.getElementById('chat-form'),
    typingIndicator: document.getElementById('typing-indicator'),
    statusText: document.getElementById('status-text'),

    // Settings Modal
    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    closeModal: document.getElementById('close-modal'),
    apiKeyInput: document.getElementById('api-key'),
    toggleKeyVisibility: document.getElementById('toggle-key-visibility'),
    saveSettings: document.getElementById('save-settings'),
    clearChat: document.getElementById('clear-chat'),

    // Initial Overlay
    apiKeyOverlay: document.getElementById('api-key-overlay'),
    initialApiKey: document.getElementById('initial-api-key'),
    startChat: document.getElementById('start-chat')
};

// ==========================================
// INITIALIZATION
// ==========================================

function init() {
    // Check if API key exists
    if (state.apiKey) {
        hideOverlay();
        loadMessages();
    }

    // Set up event listeners
    setupEventListeners();

    // Auto-resize textarea
    setupTextareaAutoResize();

    // Update send button state
    updateSendButtonState();
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
    // Form submission
    elements.chatForm.addEventListener('submit', handleSubmit);

    // Input changes
    elements.messageInput.addEventListener('input', updateSendButtonState);
    elements.messageInput.addEventListener('keydown', handleKeyDown);

    // Settings modal
    elements.settingsBtn.addEventListener('click', openSettingsModal);
    elements.closeModal.addEventListener('click', closeSettingsModal);
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) closeSettingsModal();
    });

    // API Key visibility toggle
    elements.toggleKeyVisibility.addEventListener('click', toggleApiKeyVisibility);

    // Save settings
    elements.saveSettings.addEventListener('click', saveSettings);

    // Clear chat
    elements.clearChat.addEventListener('click', clearChatHistory);

    // Initial API key flow
    elements.startChat.addEventListener('click', handleStartChat);
    elements.initialApiKey.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleStartChat();
    });
}

function setupTextareaAutoResize() {
    const textarea = elements.messageInput;

    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
    });
}

// ==========================================
// CHAT FUNCTIONALITY
// ==========================================

async function handleSubmit(e) {
    e.preventDefault();

    const message = elements.messageInput.value.trim();
    if (!message || state.isTyping) return;

    // Check API key
    if (!state.apiKey) {
        showError('Bitte gib zuerst deinen DeepSeek API Key in den Einstellungen ein.');
        return;
    }

    // Add user message
    addMessage('user', message);

    // Clear input
    elements.messageInput.value = '';
    elements.messageInput.style.height = 'auto';
    updateSendButtonState();

    // Show typing indicator
    showTypingIndicator();

    try {
        const response = await sendToDeepSeek(message);
        hideTypingIndicator();
        addMessage('ai', response);
    } catch (error) {
        hideTypingIndicator();
        console.error('API Error:', error);
        showError(getErrorMessage(error));
    }
}

function handleKeyDown(e) {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        elements.chatForm.dispatchEvent(new Event('submit'));
    }
}

async function sendToDeepSeek(userMessage) {
    const conversationHistory = state.messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
    }));

    // Add system prompt at the beginning
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory,
        { role: 'user', content: userMessage }
    ];

    const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.apiKey}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: messages,
            temperature: 0.8,
            max_tokens: 500,
            presence_penalty: 0.1,
            frequency_penalty: 0.1
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw { status: response.status, data: errorData };
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// ==========================================
// MESSAGE HANDLING
// ==========================================

function addMessage(role, content) {
    const message = {
        id: Date.now(),
        role: role,
        content: content,
        timestamp: new Date().toISOString()
    };

    state.messages.push(message);
    saveMessages();
    renderMessage(message);
    scrollToBottom();
}

function renderMessage(message) {
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${message.role} relative px-4 py-2 shadow-sm`;

    const time = formatTime(message.timestamp);

    bubble.innerHTML = `
        <p class="text-sm leading-relaxed whitespace-pre-wrap">${escapeHtml(message.content)}</p>
        <div class="message-time mt-1 ${message.role === 'user' ? 'text-right' : ''}">
            ${time}
            ${message.role === 'user' ? '<svg class="inline w-4 h-4 text-blue-500" viewBox="0 0 16 15" fill="currentColor"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/></svg>' : ''}
        </div>
    `;

    elements.chatMessages.appendChild(bubble);
}

function loadMessages() {
    // Clear existing (except welcome message)
    const welcomeMsg = elements.chatMessages.querySelector('.justify-center');
    elements.chatMessages.innerHTML = '';
    if (welcomeMsg) elements.chatMessages.appendChild(welcomeMsg);

    // Render all stored messages
    state.messages.forEach(msg => renderMessage(msg));
    scrollToBottom(false);
}

function saveMessages() {
    localStorage.setItem('chat_messages', JSON.stringify(state.messages));
}

function clearChatHistory() {
    if (confirm('Möchtest du wirklich den gesamten Chatverlauf löschen?')) {
        state.messages = [];
        saveMessages();
        loadMessages();
        closeSettingsModal();
    }
}

// ==========================================
// UI HELPERS
// ==========================================

function showTypingIndicator() {
    state.isTyping = true;
    elements.typingIndicator.classList.remove('hidden');
    elements.statusText.textContent = 'schreibt...';
    scrollToBottom();
}

function hideTypingIndicator() {
    state.isTyping = false;
    elements.typingIndicator.classList.add('hidden');
    elements.statusText.textContent = 'Online';
}

function updateSendButtonState() {
    const hasText = elements.messageInput.value.trim().length > 0;
    elements.sendBtn.disabled = !hasText || state.isTyping;
}

function scrollToBottom(smooth = true) {
    setTimeout(() => {
        elements.chatMessages.scrollTo({
            top: elements.chatMessages.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto'
        });
    }, 50);
}

function showError(message) {
    const errorBubble = document.createElement('div');
    errorBubble.className = 'error-message px-4 py-3 rounded-lg mx-auto max-w-sm text-sm';
    errorBubble.textContent = `⚠️ ${message}`;
    elements.chatMessages.appendChild(errorBubble);
    scrollToBottom();
}

function getErrorMessage(error) {
    if (error.status === 401) {
        return 'Ungültiger API Key. Bitte überprüfe deinen Key in den Einstellungen.';
    } else if (error.status === 429) {
        return 'Zu viele Anfragen. Bitte warte einen Moment.';
    } else if (error.status === 500) {
        return 'Der DeepSeek-Server hat gerade Probleme. Bitte versuche es später erneut.';
    } else if (!navigator.onLine) {
        return 'Keine Internetverbindung. Bitte überprüfe deine Verbindung.';
    }
    return 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.';
}

// ==========================================
// SETTINGS MODAL
// ==========================================

function openSettingsModal() {
    elements.apiKeyInput.value = state.apiKey;
    elements.settingsModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeSettingsModal() {
    elements.settingsModal.classList.remove('show');
    document.body.style.overflow = '';
}

function toggleApiKeyVisibility() {
    const input = elements.apiKeyInput;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    // Update icon (eye open/closed)
    const icon = document.getElementById('eye-icon');
    if (isPassword) {
        icon.innerHTML = '<path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />';
    } else {
        icon.innerHTML = '<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />';
    }
}

function saveSettings() {
    const newKey = elements.apiKeyInput.value.trim();

    if (newKey) {
        state.apiKey = newKey;
        localStorage.setItem('deepseek_api_key', newKey);
    }

    closeSettingsModal();
}

// ==========================================
// INITIAL OVERLAY
// ==========================================

function handleStartChat() {
    const key = elements.initialApiKey.value.trim();

    if (!key) {
        elements.initialApiKey.classList.add('ring-2', 'ring-red-400');
        setTimeout(() => {
            elements.initialApiKey.classList.remove('ring-2', 'ring-red-400');
        }, 2000);
        return;
    }

    state.apiKey = key;
    localStorage.setItem('deepseek_api_key', key);
    hideOverlay();

    // Add welcome message from AI
    addMessage('ai', 'Hallo! 💚 Schön, dass du hier bist. Ich bin dein GFK-Begleiter – ein Raum, in dem du so sein kannst, wie du bist. Was bewegt dich gerade?');
}

function hideOverlay() {
    elements.apiKeyOverlay.classList.add('hidden');
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// START APP
// ==========================================

document.addEventListener('DOMContentLoaded', init);
