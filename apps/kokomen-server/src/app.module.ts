import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { DbModule } from "./db/db.module";
import appConfig from "src/config/app.config";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver } from "@nestjs/apollo";
import { join } from "path";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || "development"}`, ".env"],
      load: [appConfig]
    }),
    DbModule,
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      typePaths: ["./**/*.graphql"],
      playground: true,
      autoSchemaFile: true,
      definitions: {
        path: join(process.cwd(), "src/graphql.ts"),
        outputAs: "class"
      }
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
