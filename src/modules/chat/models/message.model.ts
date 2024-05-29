import { Transform } from "class-transformer"
import { IsNumber, IsOptional, IsString } from "class-validator"

export class FetchMessageQuery {
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    cursor?: number

    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    limit?: number
}
export class CreateMessagePayload {
    @IsString()
    message: string
}
