"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        credentials: true,
    });
    app.use((req, res, next) => {
        if (req.originalUrl && req.originalUrl.includes('/proxy')) {
            req.url = req.originalUrl.replace(/^\/proxy/, '') || '/';
        }
        next();
    });
    app.use((req, _res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            if (req.body === undefined) {
                req.body = {};
            }
        }
        next();
    });
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map