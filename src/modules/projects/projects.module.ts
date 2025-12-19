import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaModule } from '@app/common';

@Module({
    imports: [PrismaModule],
    controllers: [ProjectsController],
    providers: [ProjectsService],
})
export class ProjectsModule { }
