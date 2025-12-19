import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import {
    HttpExceptionFilter,
    LoggingInterceptor,
    TransformInterceptor,
    AppConfigService,
    API_PREFIX
} from '@app/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const appConfig = app.get(AppConfigService);

    app.setGlobalPrefix(API_PREFIX);

    app.enableCors({
        origin: appConfig.corsOrigin,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

    await app.listen(appConfig.port);

    const logger = new Logger('Bootstrap');
    logger.log(`🚀 Application is running on: http://localhost:${appConfig.port}/${API_PREFIX}`);
}

bootstrap().catch((error) => {
    console.error(error);
    process.exit(1);
});
