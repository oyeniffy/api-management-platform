import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    // Only log requests that went through auth (i.e. have an apiKey attached)
    if (!req.apiKey) return;

    const responseTime = Date.now() - start;

    prisma.requestLog
      .create({
        data: {
          apiKeyId: req.apiKey.id,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          responseTime,
        },
      })
      .catch((err) => {
        console.error('Failed to write request log:', err);
      });
  });

  next();
}
