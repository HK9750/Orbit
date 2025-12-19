import { Controller, Get, Post, Body, Param, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { JwtAuthGuard, ApiResponseUtil, ApiResponse } from '@app/common';
import { OrganizationRoleGuard } from '@app/common/guards/organization-role.guard';

@Controller('organizations/:orgId/tags')
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
export class TagsController {
    constructor(private readonly tagsService: TagsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Param('orgId') orgId: string,
        @Body() dto: CreateTagDto
    ): Promise<ApiResponse<any>> {
        const result = await this.tagsService.create(orgId, dto);
        return ApiResponseUtil.success(result, 'Tag created');
    }

    @Get()
    async findAll(@Param('orgId') orgId: string): Promise<ApiResponse<any>> {
        const result = await this.tagsService.findAll(orgId);
        return ApiResponseUtil.success(result, 'Tags retrieved');
    }
}
