import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Token } from "src/token/domains/token";
import { TokenService } from "src/token/services/token.service";

@Module({
  imports: [TypeOrmModule.forFeature([Token])],
  providers: [TokenService],
  exports: [TokenService]
})
export class TokenModule {}
