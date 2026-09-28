import type { Request, Response } from 'express';
import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHealth(): Record<string, string>;
    proxy(req: Request, res: Response): Promise<void>;
}
