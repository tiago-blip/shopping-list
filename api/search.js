export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { q, location } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query" });
  if (!process.env.SERPAPI_KEY) return res.status(500).json({ error: "SERPAPI_KEY not configured" });

  const params = new URLSearchParams({ engine: "google_shopping", q, api_key: process.env.SERPAPI_KEY });
  if (location) params.set("location", location);

  try {
    const response = await fetch(`https://serpapi.com/search.json?${params}`);
    const data = await response.json();
    res.status(response.ok ? 200 : response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
