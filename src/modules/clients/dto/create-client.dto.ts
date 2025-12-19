import { IsString, IsNotEmpty, IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateClientDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsOptional()
    email?: string; // Optional contact email

    @IsPhoneNumber()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    currency?: string; // e.g. "USD", "EUR"
}
