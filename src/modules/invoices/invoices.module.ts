import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { PrismaModule } from '@app/common';

@Module({
    imports: [PrismaModule],
    controllers: [InvoicesController],
    providers: [InvoicesService],
})
export class InvoicesModule { }
