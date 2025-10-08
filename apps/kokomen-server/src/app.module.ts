import appConfig from "src/config/app.config";
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver } from "@nestjs/apollo";
import { Member } from "./member/domains/member";
import { MemberResolver } from "./member/member.resolver";
import { MemberService } from "./member/member.service";
import { RedisModule } from "src/redis/redis.module";
import { CategoryModule } from "src/interview/modules/category";
import { RootQuestionModule } from "src/interview/modules/rootQuestion";
import { AuthModule } from "./auth/auth.module";
import { InterviewModule } from "src/resume/modules/resume.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || "development"}`, ".env"],
      load: [appConfig]
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT
        ? parseInt(process.env.DATABASE_PORT, 10)
        : 3306,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      entities: [__dirname + "/**/domains/*.{ts,js}"]
    }),
    TypeOrmModule.forFeature([Member]),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      graphiql: process.env.NODE_ENV === "development",
      autoSchemaFile: true,
      path: "api/v3/graphql",
      sortSchema: true,
      introspection: true,
      context: ({ req, res }) => ({ req, res })
    }),
    RedisModule,
    CategoryModule,
    RootQuestionModule,
    AuthModule,
    InterviewModule
  ],
  controllers: [AppController],
  providers: [AppService, MemberResolver, MemberService]
})
export class AppModule {}
