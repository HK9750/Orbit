import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class AddInvoiceItemDto {
    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @Min(0)
    quantity: number;

    @IsNumber()
    @Min(0)
    unitPrice: number;
}
