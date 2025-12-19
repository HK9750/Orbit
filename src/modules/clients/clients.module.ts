import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { PrismaModule } from '@app/common';

@Module({
    imports: [PrismaModule],
    controllers: [ClientsController],
    providers: [ClientsService],
})
export class ClientsModule { }
