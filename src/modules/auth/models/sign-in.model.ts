import { IsString } from "class-validator";

export class SignInPayload {
    @IsString()
    username: string

    @IsString()
    password: string
}
