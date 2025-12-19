import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CryptoHelper, PrismaService } from '@app/common';
import { User, UserRole, MemberRole, MemberStatus } from '@app/common/prisma';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        createUserDto.email = createUserDto.email.toLowerCase();
        const whereClause = {
            email: createUserDto.email,
            isDeleted: false
        };

        const isUserExists = await this.prisma.user.findUnique({ where: whereClause });

        if (isUserExists) {
            throw new ConflictException('User already exists');
        }

        const user = await this.prisma.user.create({
            data: {
                ...createUserDto,
                globalRole: UserRole.USER,
            },
        });

        return user;
    }

    async findAll(page: number = 1, limit: number = 10): Promise<User[]> {
        const skip = (page - 1) * limit;
        return this.prisma.user.findMany({
            where: {
                isDeleted: false
            },
            skip,
            take: limit,
        });
    }

    async findById(id: string): Promise<User> {
        const user = await this.prisma.user.findUnique({ where: { id, isDeleted: false } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async findWithMemberships(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id, isDeleted: false },
            include: {
                memberships: {
                    include: {
                        organization: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase(), isDeleted: false },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        try {
            return await this.prisma.user.update({
                where: { id, isDeleted: false },
                data: updateUserDto,
            });
        } catch (error) {
            throw new NotFoundException('User not found');
        }
    }

    async remove(id: string): Promise<void> {
        try {
            await this.prisma.user.update({
                where: { id, isDeleted: false },
                data: { isDeleted: true },
            });
        } catch (error) {
            throw new NotFoundException('User not found');
        }
    }

    async createWithOrg(createUserDto: CreateUserDto, organizationName: string): Promise<User> {
        // Use transaction to ensure all or nothing
        return this.prisma.$transaction(async (tx) => {
            // 1. Generate unique slug
            const uniqueSlug = this.generateUniqueSlug(organizationName);

            // 2. Create User
            const user = await tx.user.create({
                data: {
                    ...createUserDto,
                    globalRole: UserRole.USER,
                    isActive: true,
                },
            });

            // 3. Create Organization
            const org = await tx.organization.create({
                data: {
                    name: organizationName,
                    slug: uniqueSlug,
                },
            });

            // 4. Create Membership (Owner)
            await tx.organizationMember.create({
                data: {
                    userId: user.id,
                    organizationId: org.id,
                    role: MemberRole.OWNER,
                    status: MemberStatus.ACTIVE,
                },
            });

            return user;
        });
    }

    private generateUniqueSlug(name: string): string {
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        const hash = CryptoHelper.generateRandomToken(6);
        return `${slug}-${hash}`;
    }
}
