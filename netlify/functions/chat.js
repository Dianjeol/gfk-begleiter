/**
 * Netlify Serverless Function - DeepSeek API Proxy
 * Optimized for CORS
 */

exports.handler = async (event) => {
    // 1. Robust CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': '*', // oder spezifische Domain wenn nötig, aber * ist ok für public API
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // 2. Handle Preflight (OPTIONS)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Configuration Error: No API Key' }) };
    }

    try {
        // 3. Safe Body Parsing
        let messages = [];

        if (event.body) {
            try {
                const body = JSON.parse(event.body);
                messages = body.messages;
            } catch (e) {
                // Ignore parse error, maybe it's not JSON
            }
        }

        // Fallback for empty/invalid messages (so it doesn't crash like before)
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            // For debugging: return a hello message if payload fails (like test-llm did implicitly)
            // But better: return error, BUT make sure we don't crash before headers are sent.
            console.log("Invalid body, payload missing");
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid request body. Expected {"messages": [...]}' })
            };
        }

        // 4. API Call
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: messages,
                temperature: 0.8, // Slightly more creative for empathy
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("DeepSeek API Error:", text);
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ error: `DeepSeek Error (${response.status})`, details: text })
            };
        }

        const data = await response.json();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ content: data.choices[0].message.content })
        };

    } catch (error) {
        console.error("Function Error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
        };
    }
};
