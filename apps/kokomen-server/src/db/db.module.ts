import { Module } from "@nestjs/common";
import { DbService } from "./db.service";
import dbConfig from "src/config/db.config";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule.forFeature(dbConfig)],
  providers: [DbService]
})
export class DbModule {}
