import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './model/todo.entity';
import { Subtodo } from './model/subtodo.entity';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { TodoResolver } from './graphql/todo.resolver';

@Module({
    imports: [
        TypeOrmModule.forFeature([Todo, Subtodo])
    ],
    providers: [
        TodoService,
        TodoResolver
    ],
    controllers: [
        TodoController
    ]
})
export class TodoModule { }
