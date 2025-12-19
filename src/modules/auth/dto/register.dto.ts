import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    @MaxLength(100, { message: 'Password must not exceed 100 characters' })
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    @MinLength(2, { message: 'Name must be at least 2 characters' })
    @MaxLength(100, { message: 'Name must not exceed 100 characters' })
    name: string;

    @IsString()
    @IsNotEmpty({ message: 'Organization Name is required' })
    @MinLength(2, { message: 'Organization Name must be at least 2 characters' })
    @MaxLength(100, { message: 'Organization Name must not exceed 100 characters' })
    organizationName: string;
}
