import { Controller, Get, Post, Body, Param, UseGuards, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { JwtAuthGuard, ApiResponseUtil, ApiResponse } from '@app/common';
import { OrganizationRoleGuard } from '@app/common/guards/organization-role.guard';

@Controller('organizations/:orgId/clients')
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Param('orgId') orgId: string,
        @Body() createDto: CreateClientDto
    ): Promise<ApiResponse<any>> {
        const result = await this.clientsService.create(orgId, createDto);
        return ApiResponseUtil.success(result, 'Client created successfully', HttpStatus.CREATED);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(
        @Param('orgId') orgId: string,
        @Query('page') page: number,
        @Query('limit') limit: number
    ): Promise<ApiResponse<any>> {
        const result = await this.clientsService.findAll(orgId, +page || 1, +limit || 20);
        return ApiResponseUtil.success(result, 'Clients retrieved successfully');
    }

    @Get(':clientId')
    @HttpCode(HttpStatus.OK)
    async findOne(
        @Param('orgId') orgId: string,
        @Param('clientId') clientId: string
    ): Promise<ApiResponse<any>> {
        const result = await this.clientsService.findOne(orgId, clientId);
        return ApiResponseUtil.success(result, 'Client details retrieved');
    }
}
