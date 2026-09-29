import type { IncomingMessage, ServerResponse } from 'node:http';
import 'reflect-metadata';
import { AppService } from '../src/app.service.js';

const appService = new AppService();

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  res.statusCode = 200;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(appService.getHealth()));
}