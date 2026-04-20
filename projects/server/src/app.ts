import express from 'express';

const app = express();

// ─── Global middleware ────────────────────────────────────────────────────────
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
// app.use('/api/users', userRouter);

// ─── Error-handling middleware (must be registered last) ─────────────────────
// app.use(errorMiddleware);

export default app;
