import { HttpStatus } from '@nestjs/common';

export interface ApiResponse<T = null> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
}

export class ApiResponseUtil {
    static success<T>(data: T, message: string, statusCode: number = HttpStatus.OK): ApiResponse<T> {
        return {
            success: true,
            statusCode,
            message,
            data,
        };
    }

    static error(message: string, statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR): ApiResponse<null> {
        return {
            success: false,
            statusCode,
            message,
            data: null,
        };
    }
}
