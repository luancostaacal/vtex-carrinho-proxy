var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
let AppService = class AppService {
    getHealth() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
    isAllowedRequest(req) {
        const method = (req.method ?? 'GET').toUpperCase();
        const path = new URL(req.originalUrl || req.url || '/', 'http://localhost').pathname;
        if (method === 'GET') {
            return path === '/api/checkout/pub/orderForm';
        }
        if (method === 'PATCH') {
            return /^\/api\/checkout\/pub\/orderForm\/[^/]+\/items$/.test(path);
        }
        if (method === 'POST') {
            return /^\/api\/checkout\/pub\/orderForm\/[^/]+\/attachments\/marketingData$/.test(path);
        }
        return false;
    }
    async proxyRequest(req) {
        const baseUrl = process.env.VTEX_BASE_URL ?? 'https://lojaacal.vtexcommercestable.com.br';
        const appKey = process.env.VTEX_APP_KEY ?? 'vtexappkey-lojaacal-YIMPVD';
        const appToken = process.env.VTEX_APP_TOKEN?.trim();
        const targetUrl = new URL(req.originalUrl || req.url || '/', `${baseUrl.replace(/\/$/, '')}/`);
        const requestHeaders = {};
        Object.entries(req.headers).forEach(([key, value]) => {
            if (value === undefined ||
                ['host', 'connection', 'content-length', 'x-vtex-api-appkey', 'x-vtex-api-apptoken'].includes(key.toLowerCase())) {
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
        let body = text;
        try {
            body = JSON.parse(text);
        }
        catch {
        }
        const headers = {};
        response.headers.forEach((value, key) => {
            if (!['content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
                headers[key] = value;
            }
        });
        return { status: response.status, headers, body };
    }
};
AppService = __decorate([
    Injectable()
], AppService);
export { AppService };
//# sourceMappingURL=app.service.js.map