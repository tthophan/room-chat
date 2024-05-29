import { Injectable } from "@nestjs/common";
import { BaseService } from "~/core/bases";
import { PrismaService } from "~/modules/prisma";

@Injectable()
export class UserService extends BaseService {
    constructor(
        private readonly prismaService: PrismaService
    ) {
        super()
    }

    async getById(id: number) {
        return await this.prismaService.user.findUnique({
            where: {
                id
            }
        })
    }
}