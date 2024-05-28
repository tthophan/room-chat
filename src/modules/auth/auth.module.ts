import { Global, Module } from "@nestjs/common";
import { AuthController } from "./controllers";
import { AuthService, SessionService } from "./services";

@Global()
@Module({
    controllers: [AuthController],
    providers: [AuthService, SessionService],
    exports: [AuthService, SessionService],
    imports: [],
})
export class AuthModule { }