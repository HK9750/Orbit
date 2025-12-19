import { IsEnum, IsNotEmpty } from 'class-validator';
import { InvoiceStatus } from '@app/common/prisma';

export class UpdateInvoiceStatusDto {
    @IsEnum(InvoiceStatus)
    @IsNotEmpty()
    status: InvoiceStatus;
}
