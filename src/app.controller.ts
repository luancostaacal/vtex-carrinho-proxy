import { All, Controller, Get, HttpStatus, Logger, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @All('*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    const path = req.originalUrl || req.url || '/';
    this.logger.log(`Received ${req.method} ${path}`);

    if (!this.appService.isAllowedRequest(req)) {
      this.logger.warn(`Rejected unsupported ${req.method} ${path}`);
      res.status(HttpStatus.NOT_FOUND).send({ message: 'Not found' });
      return;
    }

    try {
      const result = await this.appService.proxyRequest(req);
      this.logger.log(`Completed ${req.method} ${path} with upstream status ${result.status}`);

      Object.entries(result.headers).forEach(([key, value]) => {
        if (value) {
          res.setHeader(key, value);
        }
      });

      res.status(result.status || HttpStatus.OK);
      res.send(result.body);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Proxy failed for ${req.method} ${path}: ${message}`);
      res.status(HttpStatus.BAD_GATEWAY).json({ message: 'VTEX upstream request failed' });
    }
  }
}
