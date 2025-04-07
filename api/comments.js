export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { commentText, name, email } = req.body;

    if (!commentText || !name) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL_COMMENT;

    if (!webhookUrl) {
        console.error('Missing Webhook URL');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const payload = {
        content: `💬 **New Comment**\n\n📝 **Comment:** ${commentText}\n👤 **Name:** ${name}\n📧 **Email:** ${email || 'Not provided'}`
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Webhook error:', text);
            return res.status(500).json({ error: 'Failed to send webhook' });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ error: 'Unexpected server error' });
    }
}
