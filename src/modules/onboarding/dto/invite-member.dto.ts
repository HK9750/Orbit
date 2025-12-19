import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { MemberRole } from '@app/common/prisma';

export class InviteMemberDto {
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Organization ID is required' })
    organizationId: string;

    @IsEnum(MemberRole)
    @IsOptional()
    role?: MemberRole;
}
