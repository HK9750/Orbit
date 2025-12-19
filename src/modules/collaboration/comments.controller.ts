import { Controller, Get, Post, Body, Param, Delete, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard, ApiResponseUtil, ApiResponse, CurrentUser, ICurrentUser } from '@app/common';
import { OrganizationRoleGuard } from '@app/common/guards/organization-role.guard';

@Controller('organizations/:orgId')
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post('tasks/:taskId/comments')
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Param('orgId') orgId: string,
        @Param('taskId') taskId: string,
        @CurrentUser() user: ICurrentUser,
        @Body() dto: CreateCommentDto
    ): Promise<ApiResponse<any>> {
        const result = await this.commentsService.create(orgId, user.id, taskId, dto);
        return ApiResponseUtil.success(result, 'Comment added');
    }

    @Get('tasks/:taskId/comments')
    async findAll(@Param('taskId') taskId: string): Promise<ApiResponse<any>> {
        const result = await this.commentsService.findAll(taskId);
        return ApiResponseUtil.success(result, 'Comments retrieved');
    }

    @Delete('comments/:commentId')
    async remove(
        @Param('orgId') orgId: string,
        @Param('commentId') commentId: string,
        @CurrentUser() user: ICurrentUser
    ): Promise<ApiResponse<any>> {
        await this.commentsService.remove(orgId, user.id, commentId);
        return ApiResponseUtil.success(null, 'Comment deleted');
    }
}
