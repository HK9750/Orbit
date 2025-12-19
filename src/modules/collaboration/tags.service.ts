import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(orgId: string, createDto: CreateTagDto) {
        // Check duplication
        const existing = await this.prisma.tag.findUnique({
            where: { organizationId_name: { organizationId: orgId, name: createDto.name } }
        });

        if (existing) throw new ConflictException('Tag already exists');

        return this.prisma.tag.create({
            data: {
                ...createDto,
                organizationId: orgId
            }
        });
    }

    async findAll(orgId: string) {
        return this.prisma.tag.findMany({
            where: { organizationId: orgId },
            orderBy: { name: 'asc' }
        });
    }
}
