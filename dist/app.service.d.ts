import type { Request } from 'express';
export declare class AppService {
    getHealth(): Record<string, string>;
    proxyRequest(req: Request): Promise<{
        status: number;
        headers: Record<string, string>;
        body: unknown;
    }>;
}
