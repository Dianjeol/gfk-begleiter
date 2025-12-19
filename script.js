/**
 * GFK Begleiter - Empathischer Chat mit DeepSeek AI
 * Gewaltfreie Kommunikation (GFK) nach Marshall B. Rosenberg
 * 
 * Version mit Netlify Serverless Function (kein User-API-Key nötig)
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
    clearChat: document.getElementById('clear-chat')
};

// ==========================================
// INITIALIZATION
// ==========================================

function init() {
    // Load existing messages
    loadMessages();

    // Set up event listeners
    setupEventListeners();

    // Auto-resize textarea
    setupTextareaAutoResize();

    // Update send button state
    updateSendButtonState();

    // Show welcome message if no messages
    if (state.messages.length === 0) {
        addMessage('ai', 'Hallo! 💚 Schön, dass du hier bist. Ich bin dein GFK-Begleiter – ein Raum, in dem du so sein kannst, wie du bist. Was bewegt dich gerade?');
    }
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

    // Clear chat
    elements.clearChat.addEventListener('click', clearChatHistory);
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

    // Add user message
    addMessage('user', message);

    // Clear input
    elements.messageInput.value = '';
    elements.messageInput.style.height = 'auto';
    updateSendButtonState();

    // Show typing indicator
    showTypingIndicator();

    try {
        const response = await sendToServerless(message);
        hideTypingIndicator();
        addMessage('ai', response);
    } catch (error) {
        hideTypingIndicator();
        console.error('API Error:', error);
        showError(error.message || 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    }
}

function handleKeyDown(e) {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        elements.chatForm.dispatchEvent(new Event('submit'));
    }
}

async function sendToServerless(userMessage) {
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

    const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Serverfehler');
    }

    return data.content;
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

        // Add welcome message again
        addMessage('ai', 'Hallo! 💚 Schön, dass du hier bist. Ich bin dein GFK-Begleiter – ein Raum, in dem du so sein kannst, wie du bist. Was bewegt dich gerade?');
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

// ==========================================
// SETTINGS MODAL
// ==========================================

function openSettingsModal() {
    elements.settingsModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeSettingsModal() {
    elements.settingsModal.classList.remove('show');
    document.body.style.overflow = '';
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
