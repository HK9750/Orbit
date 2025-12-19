import { SetMetadata } from '@nestjs/common';
import { MemberRole } from '@app/common/prisma';
import { ORG_ROLES_KEY } from '@app/common';

export const OrgRoles = (...roles: MemberRole[]) => SetMetadata(ORG_ROLES_KEY, roles);
