var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AppController_1;
import { All, Controller, Get, HttpStatus, Logger, Req, Res } from '@nestjs/common';
import { AppService } from './app.service.js';
let AppController = AppController_1 = class AppController {
    appService;
    logger = new Logger(AppController_1.name);
    constructor(appService) {
        this.appService = appService;
    }
    getHealth() {
        return this.appService.getHealth();
    }
    async proxy(req, res) {
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Proxy failed for ${req.method} ${path}: ${message}`);
            res.status(HttpStatus.BAD_GATEWAY).json({ message: 'VTEX upstream request failed' });
        }
    }
};
__decorate([
    Get('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getHealth", null);
__decorate([
    All('*'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "proxy", null);
AppController = AppController_1 = __decorate([
    Controller(),
    __metadata("design:paramtypes", [AppService])
], AppController);
export { AppController };
//# sourceMappingURL=app.controller.js.map