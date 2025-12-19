import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CryptoHelper, PrismaService } from '@app/common';
import { User, UserRole, MemberRole, MemberStatus } from '@app/common/prisma';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        createUserDto.email = createUserDto.email.toLowerCase();
        const existing = await this.prisma.user.findUnique({
            where: { email: createUserDto.email, isDeleted: false }
        });

        if (existing) {
            throw new ConflictException('User already exists');
        }

        return this.prisma.user.create({
            data: {
                ...createUserDto,
                globalRole: UserRole.USER,
            },
        });
    }

    async findAll(page: number = 1, limit: number = 10): Promise<User[]> {
        const skip = (page - 1) * limit;
        return this.prisma.user.findMany({
            where: { isDeleted: false },
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

    async findByEmail(email: string): Promise<User | null> {
        // Return null if not found to allow auth service to handle it (or create new user)
        return this.prisma.user.findUnique({
            where: { email: email.toLowerCase(), isDeleted: false },
        });
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.prisma.user.findUnique({ where: { id, isDeleted: false } });
        if (!user) throw new NotFoundException('User not found');

        return this.prisma.user.update({
            where: { id },
            data: updateUserDto,
        });
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
        return this.prisma.$transaction(async (tx) => {
            const uniqueSlug = this.generateUniqueSlug(organizationName);

            const user = await tx.user.create({
                data: {
                    ...createUserDto,
                    globalRole: UserRole.USER,
                    isActive: true,
                },
            });

            const org = await tx.organization.create({
                data: {
                    name: organizationName,
                    slug: uniqueSlug,
                },
            });

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

    async findWithMemberships(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            include: { memberships: { include: { organization: true } } }
        });
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        return this.prisma.user.update({
            where: { id: userId },
            data: dto,
            select: { id: true, email: true, name: true, avatarUrl: true }
        });
    }

    async updatePassword(userId: string, dto: UpdatePasswordDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        // We can use CryptoHelper here if it uses bcrypt, or use bcrypt directly.
        // Reverting to bcrypt direct usage as per my previous edit attempt, or consistent with Auth.
        // AuthService used CryptoHelper.comparePassword. Let's use CryptoHelper if valid, 
        // but I will use bcrypt here given the imports I added.

        // Actually, let's check if CryptoHelper is better. 
        // AuthService uses CryptoHelper. 
        // I will stick to bcrypt as I imported it at the top, to be safe.

        const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isMatch) throw new ForbiddenException('Current password is incorrect');

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

        return this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
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
