import { Router, Request, Response } from 'express';
import { requireApiKey } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();

router.get('/ping', requireApiKey, rateLimit, (req: Request, res: Response) => {
  res.json({
    message: 'Authenticated successfully',
    clientId: req.apiKey?.clientId,
    rateLimit: req.apiKey?.rateLimit,
  });
});

export default router;
