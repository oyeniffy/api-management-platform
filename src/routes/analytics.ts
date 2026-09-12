import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireApiKey } from '../middleware/auth';

const router = Router();

router.get('/summary', requireApiKey, async (req: Request, res: Response) => {
  const apiKeyId = req.apiKey!.id;

  const [totalRequests, recentLogs] = await Promise.all([
    prisma.requestLog.count({ where: { apiKeyId } }),
    prisma.requestLog.findMany({
      where: { apiKeyId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  const avgResponseTime =
    recentLogs.length > 0
      ? recentLogs.reduce((sum, log) => sum + log.responseTime, 0) / recentLogs.length
      : 0;

  res.json({
    totalRequests,
    avgResponseTimeMs: Math.round(avgResponseTime),
    recentLogs,
  });
});

export default router;
