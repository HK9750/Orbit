import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { StartTimeEntryDto } from './dto/start-time-entry.dto';

@Injectable()
export class TimeEntriesService {
    constructor(private readonly prisma: PrismaService) { }

    async startTimer(orgId: string, memberUserId: string, taskId: string, dto: StartTimeEntryDto) {
        return this.prisma.$transaction(async (tx) => {
            // Find member ID
            const member = await tx.organizationMember.findUnique({
                where: { userId_organizationId: { userId: memberUserId, organizationId: orgId } }
            });
            if (!member) throw new NotFoundException('Member not found in organization');

            // Stop any currently running timer for this member
            const runningEntry = await tx.timeEntry.findFirst({
                where: { memberId: member.id, endTime: null }
            });

            if (runningEntry) {
                const now = new Date();
                const duration = Math.floor((now.getTime() - runningEntry.startTime.getTime()) / 1000);
                await tx.timeEntry.update({
                    where: { id: runningEntry.id },
                    data: { endTime: now, duration }
                });
            }

            // Start new timer
            return tx.timeEntry.create({
                data: {
                    ...dto,
                    taskId,
                    memberId: member.id,
                    startTime: new Date()
                }
            });
        });
    }

    async stopTimer(orgId: string, memberUserId: string, entryId: string) {
        return this.prisma.$transaction(async (tx) => {
            const entry = await tx.timeEntry.findUnique({
                where: { id: entryId },
                include: { member: true }
            });

            if (!entry) throw new NotFoundException('Time entry not found');
            if (entry.member.userId !== memberUserId) throw new ConflictException('Not your time entry');
            if (entry.endTime) throw new ConflictException('Timer already stopped');

            const now = new Date();
            const duration = Math.floor((now.getTime() - entry.startTime.getTime()) / 1000);

            return tx.timeEntry.update({
                where: { id: entryId },
                data: { endTime: now, duration }
            });
        });
    }

    async getMyEntries(orgId: string, memberUserId: string, page: number = 1, limit: number = 20) {
        const member = await this.prisma.organizationMember.findUnique({
            where: { userId_organizationId: { userId: memberUserId, organizationId: orgId } }
        });
        if (!member) throw new NotFoundException('Member not found');

        const skip = (page - 1) * limit;
        const [entries, total] = await Promise.all([
            this.prisma.timeEntry.findMany({
                where: { memberId: member.id },
                include: { task: { select: { id: true, title: true, project: { select: { name: true } } } } },
                skip,
                take: limit,
                orderBy: { startTime: 'desc' }
            }),
            this.prisma.timeEntry.count({ where: { memberId: member.id } })
        ]);

        return {
            items: entries,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }

    async getRunningTimer(orgId: string, memberUserId: string) {
        const member = await this.prisma.organizationMember.findUnique({
            where: { userId_organizationId: { userId: memberUserId, organizationId: orgId } }
        });

        if (!member) return null;

        return this.prisma.timeEntry.findFirst({
            where: { memberId: member.id, endTime: null },
            include: { task: true }
        });
    }
}
