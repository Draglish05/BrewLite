import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Tự kiểm tra dữ liệu gửi lên theo các DTO (class-validator)
  // whitelist: bỏ các trường lạ; forbidNonWhitelisted: có trường lạ thì báo lỗi 400
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  // Cổng chạy: lấy trong file .env, nếu không có thì dùng 4000
  let port = 4000;
  if (process.env.PORT) {
    port = Number(process.env.PORT);
  }
  await app.listen(port);
}
bootstrap();
