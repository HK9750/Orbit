import { IsString, IsNotEmpty, IsUUID, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class CreateInvoiceDto {
    @IsUUID()
    @IsNotEmpty()
    clientId: string;

    @IsDateString()
    @IsNotEmpty()
    dueDate: string;

    @IsNumber()
    @IsOptional()
    taxRate?: number; // percentage, e.g., 20 for 20%

    @IsString()
    @IsOptional()
    currency?: string;
}
