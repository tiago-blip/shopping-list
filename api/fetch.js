export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url' });

  // Always derive publisher from domain as a reliable fallback
  let publisher = '';
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    publisher = hostname.split('.')[0].replace(/^\w/, c => c.toUpperCase());
  } catch {}

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    const html = await response.text();

    const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1]
                 || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i)?.[1];
    const pageTitle = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
    const title = (ogTitle || pageTitle || '').trim().slice(0, 100);

    res.status(200).json({ title, publisher });
  } catch (err) {
    // Return at least the publisher from domain even if page fetch fails
    res.status(200).json({ title: '', publisher });
  }
}
