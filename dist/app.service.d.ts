export interface ProxyRequest {
    method?: string;
    url?: string;
    originalUrl?: string;
    headers: Record<string, string | string[] | undefined>;
    body?: unknown;
}
export declare class AppService {
    getHealth(): Record<string, string>;
    isAuthorized(req: ProxyRequest): boolean;
    proxyRequest(req: ProxyRequest): Promise<{
        status: number;
        headers: Record<string, string>;
        body: unknown;
    }>;
}
