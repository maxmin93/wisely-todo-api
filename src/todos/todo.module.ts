import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './model/todo.entity';
import { Subtodo } from './model/subtodo.entity';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { TodoResolver } from './graphql/todo.resolver';
import { TestService } from './test.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Todo, Subtodo])
    ],
    providers: [
        TodoService,
        TodoResolver,
        TestService
    ],
    controllers: [
        TodoController
    ]
})
export class TodoModule { }
