import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { DbModule } from "./db/db.module";
import appConfig from "src/config/app.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || "development"}`, ".env"],
      load: [appConfig]
    }),
    DbModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
