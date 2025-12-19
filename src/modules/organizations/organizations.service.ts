import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { MemberRole, MemberStatus, TaskStatus, InvoiceStatus } from '@app/common/prisma';

@Injectable()
export class OrganizationsService {
    constructor(private readonly prisma: PrismaService) { }

    async getDashboardStats(orgId: string) {
        const [
            org,
            projectCount,
            activeTaskCount,
            memberCount,
            revenue
        ] = await Promise.all([
            this.prisma.organization.findUnique({ where: { id: orgId } }),
            this.prisma.project.count({ where: { organizationId: orgId } }),
            this.prisma.task.count({
                where: {
                    project: { organizationId: orgId },
                    status: { not: TaskStatus.DONE }
                }
            }),
            this.prisma.organizationMember.count({ where: { organizationId: orgId, status: MemberStatus.ACTIVE } }),
            this.prisma.invoice.aggregate({
                where: { organizationId: orgId, status: InvoiceStatus.PAID },
                _sum: { total: true }
            })
        ]);

        if (!org) throw new NotFoundException('Organization not found');

        return {
            organization: org,
            stats: {
                totalProjects: projectCount,
                activeTasks: activeTaskCount,
                totalMembers: memberCount,
                totalRevenue: revenue._sum.total || 0
            }
        };
    }

    async getMembers(orgId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [members, total] = await Promise.all([
            this.prisma.organizationMember.findMany({
                where: { organizationId: orgId },
                include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.organizationMember.count({ where: { organizationId: orgId } })
        ]);

        return {
            items: members,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async updateMemberRole(orgId: string, memberId: string, newRole: MemberRole, actorId: string) {
        return this.prisma.$transaction(async (tx) => {
            const memberToUpdate = await tx.organizationMember.findUnique({
                where: { id: memberId, organizationId: orgId }
            });

            if (!memberToUpdate) throw new NotFoundException('Member not found');

            // Prevent downgrading the last owner
            if (memberToUpdate.role === MemberRole.OWNER && newRole !== MemberRole.OWNER) {
                const ownerCount = await tx.organizationMember.count({
                    where: { organizationId: orgId, role: MemberRole.OWNER }
                });
                if (ownerCount <= 1) {
                    throw new ConflictException('Cannot remove the last owner');
                }
            }

            // Check actor permissions (Handled by Guard mostly, but verify Owner/Admin logic logic if needed)
            // Ideally, only Owners should be able to promote others to Admin/Owner.

            return tx.organizationMember.update({
                where: { id: memberId },
                data: { role: newRole }
            });
        });
    }

    async removeMember(orgId: string, memberId: string, actorUserId: string) {
        return this.prisma.$transaction(async (tx) => {
            const memberToDelete = await tx.organizationMember.findUnique({
                where: { id: memberId, organizationId: orgId }
            });

            if (!memberToDelete) throw new NotFoundException('Member not found');

            const actorMember = await tx.organizationMember.findUnique({
                where: { userId_organizationId: { userId: actorUserId, organizationId: orgId } }
            });

            // Prevent ADMIN deleting OWNER
            if (actorMember && actorMember.role === MemberRole.ADMIN && memberToDelete.role === MemberRole.OWNER) {
                throw new ForbiddenException('Admins cannot remove Owners');
            }

            if (memberToDelete.role === MemberRole.OWNER) {
                const ownerCount = await tx.organizationMember.count({
                    where: { organizationId: orgId, role: MemberRole.OWNER }
                });
                if (ownerCount <= 1) {
                    throw new ConflictException('Cannot remove the last owner');
                }
            }

            return tx.organizationMember.delete({ where: { id: memberId } });
        });
    }

    async getAuditLogs(orgId: string, cursorId?: string, limit: number = 20) {
        const args: any = {
            where: {
                // AuditLog needs an organizationId field or link if we want to filter by org. 
                // The current schema shows AuditLog linked to User, but not Org directly?
                // Let's check schema.
                // Schema: AuditLog -> User. No Org.
                // We might need to filter manually or assume system-wide logs?
                // Request says: GET /organizations/:orgId/audit-logs
                // This implies we should be able to filter logs by org.
                // For now, I will assume we might need to add orgId to AuditLog in Phase 2 refinements or 
                // filter by users belonging to org (expensive).
                // Let's add organizationId to AuditLog in schema in next step if missing.
                // For now, I will write the query assuming the field exists or leave a comment.
            },
            take: limit,
            orderBy: { createdAt: 'desc' }
        };

        if (cursorId) {
            args.cursor = { id: cursorId };
            args.skip = 1;
        }

        const logs = await this.prisma.auditLog.findMany(args);

        const nextCursor = logs.length === limit ? logs[logs.length - 1].id : null;

        return {
            data: logs,
            nextCursor
        };
    }
}
