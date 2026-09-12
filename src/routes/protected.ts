import { Router, Request, Response } from 'express';
import { requireApiKey } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { requestLogger } from '../middleware/requestLogger';

const router = Router();

router.get('/ping', requireApiKey, requestLogger, rateLimit, (req: Request, res: Response) => {
  res.json({
    message: 'Authenticated successfully',
    clientId: req.apiKey?.clientId,
    rateLimit: req.apiKey?.rateLimit,
  });
});

export default router;
