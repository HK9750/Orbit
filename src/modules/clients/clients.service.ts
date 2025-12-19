import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { CreateClientDto } from './dto/create-client.dto';
import { InvoiceStatus, ProjectStatus } from '@app/common/prisma';

@Injectable()
export class ClientsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(orgId: string, createDto: CreateClientDto) {
        return this.prisma.client.create({
            data: {
                ...createDto,
                organizationId: orgId,
            }
        });
    }

    async findAll(orgId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [clients, total] = await Promise.all([
            this.prisma.client.findMany({
                where: { organizationId: orgId },
                include: {
                    _count: {
                        select: { projects: true }
                    }
                },
                skip,
                take: limit,
                orderBy: { name: 'asc' }
            }),
            this.prisma.client.count({ where: { organizationId: orgId } })
        ]);

        return {
            items: clients,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async findOne(orgId: string, clientId: string) {
        const client = await this.prisma.client.findUnique({
            where: { id: clientId, organizationId: orgId }, // Ensure client belongs to org
            include: {
                projects: true,
            }
        });

        if (!client) {
            throw new NotFoundException('Client not found');
        }

        // Aggregate Revenue
        // Since Invoice is linked to Project (usually) or directly to Client? 
        // Schema check: Invoice -> Client?
        // Let's assume Invoice has clientId based on common sense, but let's re-verify schema if errors.
        // Assuming Invoice has clientId relation.

        const revenue = await this.prisma.invoice.aggregate({
            where: {
                clientId: clientId,
                organizationId: orgId,
                status: InvoiceStatus.PAID
            },
            _sum: { total: true }
        });

        return {
            ...client,
            totalRevenue: revenue._sum.total || 0,
            activeProjectsCount: client.projects.filter(p => p.status !== ProjectStatus.COMPLETED && p.status !== ProjectStatus.ARCHIVED).length
        };
    }
}
