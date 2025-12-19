import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@app/common';
import { MemberRole } from '@app/common/prisma';

@Injectable()
export class OrganizationRoleGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const orgId = request.params.orgId || request.body.organizationId || request.query.organizationId;

        if (!user || !orgId) {
            return false;
        }

        // Check if user is a member of the organization
        const member = await this.prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: user.id,
                    organizationId: orgId,
                },
            },
        });

        if (!member) {
            throw new ForbiddenException('You are not a member of this organization');
        }

        // Attach member to request for controller access
        request.member = member;

        // Check for required roles if specified
        const requiredRoles = this.reflector.get<MemberRole[]>('roles', context.getHandler());
        if (!requiredRoles) {
            return true;
        }

        if (!requiredRoles.includes(member.role)) {
            throw new ForbiddenException('Insufficient organization permissions');
        }

        return true;
    }
}
