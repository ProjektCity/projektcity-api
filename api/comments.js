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

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL_COMMENTS;
    console.log("Webhook URL:", process.env.DISCORD_WEBHOOK_URL_COMMENTS);


    const payload = {
        content: `💬 **New Comment!**\n\n📝 **Message of user:** ${commentText}\n👤 **Name of user:** ${name}\n📧 **Email of user:** ${email || 'Not provided'}`
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(500).json({ error: 'Webhook error' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Unexpected error' });
    }
}