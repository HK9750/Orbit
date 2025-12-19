import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/common';

@Injectable()
export class SearchService {
    constructor(private readonly prisma: PrismaService) { }

    async search(orgId: string, query: string) {
        if (!query || query.length < 2) return { tasks: [], projects: [], clients: [] };

        const [tasks, projects, clients] = await Promise.all([
            this.prisma.task.findMany({
                where: {
                    project: { organizationId: orgId },
                    title: { contains: query, mode: 'insensitive' }
                },
                take: 5,
                select: { id: true, title: true, status: true }
            }),
            this.prisma.project.findMany({
                where: {
                    organizationId: orgId,
                    name: { contains: query, mode: 'insensitive' }
                },
                take: 5,
                select: { id: true, name: true, status: true }
            }),
            this.prisma.client.findMany({
                where: {
                    organizationId: orgId,
                    name: { contains: query, mode: 'insensitive' }
                },
                take: 5,
                select: { id: true, name: true, email: true }
            })
        ]);

        return { tasks, projects, clients };
    }
}
