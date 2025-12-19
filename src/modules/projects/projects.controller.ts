import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { JwtAuthGuard, ApiResponseUtil, ApiResponse } from '@app/common';
import { OrganizationRoleGuard } from '@app/common/guards/organization-role.guard';
import { ProjectStatus } from '@app/common/prisma';

@Controller('organizations/:orgId/projects')
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Param('orgId') orgId: string,
        @Body() createDto: CreateProjectDto
    ): Promise<ApiResponse<any>> {
        const result = await this.projectsService.create(orgId, createDto);
        return ApiResponseUtil.success(result, 'Project created successfully', HttpStatus.CREATED);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(
        @Param('orgId') orgId: string,
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('status') status?: ProjectStatus
    ): Promise<ApiResponse<any>> {
        const result = await this.projectsService.findAll(orgId, +page || 1, +limit || 20, status);
        return ApiResponseUtil.success(result, 'Projects retrieved successfully');
    }

    @Patch(':projectId/status')
    @HttpCode(HttpStatus.OK)
    async updateStatus(
        @Param('orgId') orgId: string,
        @Param('projectId') projectId: string,
        @Body() updateDto: UpdateProjectStatusDto
    ): Promise<ApiResponse<any>> {
        const result = await this.projectsService.updateStatus(orgId, projectId, updateDto.status);
        return ApiResponseUtil.success(result, 'Project status updated');
    }

    @Get('stats')
    @HttpCode(HttpStatus.OK)
    async getStats(
        @Param('orgId') orgId: string
    ): Promise<ApiResponse<any>> {
        const result = await this.projectsService.getStats(orgId);
        return ApiResponseUtil.success(result, 'Project stats retrieved');
    }
}
