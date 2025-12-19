import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProjectStatus } from '@app/common/prisma';

export class UpdateProjectStatusDto {
    @IsEnum(ProjectStatus)
    @IsNotEmpty()
    status: ProjectStatus;
}
