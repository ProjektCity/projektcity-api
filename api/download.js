export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
  
    const apiKey = process.env.CURSEFORGE_API_KEY;
    const projectId = "782396";
  
    const url = `https://api.curseforge.com/v1/mods/${projectId}`;
  
    try {
      const response = await fetch(url, {
        headers: {
          "x-api-key": apiKey
        }
      });
  
      if (!response.ok) {
        return res.status(response.status).json({
          error: "An error occurred while fetching data from CurseForge"
        });
      }
  
      const data = await response.json();
      const downloads = data.data?.downloadCount ?? null;
  
      res.status(200).json({ downloads });
  
    } catch (error) {
      res.status(500).json({
        error: "Server Error",
        details: error.message
      });
    }
  }
  