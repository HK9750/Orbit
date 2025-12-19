import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AddInvoiceItemDto } from './dto/add-invoice-item.dto';
import { AddTimeEntriesToInvoiceDto } from './dto/add-time-entries.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { JwtAuthGuard, ApiResponseUtil, ApiResponse, CurrentUser, ICurrentUser } from '@app/common';
import { OrganizationRoleGuard } from '@app/common/guards/organization-role.guard';

@Controller('organizations/:orgId/invoices')
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Param('orgId') orgId: string,
        @CurrentUser() user: ICurrentUser,
        @Body() createDto: CreateInvoiceDto
    ): Promise<ApiResponse<any>> {
        const result = await this.invoicesService.create(orgId, user.id, createDto);
        return ApiResponseUtil.success(result, 'Invoice created');
    }

    @Post(':invoiceId/items')
    async addItem(
        @Param('orgId') orgId: string,
        @Param('invoiceId') invoiceId: string,
        @Body() dto: AddInvoiceItemDto
    ): Promise<ApiResponse<any>> {
        const result = await this.invoicesService.addItem(orgId, invoiceId, dto);
        return ApiResponseUtil.success(result, 'Item added to invoice');
    }

    @Post(':invoiceId/time-entries')
    async addTime(
        @Param('orgId') orgId: string,
        @Param('invoiceId') invoiceId: string,
        @Body() dto: AddTimeEntriesToInvoiceDto
    ): Promise<ApiResponse<any>> {
        const result = await this.invoicesService.addTimeEntries(orgId, invoiceId, dto);
        return ApiResponseUtil.success(result, 'Time entries added to invoice');
    }

    @Get()
    async findAll(
        @Param('orgId') orgId: string,
        @Query('page') page: number,
        @Query('limit') limit: number
    ): Promise<ApiResponse<any>> {
        const result = await this.invoicesService.findAll(orgId, +page || 1, +limit || 20);
        return ApiResponseUtil.success(result, 'Invoices retrieved');
    }

    @Get(':invoiceId')
    // This route needs to be nested to use OrganizationRoleGuard correctly or we need to pass orgId in params via frontend
    // The controller prefix is organizations/:orgId/invoices, so :invoiceId here means /organizations/:orgId/invoices/:invoiceId
    // which is correct.
    async findOne(
        @Param('orgId') orgId: string,
        @Param('invoiceId') invoiceId: string
    ): Promise<ApiResponse<any>> {
        const result = await this.invoicesService.findOne(orgId, invoiceId);
        return ApiResponseUtil.success(result, 'Invoice details retrieved');
    }

    @Patch(':invoiceId/status')
    async updateStatus(
        @Param('orgId') orgId: string,
        @Param('invoiceId') invoiceId: string,
        @Body() dto: UpdateInvoiceStatusDto
    ): Promise<ApiResponse<any>> {
        const result = await this.invoicesService.updateStatus(orgId, invoiceId, dto.status);
        return ApiResponseUtil.success(result, 'Invoice status updated');
    }
}
