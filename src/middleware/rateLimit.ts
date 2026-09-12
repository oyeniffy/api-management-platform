import { Request, Response, NextFunction } from 'express';
import redis from '../lib/redis';

const WINDOW_SECONDS = 60;

export async function rateLimit(req: Request, res: Response, next: NextFunction) {
  if (!req.apiKey) {
    return res.status(500).json({ error: 'Rate limit middleware used without auth middleware' });
  }

  const { id: apiKeyId, rateLimit: limit } = req.apiKey;
  const redisKey = `ratelimit:${apiKeyId}`;

  const current = await redis.incr(redisKey);

  if (current === 1) {
    await redis.expire(redisKey, WINDOW_SECONDS);
  }

  const ttl = await redis.ttl(redisKey);

  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - current));
  res.setHeader('X-RateLimit-Reset', ttl);

  if (current > limit) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: ttl,
    });
  }

  next();
}
