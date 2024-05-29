import { Global, Module } from "@nestjs/common";
import { UserService } from "./services";

@Global()
@Module({
    controllers: [],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule { }