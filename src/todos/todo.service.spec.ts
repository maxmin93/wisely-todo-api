import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';
import { Todo } from './model/todo.entity';
import { Subtodo } from './model/subtodo.entity';
import { TodoService } from './todo.service';
import * as dotenv from 'dotenv';

dotenv.config();

export const getTypeOrmModule = () => {
    return TypeOrmModule.forRoot({
        type: "sqlite",
        database: process.env.TODOS_DB_NAME,  // "todos.db",
        entities: [__dirname + "/**/model/*.entity{.ts,.js}"],
        // timezone: 'Asia/Seoul',
        synchronize: true,
        keepConnectionAlive: true     // when e2e test
    })
};

describe('TodoService Test', () => {
    let service: TodoService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                getTypeOrmModule(),
                TypeOrmModule.forFeature([Todo, Subtodo])
            ],
            providers: [TodoService],
        }).compile();

        service = module.get<TodoService>(TodoService);
    });

    afterAll(async () => {
        await getConnection().close();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should be inserted', async () => {
        const todo = {
            id: 1,
            name: 'new todo#01'
        } as Todo;
        const res = await service.insertTodo(todo);
        console.log('inserted:', res);
        expect(res).toBeTruthy();
    });

    it('should be bulkinserted', async () => {
        const todos = [
            { id: 2, name: 'new todo#02' } as Todo,
            { id: 3, name: 'new todo#03' } as Todo,
        ];
        const res = await service.bulkinsertTodo(todos);
        console.log('bulkinserted:', res);
        expect(res).toBeTruthy();
    });

    // it('should be updated', async () => {
    //     const todo = await service.getById(1);
    //     const subtodos = [
    //         { grp_id: 1, sub_id: 2 } as Subtodo,
    //         { grp_id: 1, sub_id: 3 } as Subtodo
    //     ];
    //     todo.subtodos = subtodos;
    //     const res = await service.updateTodo(todo);
    //     console.log('updated:', res);
    //     expect(res).toBeTruthy();
    // });

    // it('should be inserted to SUBTODO', async () => {
    //     const todo = await service.getById(1);
    //     const sub_ids = [2, 3];
    //     const res = await service.insertSubtodo(1, sub_ids);
    //     console.log('inserted SUBTODO:', res);
    //     expect(res).toBeTruthy();
    // });

});
