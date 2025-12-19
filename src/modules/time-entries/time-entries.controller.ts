import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { TimeEntriesService } from './time-entries.service';
import { StartTimeEntryDto } from './dto/start-time-entry.dto';
import { JwtAuthGuard, ApiResponseUtil, ApiResponse, CurrentUser, ICurrentUser } from '@app/common';
import { OrganizationRoleGuard } from '@app/common/guards/organization-role.guard';

@Controller('organizations/:orgId')
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
export class TimeEntriesController {
    constructor(private readonly timeEntriesService: TimeEntriesService) { }

    @Post('tasks/:taskId/time-entries')
    @HttpCode(HttpStatus.CREATED)
    async startTimer(
        @Param('orgId') orgId: string,
        @Param('taskId') taskId: string,
        @CurrentUser() user: ICurrentUser,
        @Body() dto: StartTimeEntryDto
    ): Promise<ApiResponse<any>> {
        const result = await this.timeEntriesService.startTimer(orgId, user.id, taskId, dto);
        return ApiResponseUtil.success(result, 'Timer started');
    }

    @Patch('time-entries/:entryId/stop')
    async stopTimer(
        @Param('orgId') orgId: string,
        @Param('entryId') entryId: string,
        @CurrentUser() user: ICurrentUser
    ): Promise<ApiResponse<any>> {
        const result = await this.timeEntriesService.stopTimer(orgId, user.id, entryId);
        return ApiResponseUtil.success(result, 'Timer stopped');
    }

    @Get('time-entries/my')
    async getMyEntries(
        @Param('orgId') orgId: string,
        @CurrentUser() user: ICurrentUser,
        @Query('page') page: number,
        @Query('limit') limit: number
    ): Promise<ApiResponse<any>> {
        const result = await this.timeEntriesService.getMyEntries(orgId, user.id, +page || 1, +limit || 20);
        return ApiResponseUtil.success(result, 'Time entries retrieved');
    }

    @Get('time-entries/running')
    async getRunningTimer(
        @Param('orgId') orgId: string,
        @CurrentUser() user: ICurrentUser
    ): Promise<ApiResponse<any>> {
        const result = await this.timeEntriesService.getRunningTimer(orgId, user.id);
        return ApiResponseUtil.success(result, 'Running timer retrieved');
    }
}
