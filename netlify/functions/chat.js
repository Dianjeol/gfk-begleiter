/**
 * Netlify Serverless Function - DeepSeek API Proxy
 * Hält den API Key sicher auf dem Server
 * Requires Node.js 18+ (native fetch)
 */

exports.handler = async (event) => {
    console.log("Chat Function called");
    console.log("Method:", event.httpMethod);

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

    console.log("API Key check:", apiKey ? "Present (starts with " + apiKey.substring(0, 3) + ")" : "Missing");

    if (!apiKey) {
        console.error("API Error: Key missing");
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Configuration Error: DEEPSEEK_API_KEY is missing in Netlify settings.'
            })
        };
    }

    try {
        if (!event.body) {
            console.error("Request Error: Body missing");
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Body missing' }) };
        }

        const { messages } = JSON.parse(event.body);

        if (!messages || !Array.isArray(messages)) {
            console.error("Request Error: Messages invalid");
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid request: messages missing or not an array' })
            };
        }

        console.log("Sending request to DeepSeek API...");

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

        console.log("DeepSeek Response Status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('DeepSeek API Error Body:', errorText);

            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({
                    error: `DeepSeek API Error (${response.status})`,
                    details: errorText
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
        console.error('CRITICAL Function Error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal function error',
                details: error.message,
                stack: error.stack
            })
        };
    }
};
