import { IsBoolean, IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    @MinLength(2, { message: 'Name must be at least 2 characters' })
    @MaxLength(100, { message: 'Name must not exceed 100 characters' })
    name?: string;

    @IsString()
    @IsOptional()
    @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
    phone?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
