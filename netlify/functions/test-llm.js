exports.handler = async (event) => {
    // Ultra-simple handler without complex headers or logic first
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'No API Key' }) };
    }

    try {
        // Minimal fetch call
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: 'Say Hello' }]
            })
        });

        const data = await response.json();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
        };
    } catch (e) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: e.message })
        };
    }
};
