import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { JwtAuthGuard, AppConfigModule, PrismaModule } from '@app/common';
import { AppController } from './app.controller';

@Module({
    imports: [
        AppConfigModule.forRoot(),
        PrismaModule,
        AuthModule,
        UsersModule,
        OnboardingModule,
        OrganizationsModule,
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule { }
