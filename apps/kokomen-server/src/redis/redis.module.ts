// src/redis/redis.module.ts
import { Module, Global } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Global()
@Module({
  providers: [
    {
      provide: "REDIS_CLIENT",
      useFactory: (configService: ConfigService): Redis => {
        const redis = new Redis({
          host: configService.get("REDIS_HOST", "127.0.0.1"),
          port: configService.get("REDIS_PORT", 6379),
          password: configService.get("REDIS_PASSWORD", ""),

          enableReadyCheck: false,
          lazyConnect: false,
          keepAlive: 30000,

          family: 4, // IPv4
          connectTimeout: 10000,
          commandTimeout: 5000
        });

        redis.on("connect", () => {
          console.log("✅ Redis connected successfully");
        });

        redis.on("ready", () => {
          console.log("✅ Redis ready to accept commands");
        });

        redis.on("error", (err) => {
          console.error("❌ Redis connection error:", err);
        });

        redis.on("close", () => {
          console.log("⚠️ Redis connection closed");
        });

        redis.on("reconnecting", (time) => {
          console.log(`🔄 Redis reconnecting in ${time}ms`);
        });

        return redis;
      },
      inject: [ConfigService]
    }
  ],
  exports: ["REDIS_CLIENT"]
})
export class RedisModule {}
