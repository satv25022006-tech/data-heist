import app from '../server.ts';

export default function handler(req: any, res: any) {
  try {
    return (app as any)(req, res);
  } catch (err: any) {
    console.error('API Error in catch-all handler:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Server error' });
    }
  }
}
