import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api/v3");
  app.use(cookieParser());

  app.enableCors({
    origin: [
      "http://localhost:80",
      "http://localhost:3000",
      "http://localhost:3001",
      "https://localhost:3000",
      "https://localhost:3001",
      "http://local.kokomen.kr:3000",
      "http://local.kokomen.kr",
      "https://local.kokomen.kr:3000",
      "https://local.kokomen.kr:3001",
      "https://local.kokomen.kr",
      "https://dev.kokomen.kr",
      "https://kokomen.kr",
      "https://www.kokomen.kr",
      "https://www.webview.kokomen.kr",
      "https://webview.kokomen.kr",
      "https://webview-dev.kokomen.kr",
      "https://www.webview-dev.kokomen.kr"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
  });
  const config = new DocumentBuilder()
    .setTitle("Kokomen API V3")
    .setVersion("0.0.1")
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/v3/docs", app, documentFactory);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
