import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { AppService, type ProxyRequest } from './app.service.js';

type VercelRequest = IncomingMessage & { body?: unknown };

const appService = new AppService();
const logger = new Logger('VercelProxy');

export default async function handler(req: VercelRequest, res: ServerResponse) {
  const path = req.url || '/';
  const method = req.method || 'GET';
  logger.log(`Received ${method} ${path}`);

  if (!appService.isAllowedRequest(req as ProxyRequest)) {
    logger.warn(`Rejected unsupported ${method} ${path}`);
    res.statusCode = 404;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ message: 'Not found' }));
    return;
  }

  try {
    const result = await appService.proxyRequest(req as ProxyRequest);
    logger.log(`Completed ${method} ${path} with upstream status ${result.status}`);

    Object.entries(result.headers).forEach(([key, value]) => {
      if (value) {
        res.setHeader(key, value);
      }
    });

    res.statusCode = result.status || 200;
    res.end(typeof result.body === 'string' ? result.body : JSON.stringify(result.body));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Proxy failed for ${method} ${path}: ${message}`);
    res.statusCode = 502;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ message: 'VTEX upstream request failed' }));
  }
}