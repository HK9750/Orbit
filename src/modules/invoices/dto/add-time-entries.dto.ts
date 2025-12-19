import { IsArray, IsUUID, IsNotEmpty } from 'class-validator';

export class AddTimeEntriesToInvoiceDto {
    @IsArray()
    @IsUUID('4', { each: true })
    @IsNotEmpty()
    timeEntryIds: string[];
}
