import { Router, Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { requireApiKey } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { requestLogger } from '../middleware/requestLogger';

const router = Router();

router.use(
  '/',
  requireApiKey,
  requestLogger,
  rateLimit,
  (req: Request, res: Response, next: NextFunction) => {
    const baseUrl = req.apiKey?.baseUrl;

    if (!baseUrl) {
      return res.status(400).json({
        error: 'This client has no baseUrl configured. Set one via PATCH /clients/:id.',
      });
    }

    const proxy = createProxyMiddleware({
      target: baseUrl,
      changeOrigin: true,
      pathRewrite: { '^/proxy': '' },
    });

    proxy(req, res, next);
  }
);

export default router;
