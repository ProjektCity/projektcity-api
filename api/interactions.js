// api/interactions.js
import { verifyKey } from 'discord-interactions';
import getRawBody from 'raw-body';

const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

export const config = {
  api: {
    bodyParser: false, // Wichtig: Discord erwartet RAW body
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];
  const rawBody = await getRawBody(req);

  const isValid = verifyKey(rawBody, signature, timestamp, PUBLIC_KEY);
  if (!isValid) return res.status(401).send('Invalid request signature');

  const interaction = JSON.parse(rawBody.toString());

  if (interaction.type === 1) {
    // Ping von Discord → muss beantwortet werden
    return res.status(200).json({ type: 1 });
  }

  if (interaction.type === 2) {
    // Slash Command empfangen
    const command = interaction.data.name;

    if (command === 'hello') {
      return res.status(200).json({
        type: 4,
        data: {
          content: 'Hallo von Vercel!',
        },
      });
    }
  }

  res.status(400).send('Unhandled interaction');
}