import { IsOptional, IsString } from "class-validator"

export class SignUpPayload {
    @IsString()
    username: string

    @IsString()
    password: string

    @IsString()
    @IsOptional()
    firstName: string

    @IsString()
    @IsOptional()
    lastName: string
}