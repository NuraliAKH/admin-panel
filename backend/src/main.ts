import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { cwd } from "process";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: "*",
    credentials: true,
    allowedHeaders: "*",
    methods: "*",
  });

  app.useStaticAssets(join(cwd(), "uploads"), {
    prefix: "/api/uploads",
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT || 3000;
  await app.listen(port as number);
  console.log(`API running on http://localhost:${port}`);
}
bootstrap();
