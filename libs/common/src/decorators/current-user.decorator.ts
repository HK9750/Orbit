import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface ICurrentUser {
    id: string;
    email: string;
    role: string;
}

export const CurrentUser = createParamDecorator(
    (data: keyof ICurrentUser | undefined, ctx: ExecutionContext): ICurrentUser | unknown => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as ICurrentUser;

        if (!user) {
            return null;
        }

        return data ? user[data] : user;
    },
);
