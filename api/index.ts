import app from '../server.ts';

export default function handler(req: any, res: any) {
  console.log(`[API REQUEST] Original URL: ${req.url}, Method: ${req.method}`);
  try {
    // Normalize URL path for Express API router
    if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/uploads')) {
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
      console.log(`[API REQUEST] Normalized URL: ${req.url}`);
    } else {
      console.log(`[API REQUEST] URL Unchanged: ${req.url}`);
    }
    return (app as any)(req, res);
  } catch (err: any) {
    console.error('API Error in handler:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err?.message || 'Server error' });
    }
  }
}
