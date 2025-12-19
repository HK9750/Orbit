import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { CryptoHelper } from '@app/common';
import type { User } from '@app/common/prisma';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async login(loginDto: LoginDto): Promise<TokenResponseDto> {
        const user = await this.usersService.findByEmail(loginDto.email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await CryptoHelper.comparePassword(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.generateTokens(user);
    }

    async register(registerDto: RegisterDto): Promise<TokenResponseDto> {
        const existingUser = await this.usersService.findByEmail(registerDto.email);

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await CryptoHelper.hashPassword(registerDto.password);

        const user = await this.usersService.createWithOrg(
            {
                ...registerDto,
                password: hashedPassword,
            },
            registerDto.organizationName,
        );

        return this.generateTokens(user);
    }

    async refresh(userId: string): Promise<TokenResponseDto> {
        const user = await this.usersService.findById(userId);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return this.generateTokens(user);
    }

    private generateTokens(user: User): TokenResponseDto {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.globalRole,
        };

        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

        return {
            accessToken,
            refreshToken,
            expiresIn: 7 * 24 * 60 * 60,
        };
    }
}
