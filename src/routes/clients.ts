import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { generateApiKey, hashApiKey, getKeyPrefix } from '../utils/apiKey';

const router = Router();

// Register a new client
router.post('/', async (req: Request, res: Response) => {
  const { name, email, baseUrl } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  try {
    const client = await prisma.client.create({
      data: { name, email, baseUrl },
    });
    res.status(201).json(client);
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'A client with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update a client's baseUrl
router.patch('/:clientId', async (req: Request, res: Response) => {
  const { clientId } = req.params;
  const { baseUrl } = req.body;

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }

  const updated = await prisma.client.update({
    where: { id: clientId },
    data: { baseUrl },
  });

  res.json(updated);
});

// Generate a new API key for a client
router.post('/:clientId/keys', async (req: Request, res: Response) => {
  const { clientId } = req.params;
  const { rateLimit } = req.body;

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }

  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);
  const keyPrefix = getKeyPrefix(rawKey);

  const apiKey = await prisma.apiKey.create({
    data: {
      keyHash,
      keyPrefix,
      clientId,
      rateLimit: rateLimit || 100,
    },
  });

  // Return the raw key ONLY here — it's never stored or retrievable again
  res.status(201).json({
    id: apiKey.id,
    key: rawKey,
    keyPrefix,
    clientId: apiKey.clientId,
    isActive: apiKey.isActive,
    rateLimit: apiKey.rateLimit,
    createdAt: apiKey.createdAt,
  });
});

export default router;
