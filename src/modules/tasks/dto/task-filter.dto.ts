import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { TaskStatus, TaskPriority } from '@app/common/prisma';

export class TaskFilterDto {
    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @IsEnum(TaskPriority)
    @IsOptional()
    priority?: TaskPriority;

    @IsUUID()
    @IsOptional()
    assigneeId?: string;
}
