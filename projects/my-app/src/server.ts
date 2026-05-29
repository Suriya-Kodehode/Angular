import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import type { Request } from 'express';
import express from 'express';
import { join } from 'node:path';
import { API_PREFIX, API_PREFIX_REGEX } from './app/shared/constants/regex.constants';

const browserDistFolder = join(import.meta.dirname, '../browser');
const apiBaseUrl = process.env['API_BASE_URL'] ?? 'http://localhost:3000';

const app = express();
const angularApp = new AngularNodeAppEngine();

function getForwardHeaders(req: Request): Headers {
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (!value || key.toLowerCase() === 'host') {
      continue;
    }

    headers.set(key, Array.isArray(value) ? value.join(',') : value);
  }

  return headers;
}

async function readRawBody(req: Request): Promise<BodyInit | undefined> {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return undefined;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req as AsyncIterable<Buffer | string>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return chunks.length ? Buffer.concat(chunks) : undefined;
}

app.all(`${API_PREFIX}/{*splat}`, async (req, res, next) => {
  try {
    const body = await readRawBody(req);
    const targetUrl = new URL(req.originalUrl.replace(API_PREFIX_REGEX, '') || '/', apiBaseUrl);

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: getForwardHeaders(req),
      body: body ?? null,
    });

    upstream.headers.forEach((value, key) => {
      const normalized = key.toLowerCase();
      if (normalized === 'connection' || normalized === 'transfer-encoding') {
        return;
      }

      res.setHeader(key, value);
    });

    res.status(upstream.status).send(Buffer.from(await upstream.arrayBuffer()));
  } catch (error: unknown) {
    next(error);
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
