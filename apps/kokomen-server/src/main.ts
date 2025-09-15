import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://local.kokomen.kr:3000",
      "https://dev.kokomen.kr"
    ], // 클라이언트 도메인
    credentials: true, // 쿠키 포함 허용
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
