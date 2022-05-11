import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.enableCors();   // { origin: "*" }
    await app.listen(process.env.TODOS_PORT, process.env.TODOS_HOST);
}
bootstrap();
