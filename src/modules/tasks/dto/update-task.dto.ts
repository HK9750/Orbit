import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsArray, IsUUID, IsOptional } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
    @IsArray()
    @IsUUID('4', { each: true })
    @IsOptional()
    assigneeIds?: string[];
}
