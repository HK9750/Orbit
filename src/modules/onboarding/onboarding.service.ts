import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { CryptoHelper, PrismaService } from '@app/common';
import { InviteMemberDto } from './dto/invite-member.dto';
import { MemberRole, MemberStatus } from '@app/common/prisma';
import * as crypto from 'crypto';

@Injectable()
export class OnboardingService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async inviteMember(inviteDto: InviteMemberDto, inviterUserId: string) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Verify Inviter Permissions
            const inviterMember = await tx.organizationMember.findUnique({
                where: {
                    userId_organizationId: {
                        userId: inviterUserId,
                        organizationId: inviteDto.organizationId,
                    },
                },
            });

            if (!inviterMember || (inviterMember.role !== MemberRole.OWNER && inviterMember.role !== MemberRole.ADMIN)) {
                throw new ForbiddenException('Only Admins or Owners can invite members');
            }

            // 2. Check if user exists
            const user = await tx.user.findUnique({
                where: { email: inviteDto.email.toLowerCase() },
            });

            // 3. Generate Token
            const invitationToken = CryptoHelper.genUUID();

            if (user) {
                // Case A: User exists
                const existingMember = await tx.organizationMember.findUnique({
                    where: {
                        userId_organizationId: {
                            userId: user.id,
                            organizationId: inviteDto.organizationId,
                        },
                    },
                });

                if (existingMember) {
                    if (existingMember.status === MemberStatus.PENDING) {
                        return tx.organizationMember.update({
                            where: { id: existingMember.id },
                            data: { invitationToken },
                        });
                    }
                    throw new ConflictException('User is already a member of this organization');
                }

                return tx.organizationMember.create({
                    data: {
                        userId: user.id,
                        organizationId: inviteDto.organizationId,
                        role: inviteDto.role || MemberRole.MEMBER,
                        status: MemberStatus.PENDING,
                        invitationToken,
                    },
                });
            } else {
                // Case B: User does not exist (Invite by Email)
                const existingInvite = await tx.organizationMember.findFirst({
                    where: {
                        organizationId: inviteDto.organizationId,
                        invitedEmail: inviteDto.email.toLowerCase(),
                    }
                });

                if (existingInvite) {
                    return tx.organizationMember.update({
                        where: { id: existingInvite.id },
                        data: { invitationToken },
                    });
                }

                return tx.organizationMember.create({
                    data: {
                        organizationId: inviteDto.organizationId,
                        invitedEmail: inviteDto.email.toLowerCase(),
                        role: inviteDto.role || MemberRole.MEMBER,
                        status: MemberStatus.PENDING,
                        invitationToken,
                    },
                });
            }
        });
    }

    async acceptInvite(token: string, userId: string) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Find invite by token
            const member = await tx.organizationMember.findUnique({
                where: { invitationToken: token },
            });

            if (!member) {
                throw new NotFoundException('Invalid or expired invitation token');
            }

            if (member.status === MemberStatus.ACTIVE) {
                throw new ConflictException('User is already a member of this organization');
            }

            // 2. If member was created with a userId, ensure the accepting user is the same
            if (member.userId && member.userId !== userId) {
                throw new ForbiddenException('This invite was meant for a different user');
            }

            // 3. Update status and link user
            return tx.organizationMember.update({
                where: { id: member.id },
                data: {
                    status: MemberStatus.ACTIVE,
                    invitationToken: null,
                    userId: userId,
                    invitedEmail: null,
                },
            });
        });
    }
}
