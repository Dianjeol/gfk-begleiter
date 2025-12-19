/**
 * GFK Begleiter - Empathischer Chat mit DeepSeek AI
 * Multilingual Version: EN, DE, FR, ES, ZH, AR, UK
 */

// ==========================================
// STATE MANAGEMENT
// ==========================================

const state = {
    messages: JSON.parse(localStorage.getItem('chat_messages') || '[]'),
    isTyping: false,
    language: localStorage.getItem('chat_language') || 'en'
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
    headerTitle: document.getElementById('header-title'),

    // Settings Modal
    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    closeModal: document.getElementById('close-modal'),
    clearChat: document.getElementById('clear-chat'),
    languageSelect: document.getElementById('language-select'),

    // Labels
    infoTitle: document.getElementById('info-title'),
    infoSubtitle: document.getElementById('info-subtitle'),
    privacyNote: document.getElementById('privacy-note'),
    clearChatText: document.getElementById('clear-chat-text'),
    languageLabel: document.getElementById('language-label'),
    welcomeMessage: document.getElementById('welcome-message')
};

// ==========================================
// TRANSLATION HELPER
// ==========================================

function t(key) {
    const lang = TRANSLATIONS[state.language] || TRANSLATIONS.en;
    return lang.ui[key] || TRANSLATIONS.en.ui[key] || key;
}

function getSystemPrompt() {
    const lang = TRANSLATIONS[state.language] || TRANSLATIONS.en;
    return lang.systemPrompt || TRANSLATIONS.en.systemPrompt;
}

function getWelcomeMessage() {
    const lang = TRANSLATIONS[state.language] || TRANSLATIONS.en;
    return lang.welcomeMessage || TRANSLATIONS.en.welcomeMessage;
}

function isRTL() {
    const lang = TRANSLATIONS[state.language] || TRANSLATIONS.en;
    return lang.rtl || false;
}

// ==========================================
// INITIALIZATION
// ==========================================

function init() {
    // Apply saved language
    applyLanguage();

    // Load existing messages
    loadMessages();

    // Set up event listeners
    setupEventListeners();

    // Auto-resize textarea
    setupTextareaAutoResize();

    // Update send button state
    updateSendButtonState();

    // Populate language selector
    populateLanguageSelector();

    // Show welcome message if no messages
    if (state.messages.length === 0) {
        addMessage('ai', getWelcomeMessage());
    }

    // Test backend connection
    checkBackendConnection();
}

async function checkBackendConnection() {
    try {
        const response = await fetch('/functions/ping');
        if (response.ok) {
            console.log('Backend connected!');
        } else {
            console.warn('Backend reachable but returned error:', response.status);
        }
    } catch (e) {
        console.error('Backend connection check failed:', e);
        // Show subtle warning
        elements.statusText.textContent = 'Offline? (Backend not reachable)';
        elements.statusText.classList.add('text-red-300');
    }
}

function populateLanguageSelector() {
    if (!elements.languageSelect) return;

    elements.languageSelect.innerHTML = '';

    Object.entries(TRANSLATIONS).forEach(([code, lang]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${lang.flag} ${lang.name}`;
        option.selected = code === state.language;
        elements.languageSelect.appendChild(option);
    });
}

function applyLanguage() {
    const lang = TRANSLATIONS[state.language] || TRANSLATIONS.en;

    // Update RTL
    document.documentElement.dir = isRTL() ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', isRTL());

    // Update UI elements
    if (elements.headerTitle) elements.headerTitle.textContent = t('title');
    if (elements.statusText) elements.statusText.textContent = t('subtitle');
    if (elements.messageInput) elements.messageInput.placeholder = t('placeholder');
    if (elements.infoTitle) elements.infoTitle.textContent = t('infoTitle');
    if (elements.infoSubtitle) elements.infoSubtitle.textContent = t('infoSubtitle');
    if (elements.privacyNote) elements.privacyNote.textContent = t('privacyNote');
    if (elements.clearChatText) elements.clearChatText.textContent = t('clearChat');
    if (elements.languageLabel) elements.languageLabel.textContent = t('language');
    if (elements.welcomeMessage) elements.welcomeMessage.textContent = t('welcome');

    // Update page title
    document.title = `${t('title')} | Empathic Chat`;
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

    // Language change
    if (elements.languageSelect) {
        elements.languageSelect.addEventListener('change', handleLanguageChange);
    }
}

function handleLanguageChange(e) {
    state.language = e.target.value;
    localStorage.setItem('chat_language', state.language);
    applyLanguage();

    // Update typing indicator text if visible
    const typingText = elements.typingIndicator.querySelector('span');
    if (typingText) typingText.textContent = t('typing');
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
        showError(error.message || 'An error occurred. Please try again.');
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

    // Add system prompt at the beginning (language-specific)
    const messages = [
        { role: 'system', content: getSystemPrompt() },
        ...conversationHistory,
        { role: 'user', content: userMessage }
    ];

    // Use the shorter path that seems to work for ping
    const functionUrl = '/functions/chat';

    try {
        console.log(`Calling API at: ${functionUrl}`);

        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages })
        });

        // Handle HTTP errors
        if (!response.ok) {
            let errorDetails = `Server Error (${response.status})`;
            try {
                const data = await response.json();
                errorDetails = data.error || errorDetails;
            } catch (e) {
                const text = await response.text();
                errorDetails = response.status === 404 ? 'API Function not found (404)'
                    : response.status === 500 ? 'Internal Server Error (500)'
                        : text.substring(0, 100);
            }
            throw new Error(errorDetails);
        }

        const data = await response.json();
        return data.content;

    } catch (error) {
        console.error('Fetch Error:', error);

        // Detailed error for debugging
        let userMsg = 'Connection failed.';
        if (error.message.includes('Failed to fetch')) {
            userMsg = `Network Error (Failed to reach ${functionUrl}). Check internet or if Function is deployed.`;
        } else {
            userMsg = error.message;
        }

        throw new Error(userMsg);
    }
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
    if (confirm(t('clearConfirm'))) {
        state.messages = [];
        saveMessages();
        loadMessages();
        closeSettingsModal();

        // Add welcome message again
        addMessage('ai', getWelcomeMessage());
    }
}

// ==========================================
// UI HELPERS
// ==========================================

function showTypingIndicator() {
    state.isTyping = true;
    elements.typingIndicator.classList.remove('hidden');
    elements.statusText.textContent = t('typing');
    scrollToBottom();
}

function hideTypingIndicator() {
    state.isTyping = false;
    elements.typingIndicator.classList.add('hidden');
    elements.statusText.textContent = t('subtitle');
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
    return date.toLocaleTimeString(state.language === 'zh' ? 'zh-CN' : state.language, {
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
