import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants/app.constants';
import { UserRole } from '@app/common/prisma';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
