import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateTagDto {
    @IsString()
    @IsNotEmpty()
    @Length(2, 20)
    name: string;
}
