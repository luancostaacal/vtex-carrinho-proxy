"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
let AppService = class AppService {
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
    async proxyRequest(req) {
        const baseUrl = process.env.VTEX_BASE_URL ?? 'https://lojaacal.vtexcommercestable.com.br';
        const appKey = process.env.VTEX_APP_KEY ?? 'vtexappkey-lojaacal-YIMPVD';
        const appToken = process.env.VTEX_APP_TOKEN ?? '';
        const originalUrl = req.originalUrl || req.url || '/';
        const path = originalUrl.startsWith('/proxy')
            ? originalUrl.replace(/^\/proxy/, '') || '/'
            : originalUrl;
        const targetUrl = new URL(path, `${baseUrl.replace(/\/$/, '')}/`);
        const requestHeaders = {};
        Object.entries(req.headers).forEach(([key, value]) => {
            if (value === undefined ||
                key === 'host' ||
                key === 'connection' ||
                key === 'content-length') {
                return;
            }
            const normalizedValue = Array.isArray(value) ? value.join(',') : value;
            requestHeaders[key] = normalizedValue;
        });
        requestHeaders['x-vtex-api-appkey'] = appKey;
        if (appToken) {
            requestHeaders['x-vtex-api-apptoken'] = appToken;
        }
        const hasBody = !['GET', 'HEAD'].includes(req.method.toUpperCase());
        const response = await fetch(targetUrl.toString(), {
            method: req.method,
            headers: requestHeaders,
            body: hasBody ? JSON.stringify(req.body ?? {}) : undefined,
        });
        const text = await response.text();
        let payload = text;
        try {
            payload = JSON.parse(text);
        }
        catch {
        }
        const headers = {};
        response.headers.forEach((value, key) => {
            if (!['content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
                headers[key] = value;
            }
        });
        return {
            status: response.status,
            headers,
            body: payload,
        };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);
//# sourceMappingURL=app.service.js.map