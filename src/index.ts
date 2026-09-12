import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clientsRouter from './routes/clients';
import protectedRouter from './routes/protected';
import analyticsRouter from './routes/analytics';
import proxyRouter from './routes/proxy';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'API Management Platform is running' });
});

app.use('/clients', clientsRouter);
app.use('/api', protectedRouter);
app.use('/analytics', analyticsRouter);
app.use('/proxy', proxyRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
