import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TimeEntriesModule } from './modules/time-entries/time-entries.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { SearchModule } from './modules/search/search.module';
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
        ClientsModule,
        ProjectsModule,
        TasksModule,
        TimeEntriesModule,
        InvoicesModule,
        CollaborationModule,
        SearchModule,
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
