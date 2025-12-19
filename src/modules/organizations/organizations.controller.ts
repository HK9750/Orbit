import { Controller, Get, Param, Patch, Body, Delete, UseGuards, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard, ApiResponseUtil, ApiResponse, CurrentUser, ICurrentUser, OrgRoles } from '@app/common';
import { OrganizationRoleGuard } from '@app/common';
import { MemberRole } from '@app/common/prisma';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
    constructor(private readonly norgService: OrganizationsService) { }

    @Get(':orgId/dashboard')
    @UseGuards(OrganizationRoleGuard)
    @HttpCode(HttpStatus.OK)
    async getDashboard(@Param('orgId') orgId: string): Promise<ApiResponse<any>> {
        const stats = await this.norgService.getDashboardStats(orgId);
        return ApiResponseUtil.success(stats, 'Dashboard stats retrieved');
    }

    @Get(':orgId/members')
    @UseGuards(OrganizationRoleGuard)
    @HttpCode(HttpStatus.OK)
    async getMembers(
        @Param('orgId') orgId: string,
        @Query('page') page: number,
        @Query('limit') limit: number
    ): Promise<ApiResponse<any>> {
        const result = await this.norgService.getMembers(orgId, +page || 1, +limit || 20);
        return ApiResponseUtil.success(result, 'Members retrieved');
    }

    @Patch(':orgId/members/:memberId/role')
    @UseGuards(OrganizationRoleGuard)
    @OrgRoles(MemberRole.OWNER, MemberRole.ADMIN)
    async updateMemberRole(
        @Param('orgId') orgId: string,
        @Param('memberId') memberId: string,
        @Body() updateDto: UpdateMemberRoleDto,
        @CurrentUser() user: ICurrentUser
    ): Promise<ApiResponse<any>> {
        const result = await this.norgService.updateMemberRole(orgId, memberId, updateDto.role, user.id);
        return ApiResponseUtil.success(result, 'Member role updated');
    }

    @Delete(':orgId/members/:memberId')
    @UseGuards(OrganizationRoleGuard)
    @OrgRoles(MemberRole.OWNER, MemberRole.ADMIN)
    async removeMember(
        @Param('orgId') orgId: string,
        @Param('memberId') memberId: string,
        @CurrentUser() user: ICurrentUser
    ): Promise<ApiResponse<any>> {
        await this.norgService.removeMember(orgId, memberId, user.id);
        return ApiResponseUtil.success(null, 'Member removed');
    }

    @Get(':orgId/audit-logs')
    @UseGuards(OrganizationRoleGuard)
    async getAuditLogs(
        @Param('orgId') orgId: string,
        @Query('cursor') cursor: string,
        @Query('limit') limit: number
    ): Promise<ApiResponse<any>> {
        const result = await this.norgService.getAuditLogs(orgId, cursor, +limit || 20);
        return ApiResponseUtil.success(result, 'Audit logs retrieved');
    }
}
