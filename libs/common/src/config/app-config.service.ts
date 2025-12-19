import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment, EnvironmentVariables } from '@app/common';

@Injectable()
export class AppConfigService {
    constructor(private readonly configService: ConfigService<EnvironmentVariables, true>) { }

    get nodeEnv(): Environment {
        return this.configService.get('NODE_ENV', { infer: true });
    }

    get isDevelopment(): boolean {
        return this.nodeEnv === Environment.Development;
    }

    get isProduction(): boolean {
        return this.nodeEnv === Environment.Production;
    }

    get port(): number {
        return this.configService.get('PORT', { infer: true });
    }

    get corsOrigin(): string {
        return this.configService.get('CORS_ORIGIN', { infer: true });
    }

    get databaseUrl(): string {
        return this.configService.get('DATABASE_URL', { infer: true });
    }

    get jwtSecret(): string {
        return this.configService.get('JWT_SECRET', { infer: true });
    }

    get jwtExpiresIn(): string {
        return this.configService.get('JWT_EXPIRES_IN', { infer: true });
    }
}
