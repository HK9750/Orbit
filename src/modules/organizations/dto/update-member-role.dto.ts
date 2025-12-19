import { IsEnum, IsNotEmpty } from 'class-validator';
import { MemberRole } from '@app/common/prisma';

export class UpdateMemberRoleDto {
    @IsEnum(MemberRole)
    @IsNotEmpty()
    role: MemberRole;
}
