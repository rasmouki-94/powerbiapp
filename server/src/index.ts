import express from 'express';
import cors from 'cors';
import { initDatabase } from './database';
import avatarsRouter from './routes/avatars';
import prospectsRouter from './routes/prospects';
import templatesRouter from './routes/templates';
import interactionsRouter from './routes/interactions';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize database then start server
initDatabase().then(() => {
  app.use('/api/avatars', avatarsRouter);
  app.use('/api/prospects', prospectsRouter);
  app.use('/api/templates', templatesRouter);
  app.use('/api/interactions', interactionsRouter);

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
