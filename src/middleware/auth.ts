import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// Extend Express's Request type to carry our auth info
declare global {
  namespace Express {
    interface Request {
      apiKey?: {
        id: string;
        clientId: string;
        rateLimit: number;
      };
    }
  }
}

export async function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const key = req.header('X-API-Key');

  if (!key) {
    return res.status(401).json({ error: 'Missing X-API-Key header' });
  }

  const apiKey = await prisma.apiKey.findUnique({ where: { key } });

  if (!apiKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  if (!apiKey.isActive || apiKey.revokedAt) {
    return res.status(403).json({ error: 'API key has been revoked' });
  }

  req.apiKey = {
    id: apiKey.id,
    clientId: apiKey.clientId,
    rateLimit: apiKey.rateLimit,
  };

  next();
}
