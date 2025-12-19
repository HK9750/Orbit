import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(orgId: string, memberUserId: string, taskId: string, createDto: CreateCommentDto) {
        // Verify Member
        const member = await this.prisma.organizationMember.findUnique({
            where: { userId_organizationId: { userId: memberUserId, organizationId: orgId } }
        });
        if (!member) throw new ForbiddenException('You are not a member of this organization');

        // Verify Task
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true }
        });
        if (!task || task.project.organizationId !== orgId) throw new NotFoundException('Task not found');

        return this.prisma.comment.create({
            data: {
                content: createDto.content,
                taskId,
                authorId: member.id
            },
            include: { author: { include: { user: true } } }
        });
    }

    async findAll(taskId: string) {
        return this.prisma.comment.findMany({
            where: { taskId },
            include: { author: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } } },
            orderBy: { createdAt: 'asc' }
        });
    }

    async remove(orgId: string, memberUserId: string, commentId: string) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId },
            include: { author: true }
        });
        if (!comment) throw new NotFoundException('Comment not found');

        // Check ownership
        if (comment.author.userId !== memberUserId) {
            // Allow admin/owner override? For now strict ownership
            throw new ForbiddenException('Cannot delete others comments');
        }

        return this.prisma.comment.delete({ where: { id: commentId } });
    }
}
