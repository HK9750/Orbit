import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigService, JWT_STRATEGY } from '@app/common';
import { JwtPayload, JwtResponse } from '../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY) {
    constructor(private readonly appConfig: AppConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: appConfig.jwtSecret,
        });
    }

    async validate(payload: JwtPayload): Promise<JwtResponse> {
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
}
