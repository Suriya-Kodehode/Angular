import type { NextFunction, Request, Response } from 'express';

interface CorsConfig {
  allowedOrigins: readonly string[];
  allowedMethods: string;
  allowedHeaders: string;
}

const corsConfig: CorsConfig = {
  allowedOrigins: (process.env['CORS_ALLOWED_ORIGINS'] ?? 'http://localhost:4200')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  allowedMethods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Authorization',
};

export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.header('origin');

  if (origin && corsConfig.allowedOrigins.includes(origin)) {
    res.set({
      'Access-Control-Allow-Origin': origin,
      Vary: 'Origin',
    });
  }

  res.set({
    'Access-Control-Allow-Methods': corsConfig.allowedMethods,
    'Access-Control-Allow-Headers': corsConfig.allowedHeaders,
  });

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
}
