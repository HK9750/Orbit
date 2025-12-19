import { Module } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule],
    controllers: [OnboardingController],
    providers: [OnboardingService],
})
export class OnboardingModule { }
