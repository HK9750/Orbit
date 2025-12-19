import {
    Controller,
    Get,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    HttpStatus,
    HttpCode,
    NotFoundException,
    Query,
    Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CurrentUser, ICurrentUser, Roles, RolesGuard, ApiResponse, ApiResponseUtil, JwtAuthGuard } from '@app/common';
import { UserRole } from '@app/common/prisma';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async findAll(@Query("page") page: number, @Query("limit") limit: number): Promise<ApiResponse<UserResponseDto[]>> {
        const users = await this.usersService.findAll(page, limit);
        const data = users.map((user) => new UserResponseDto(user));
        return ApiResponseUtil.success(data, 'Users retrieved successfully', HttpStatus.OK);
    }

    @Get('me')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async getProfile(@CurrentUser() user: ICurrentUser): Promise<ApiResponse<any>> {
        const profile = await this.usersService.findWithMemberships(user.id);
        return ApiResponseUtil.success(profile, 'User profile retrieved');
    }

    @Patch('me')
    @UseGuards(JwtAuthGuard)
    async updateProfile(
        @CurrentUser() user: ICurrentUser,
        @Body() dto: UpdateProfileDto
    ): Promise<ApiResponse<any>> {
        const result = await this.usersService.updateProfile(user.id, dto);
        return ApiResponseUtil.success(result, 'Profile updated');
    }

    @Patch('me/password')
    @UseGuards(JwtAuthGuard)
    async updatePassword(
        @CurrentUser() user: ICurrentUser,
        @Body() dto: UpdatePasswordDto
    ): Promise<ApiResponse<any>> {
        await this.usersService.updatePassword(user.id, dto);
        return ApiResponseUtil.success(null, 'Password updated');
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async findOne(@Param('id') id: string): Promise<ApiResponse<UserResponseDto>> {
        const user = await this.usersService.findById(id);
        const data = new UserResponseDto(user);
        return ApiResponseUtil.success(data, 'User retrieved successfully', HttpStatus.OK);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<ApiResponse<UserResponseDto>> {
        const user = await this.usersService.update(id, updateUserDto);
        const data = new UserResponseDto(user);
        return ApiResponseUtil.success(data, 'User updated successfully', HttpStatus.OK);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
        await this.usersService.remove(id);
        return ApiResponseUtil.success(null, 'User deleted successfully', HttpStatus.OK);
    }
}
