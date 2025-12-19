import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectStatus } from '@app/common/prisma';

@Injectable()
export class ProjectsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(orgId: string, createDto: CreateProjectDto) {
        // Verify client belongs to org if provided
        if (createDto.clientId) {
            const client = await this.prisma.client.findUnique({
                where: { id: createDto.clientId, organizationId: orgId }
            });
            if (!client) {
                throw new BadRequestException('Invalid Client ID for this organization');
            }
        }

        return this.prisma.project.create({
            data: {
                ...createDto,
                organizationId: orgId,
                status: ProjectStatus.ACTIVE
            }
        });
    }

    async findAll(orgId: string, page: number = 1, limit: number = 20, status?: ProjectStatus) {
        const skip = (page - 1) * limit;
        const whereClause: any = { organizationId: orgId };
        if (status) whereClause.status = status;

        const [projects, total] = await Promise.all([
            this.prisma.project.findMany({
                where: whereClause,
                include: { client: { select: { id: true, name: true } } },
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' }
            }),
            this.prisma.project.count({ where: whereClause })
        ]);

        return {
            items: projects,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async updateStatus(orgId: string, projectId: string, status: ProjectStatus) {
        // Verify project existence and ownership
        const project = await this.prisma.project.findUnique({
            where: { id: projectId, organizationId: orgId }
        });

        if (!project) throw new NotFoundException('Project not found');

        return this.prisma.project.update({
            where: { id: projectId },
            data: { status }
        });
    }

    async getStats(orgId: string) {
        const stats = await this.prisma.project.groupBy({
            by: ['status'],
            where: { organizationId: orgId },
            _count: {
                _all: true
            }
        });

        // Format for frontend: { PLANNED: 5, IN_PROGRESS: 2 ... }
        const result: Record<string, number> = {};
        Object.values(ProjectStatus).forEach(s => result[s] = 0); // Initialize defaults

        stats.forEach(group => {
            result[group.status] = group._count._all;
        });

        return result;
    }
}
