import express from 'express';
import { corsMiddleware } from './middlewares/cors.middleware';
import { healthRouter } from './routes/health.router';

const app = express();

// ─── Global middleware ────────────────────────────────────────────────────────
app.use(express.json());
app.use(corsMiddleware);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/health', healthRouter);
app.use('/api/health', healthRouter);
// app.use('/api/users', userRouter);

// ─── Error-handling middleware (must be registered last) ─────────────────────
// app.use(errorMiddleware);

export default app;
