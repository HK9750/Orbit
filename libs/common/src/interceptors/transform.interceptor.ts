import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { ApiResponse } from '@app/common';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
        const response = context.switchToHttp().getResponse<Response>();

        return next.handle().pipe(
            map((data) => {
                const statusCode = response.statusCode || HttpStatus.OK;

                if (this.isApiResponse(data)) {
                    return data as ApiResponse<T>;
                }

                return {
                    success: true,
                    statusCode,
                    message: this.getDefaultMessage(statusCode),
                    data: data ?? null,
                };
            }),
        );
    }

    private isApiResponse(data: unknown): boolean {
        return (
            data !== null &&
            typeof data === 'object' &&
            'success' in data &&
            'statusCode' in data &&
            'message' in data &&
            'data' in data
        );
    }

    private getDefaultMessage(statusCode: number): string {
        const messages: Record<number, string> = {
            [HttpStatus.OK]: 'Request successful',
            [HttpStatus.CREATED]: 'Resource created successfully',
            [HttpStatus.ACCEPTED]: 'Request accepted',
            [HttpStatus.NO_CONTENT]: 'Request successful',
        };

        return messages[statusCode] || 'Request successful';
    }
}
