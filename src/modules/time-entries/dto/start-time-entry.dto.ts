import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class StartTimeEntryDto {
    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsOptional()
    isBillable?: boolean;
}
