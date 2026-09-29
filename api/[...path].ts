import type { IncomingMessage, ServerResponse } from 'node:http';
import 'reflect-metadata';
import { AppService, type ProxyRequest } from '../src/app.service.js';

type VercelRequest = IncomingMessage & { body?: unknown };

const appService = new AppService();

export default async function handler(req: VercelRequest, res: ServerResponse) {
  const path = req.url || '/';
  const method = req.method || 'GET';
  console.log(`[proxy] received ${method} ${path}`);

  if (path.split('?')[0] === '/api/health') {
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(appService.getHealth()));
    return;
  }

  if (!appService.isAllowedRequest(req as ProxyRequest)) {
    console.warn(`[proxy] rejected unsupported ${method} ${path}`);
    res.statusCode = 404;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ message: 'Not found' }));
    return;
  }

  try {
    const result = await appService.proxyRequest(req as ProxyRequest);
    console.log(`[proxy] completed ${method} ${path} with upstream status ${result.status}`);

    Object.entries(result.headers).forEach(([key, value]) => {
      if (value) {
        res.setHeader(key, value);
      }
    });

    res.statusCode = result.status || 200;
    res.end(typeof result.body === 'string' ? result.body : JSON.stringify(result.body));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[proxy] failed ${method} ${path}: ${message}`);
    res.statusCode = 502;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ message: 'VTEX upstream request failed' }));
  }
}