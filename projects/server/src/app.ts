import express from 'express';

const app = express();

// ─── Global middleware ────────────────────────────────────────────────────────
app.use(express.json());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
// app.use('/api/users', userRouter);

// ─── Error-handling middleware (must be registered last) ─────────────────────
// app.use(errorMiddleware);

export default app;
