// Optional: Wenn fetch lokal nicht verfügbar ist, kannst du node-fetch importieren
// import fetch from 'node-fetch';

export default async function handler(req, res) {
    // CORS-Header setzen
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONS-Anfragen (Preflight) beantworten
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Nur POST erlauben
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Felder aus dem Body extrahieren
    const { commentText, name, email } = req.body;
    console.log("Incoming request:", req.body);

    // Pflichtfelder prüfen
    if (!commentText || !name) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    // Mindestlänge des Kommentars prüfen (mind. 20 Zeichen)
    if (commentText.length < 20) {
        return res.status(400).json({ error: 'Comment must be at least 20 characters long.' });
    }

    // Webhook-URL aus der Umgebungsvariable laden
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL_COMMENTS;
    if (!webhookUrl) {
        console.error('Missing DISCORD_WEBHOOK_URL_COMMENTS environment variable!');
        return res.status(500).json({ error: 'Server configuration error' });
    }
    console.log("Webhook URL:", webhookUrl);

    // Payload für Discord Webhook formatieren
    const payload = {
        content: `💬 **New Comment!**\n\n📝 **Message:** ${commentText}\n👤 **Name:** ${name}\n📧 **Email:** ${email || 'Not provided'}`
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Discord Webhook Error:', errorText);
            return res.status(500).json({ error: 'Webhook error', details: errorText });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Unexpected error:', err);
        return res.status(500).json({ error: err.message || 'Unexpected server error' });
    }
}
