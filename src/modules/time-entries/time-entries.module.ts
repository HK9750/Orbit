import { Module } from '@nestjs/common';
import { TimeEntriesService } from './time-entries.service';
import { TimeEntriesController } from './time-entries.controller';
import { PrismaModule } from '@app/common';

@Module({
    imports: [PrismaModule],
    controllers: [TimeEntriesController],
    providers: [TimeEntriesService],
})
export class TimeEntriesModule { }
