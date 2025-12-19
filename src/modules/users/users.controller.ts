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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { CurrentUser, ICurrentUser, Roles, RolesGuard, ApiResponse, ApiResponseUtil } from '@app/common';
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
    async getProfile(@CurrentUser() user: ICurrentUser): Promise<ApiResponse<any>> {
        const userData = await this.usersService.findWithMemberships(user.id);
        const data = userData; // Return full structure including memberships
        return ApiResponseUtil.success(data, 'Profile retrieved successfully', HttpStatus.OK);
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
