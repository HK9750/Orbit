import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppConfigService, Public, ApiResponse, ApiResponseUtil } from '@app/common';

export interface HealthCheckData {
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
}

export enum HealthStatus {
    OK = 'ok',
    DEGRADED = 'degraded',
    ERROR = 'error',
}

@Controller()
export class AppController {
    constructor(private readonly appConfig: AppConfigService) { }

    @Get()
    @Public()
    @HttpCode(HttpStatus.OK)
    check(): ApiResponse<HealthCheckData> {
        const data: HealthCheckData = {
            status: HealthStatus.OK,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: this.appConfig.nodeEnv,
        };
        return ApiResponseUtil.success(data, 'API is healthy', HttpStatus.OK);
    }
}
