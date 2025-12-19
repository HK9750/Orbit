import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { AppConfigService } from '@app/common';
import type { StringValue } from 'ms';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            inject: [AppConfigService],
            useFactory: (appConfig: AppConfigService) => ({
                secret: appConfig.jwtSecret,
                signOptions: {
                    expiresIn: appConfig.jwtExpiresIn as StringValue,
                },
            }),
        }),
        UsersModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService, JwtModule],
})
export class AuthModule { }
