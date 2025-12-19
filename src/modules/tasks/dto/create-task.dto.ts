import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsArray, IsUUID } from 'class-validator';
import { TaskStatus, TaskPriority } from '@app/common/prisma';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @IsEnum(TaskPriority)
    @IsOptional()
    priority?: TaskPriority;

    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @IsArray()
    @IsUUID('4', { each: true })
    @IsOptional()
    assigneeIds?: string[];
}
