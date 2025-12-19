import { Exclude, Expose } from 'class-transformer';
import type { User } from '@app/common/prisma';

@Exclude()
export class UserResponseDto {
    @Expose()
    id: string;

    @Expose()
    email: string;

    @Expose()
    isActive: boolean;

    @Expose()
    createdAt: Date;

    constructor(user: User) {
        Object.assign(this, user);
    }
}
