import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.switchToHttp().getRequest<Request>();
        const { method, url, body } = request;
        const userAgent = request.get('user-agent') || '';
        const ip = request.ip;

        const now = Date.now();

        this.logger.log(`[${method}] ${url} - ${ip} - ${userAgent}`);

        if (Object.keys(body || {}).length > 0) {
            const sensitizedBody = this.sanitizeBody(body);
            this.logger.debug(`Request Body: ${JSON.stringify(sensitizedBody)}`);
        }

        return next.handle().pipe(
            tap({
                next: () => {
                    const responseTime = Date.now() - now;
                    this.logger.log(`[${method}] ${url} - ${responseTime}ms`);
                },
                error: (error: Error) => {
                    const responseTime = Date.now() - now;
                    this.logger.error(`[${method}] ${url} - ${responseTime}ms - Error: ${error.message}`);
                },
            }),
        );
    }

    private sanitizeBody(body: any): any {
        if (!body) return body;
        if (typeof body !== 'object') return body;

        const sanitized = { ...body };
        const sensitiveKeys = ['password', 'token', 'access_token', 'refresh_token', 'clientSecret'];

        for (const key of Object.keys(sanitized)) {
            if (sensitiveKeys.includes(key)) {
                sanitized[key] = '***';
            } else if (typeof sanitized[key] === 'object') {
                sanitized[key] = this.sanitizeBody(sanitized[key]);
            }
        }

        return sanitized;
    }
}
