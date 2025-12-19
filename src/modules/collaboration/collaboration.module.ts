import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { TagsService } from './tags.service';
import { CommentsController } from './comments.controller';
import { TagsController } from './tags.controller';
import { PrismaModule } from '@app/common';

@Module({
    imports: [PrismaModule],
    controllers: [CommentsController, TagsController],
    providers: [CommentsService, TagsService],
})
export class CollaborationModule { }
