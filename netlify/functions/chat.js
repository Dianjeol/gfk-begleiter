/**
 * Netlify Serverless Function - DeepSeek API Proxy
 * Proven working logic (based on test-llm.js)
 */

exports.handler = async (event) => {
    // 1. Simple CORS Headers (Proven to work)
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // 2. Handle Preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Configuration Error: No API Key' })
        };
    }

    try {
        // 3. Parse Body
        if (!event.body) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Body missing' }) };
        }

        let messages;
        try {
            const body = JSON.parse(event.body);
            messages = body.messages;
        } catch (e) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
        }

        if (!messages || !Array.isArray(messages)) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid messages array' }) };
        }

        // 4. API Call (Proven fetch logic)
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
            const errorText = await response.text();
            console.error("DeepSeek API Error:", errorText);
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ error: `Provider Error (${response.status})`, details: errorText })
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
        console.error("Function Error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal Server Error',
                details: error.message
            })
        };
    }
};
