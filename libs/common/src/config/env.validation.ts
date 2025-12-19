import { plainToInstance } from 'class-transformer';
import {
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
    validateSync,
} from 'class-validator';

export enum Environment {
    Development = 'development',
    Production = 'production',
}

export class EnvironmentVariables {
    @IsEnum(Environment)
    @IsOptional()
    NODE_ENV: Environment = Environment.Development;

    @IsNumber()
    @Min(1)
    @Max(65535)
    @IsOptional()
    PORT: number = 3001;

    @IsString()
    @IsOptional()
    CORS_ORIGIN: string = '*';

    @IsString()
    DATABASE_URL: string;

    @IsString()
    JWT_SECRET: string;

    @IsString()
    @IsOptional()
    JWT_EXPIRES_IN: string = '7d';
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false,
    });

    if (errors.length > 0) {
        const errorMessages = errors
            .map((error) => {
                const constraints = error.constraints
                    ? Object.values(error.constraints).join(', ')
                    : 'Unknown validation error';
                return `${error.property}: ${constraints}`;
            })
            .join('\n');

        throw new Error(`Environment validation failed:\n${errorMessages}`);
    }

    return validatedConfig;
}
