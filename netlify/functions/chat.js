/**
 * Netlify Serverless Function - DeepSeek API Proxy
 * Hält den API Key sicher auf dem Server
 */

exports.handler = async (event) => {
    // CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Get API key from environment
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'API Key nicht konfiguriert. Bitte DEEPSEEK_API_KEY in Netlify setzen.'
            })
        };
    }

    try {
        const { messages } = JSON.parse(event.body);

        if (!messages || !Array.isArray(messages)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Ungültige Anfrage: messages fehlt' })
            };
        }

        // Call DeepSeek API
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
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
            console.error('DeepSeek API Error:', response.status, errorData);

            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({
                    error: getErrorMessage(response.status),
                    details: errorData
                })
            };
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                content: data.choices[0].message.content
            })
        };

    } catch (error) {
        console.error('Function Error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Interner Serverfehler. Bitte versuche es erneut.'
            })
        };
    }
};

function getErrorMessage(status) {
    switch (status) {
        case 401:
            return 'Ungültiger API Key. Bitte in Netlify prüfen.';
        case 429:
            return 'Zu viele Anfragen. Bitte warte einen Moment.';
        case 500:
        case 502:
        case 503:
            return 'DeepSeek-Server hat gerade Probleme. Bitte später erneut versuchen.';
        default:
            return 'Ein Fehler ist aufgetreten.';
    }
}
