import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Order Management System')
    .setDescription('<h4>Order Management System API description</h4>')
    .setVersion('0.1')
    .addServer('http://www.localhost:3000/')
    .setContact(
      'GitHub Project',
      'https://github.com/AbdelRahmanH1/-Order-Management-System',
      'hossamabdelrahman62@gmail.com',
    )
    .addSecurity('customToken', {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Custom token format: SH__<email>-<random-string>',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
