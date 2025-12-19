import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '@app/common';
import { Prisma } from '@app/common/prisma';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let statusCode: number;
        let message: string;

        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                const responseObj = exceptionResponse as Record<string, unknown>;
                const msg = responseObj.message;
                message = Array.isArray(msg) ? msg.join(', ') : (msg as string) || exception.message;
            } else {
                message = exception.message;
            }
        } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            const prismaError = exception as Prisma.PrismaClientKnownRequestError;
            switch (prismaError.code) {
                case 'P2002':
                    statusCode = HttpStatus.CONFLICT;
                    message = 'Unique constraint violation';
                    break;
                case 'P2025':
                    statusCode = HttpStatus.NOT_FOUND;
                    message = 'Record not found';
                    break;
                default:
                    statusCode = HttpStatus.BAD_REQUEST;
                    message = `Database error: ${prismaError.code}`;
            }
        } else if (exception instanceof Error) {
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
            message = exception.message;
        } else {
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'An unexpected error occurred';
        }

        const errorResponse: ApiResponse<null> = {
            success: false,
            statusCode,
            message,
            data: null,
        };

        this.logger.error(`[${statusCode}] ${message}`);

        response.status(statusCode).json(errorResponse);
    }
}
