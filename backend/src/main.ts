import { APP_INTERCEPTOR, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3001);
  // const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // app.useStaticAssets(join(__dirname, '..', 'static'));
  //app.setGlobalPrefix('api');
  // await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
