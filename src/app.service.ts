import { Injectable } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';

export interface ProxyRequest {
  method?: string;
  url?: string;
  originalUrl?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

@Injectable()
export class AppService {
  getHealth(): Record<string, string> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  isAuthorized(req: ProxyRequest): boolean {
    const expectedToken = process.env.PROXY_SHARED_SECRET;
    const suppliedToken = req.headers['x-proxy-token'];

    if (!expectedToken || typeof suppliedToken !== 'string') {
      return false;
    }

    const expected = Buffer.from(expectedToken);
    const supplied = Buffer.from(suppliedToken);
    return expected.length === supplied.length && timingSafeEqual(expected, supplied);
  }

  async proxyRequest(req: ProxyRequest): Promise<{
    status: number;
    headers: Record<string, string>;
    body: unknown;
  }> {
    const baseUrl =
      process.env.VTEX_BASE_URL ?? 'https://lojaacal.vtexcommercestable.com.br';
    const appKey = process.env.VTEX_APP_KEY ?? 'vtexappkey-lojaacal-YIMPVD';
    const appToken = process.env.VTEX_APP_TOKEN?.trim();
    const targetUrl = new URL(req.originalUrl || req.url || '/', `${baseUrl.replace(/\/$/, '')}/`);
    const requestHeaders: Record<string, string> = {};

    Object.entries(req.headers).forEach(([key, value]) => {
      if (
        value === undefined ||
        ['host', 'connection', 'content-length', 'x-vtex-api-appkey', 'x-vtex-api-apptoken'].includes(key.toLowerCase())
      ) {
        return;
      }

      requestHeaders[key] = Array.isArray(value) ? value.join(',') : value;
    });

    requestHeaders['x-vtex-api-appkey'] = appKey;
    if (appToken) {
      requestHeaders['x-vtex-api-apptoken'] = appToken;
    }

    const method = req.method ?? 'GET';
    const hasBody = !['GET', 'HEAD'].includes(method.toUpperCase());
    const response = await fetch(targetUrl.toString(), {
      method,
      headers: requestHeaders,
      body: hasBody ? JSON.stringify(req.body ?? {}) : undefined,
    });

    const text = await response.text();
    let body: unknown = text;
    try {
      body = JSON.parse(text);
    } catch {
      // Preserve non-JSON VTEX responses as text.
    }

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      if (!['content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    return { status: response.status, headers, body };
  }
}
