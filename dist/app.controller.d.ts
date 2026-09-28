import type { Request, Response } from 'express';
import { AppService } from './app.service.js';
export declare class AppController {
    private readonly appService;
    private readonly logger;
    constructor(appService: AppService);
    getHealth(): Record<string, string>;
    proxy(req: Request, res: Response): Promise<void>;
}
