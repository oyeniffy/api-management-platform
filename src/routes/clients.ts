import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { generateApiKey } from '../utils/apiKey';

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

// Update a client's baseUrl (the backend API this client's requests get proxied to)
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

  const key = generateApiKey();

  const apiKey = await prisma.apiKey.create({
    data: {
      key,
      clientId,
      rateLimit: rateLimit || 100,
    },
  });

  res.status(201).json(apiKey);
});

export default router;
