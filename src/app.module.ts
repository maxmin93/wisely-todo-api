import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodoModule } from './todos/todo.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
    imports: [
        TodoModule,
        TypeOrmModule.forRoot({
            type: "sqlite",
            database: process.env.TODOS_DB_NAME,  // "todos.db",
            entities: [__dirname + "/**/model/*.entity{.ts,.js}"],
            // timezone: 'Asia/Seoul',
            // logging: ["query", "error"],
            logging: Array.isArray(JSON.parse(process.env.TYPEORM_LOGGING)),
            synchronize: true,
            keepConnectionAlive: true     // when e2e test
        }),
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: 'schema.gpl',
            sortSchema: true,
            debug: true,
            playground: true,
        })
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }

// npm install --save @nestjs/graphql @nestjs/apollo graphql apollo-server-express
// npm install --save moment dotenv
