/**
 * Netlify Serverless Function - DeepSeek API Proxy
 * Hält den API Key sicher auf dem Server
 * Requires Node.js 18+ (for native fetch)
 */

exports.handler = async (event) => {
    // 1. CORS Headers - THE MOST IMPORTANT PART
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // 2. Handle OPTIONS (Preflight)
    if (event.httpMethod === 'OPTIONS') {
        console.log("Handling OPTIONS request");
        return { statusCode: 204, headers, body: '' };
    }

    try {
        console.log("Chat Function called with Method:", event.httpMethod);

        // 3. Runtime Check: Is fetch available?
        if (typeof fetch === 'undefined') {
            console.error("CRITICAL: 'fetch' is not defined. Node version might be wrong.");
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    error: 'Server Configuration Error: Node.js version too old (fetch missing).',
                    details: 'Please set NODE_VERSION=18 in Netlify build environment.'
                })
            };
        }

        // 4. Only allow POST
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({ error: `Method ${event.httpMethod} not allowed` })
            };
        }

        // 5. Get API key
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            console.error("API Key missing");
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Configuration Error: DEEPSEEK_API_KEY missing.' })
            };
        }

        // 6. Parse Body
        if (!event.body) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Body missing' }) };
        }

        let messages;
        try {
            const body = JSON.parse(event.body);
            messages = body.messages;
        } catch (e) {
            console.error("JSON Parse Error:", e);
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON in body' }) };
        }

        if (!messages || !Array.isArray(messages)) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid messages format' }) };
        }

        // 7. Call DeepSeek
        console.log("Calling DeepSeek API...");
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
                max_tokens: 500
            })
        });

        console.log("DeepSeek Status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("DeepSeek Error:", errorText);
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ error: `DeepSeek API Error (${response.status})`, details: errorText })
            };
        }

        const data = await response.json();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ content: data.choices[0].message.content })
        };

    } catch (error) {
        console.error("CRITICAL UNCAUGHT ERROR:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.toString() })
        };
    }
};
