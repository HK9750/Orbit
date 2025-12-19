import { Controller, Get, Param, Query, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard, ApiResponseUtil, ApiResponse } from '@app/common';
import { OrganizationRoleGuard } from '@app/common/guards/organization-role.guard';

@Controller('organizations/:orgId/search')
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Get()
    async search(
        @Param('orgId') orgId: string,
        @Query('q') query: string
    ): Promise<ApiResponse<any>> {
        const result = await this.searchService.search(orgId, query);
        return ApiResponseUtil.success(result, 'Search results retrieved');
    }
}
