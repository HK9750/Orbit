import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { TaskStatus } from '@app/common/prisma';

@Injectable()
export class TasksService {
    constructor(private readonly prisma: PrismaService) { }

    async create(projectId: string, createDto: CreateTaskDto) {
        // Validate Project
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project) throw new NotFoundException('Project not found');

        const { assigneeIds, ...taskData } = createDto;

        return this.prisma.$transaction(async (tx) => {
            const task = await tx.task.create({
                data: {
                    ...taskData,
                    projectId,
                    status: taskData.status || TaskStatus.TODO
                }
            });

            if (assigneeIds && assigneeIds.length > 0) {
                await tx.taskAssignee.createMany({
                    data: assigneeIds.map(memberId => ({
                        taskId: task.id,
                        memberId
                    }))
                });
            }

            return task;
        });
    }

    async findAll(projectId: string, filters: TaskFilterDto, page: number = 1, limit: number = 20) {
        const whereClause: any = { projectId };

        if (filters.status) whereClause.status = filters.status;
        if (filters.priority) whereClause.priority = filters.priority;
        if (filters.assigneeId) {
            whereClause.assignees = { some: { memberId: filters.assigneeId } };
        }

        const skip = (page - 1) * limit;

        const [tasks, total] = await Promise.all([
            this.prisma.task.findMany({
                where: whereClause,
                include: {
                    assignees: {
                        include: {
                            member: {
                                include: { user: { select: { id: true, name: true, avatarUrl: true } } }
                            }
                        }
                    },
                    tags: true
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.task.count({ where: whereClause })
        ]);

        return {
            items: tasks,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }

    async update(taskId: string, updateDto: UpdateTaskDto) {
        const { assigneeIds, ...data } = updateDto;

        return this.prisma.$transaction(async (tx) => {
            const task = await tx.task.update({
                where: { id: taskId },
                data: data
            });

            if (assigneeIds) {
                // Replace assignees
                await tx.taskAssignee.deleteMany({ where: { taskId } });
                if (assigneeIds.length > 0) {
                    await tx.taskAssignee.createMany({
                        data: assigneeIds.map((memberId: string) => ({
                            taskId: task.id,
                            memberId
                        }))
                    });
                }
            }

            return task;
        });
    }

    async remove(taskId: string) {
        return this.prisma.task.delete({ where: { id: taskId } });
    }

    async findOne(taskId: string) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                assignees: { include: { member: { include: { user: true } } } },
                tags: true,
                project: true
            }
        });
        if (!task) throw new NotFoundException('Task not found');
        return task;
    }
}
