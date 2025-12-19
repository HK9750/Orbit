import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { Public, ApiResponse, ApiResponseUtil, CurrentUser } from '@app/common';
import type { User } from '@app/common/prisma';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @Public()
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto): Promise<ApiResponse<TokenResponseDto>> {
        const tokens = await this.authService.login(loginDto);
        return ApiResponseUtil.success(tokens, 'Login successful', HttpStatus.OK);
    }

    @Post('register')
    @Public()
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: RegisterDto): Promise<ApiResponse<TokenResponseDto>> {
        const tokens = await this.authService.register(registerDto);
        return ApiResponseUtil.success(tokens, 'Registration successful', HttpStatus.CREATED);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@CurrentUser() user: User): Promise<ApiResponse<TokenResponseDto>> {
        const tokens = await this.authService.refresh(user.id);
        return ApiResponseUtil.success(tokens, 'Refresh successful', HttpStatus.OK);
    }
}
