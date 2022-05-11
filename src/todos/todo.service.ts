import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, UpdateResult, DeleteResult, getConnection, Connection } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Todo } from './model/todo.entity';
import { Subtodo } from './model/subtodo.entity';
import { TodoDto, CreateTodoDto, UpdateTodoDto } from './graphql/todo.dto';

@Injectable()
export class TodoService {

    private conn: Connection;

    constructor(
        @InjectRepository(Todo)
        private todoRepository: Repository<Todo>,
        @InjectRepository(Subtodo)
        private subtodoRepository: Repository<Subtodo>
    ) {
        this.conn = getConnection();
    }


    ///////////////////////////////////////
    // TODO: insert, update, delete

    async createTodo(data: CreateTodoDto): Promise<Todo> {
        const todo = this.todoRepository.create(data);
        return await this.todoRepository.save(todo);
    }

    // https://makinhs.medium.com/graphql-nodejs-postgres-made-easy-with-nestjs-and-typeorm-4daff3c516d
    async updateTodo(id: number, data: UpdateTodoDto): Promise<Todo> {
        const todo = await this.todoRepository.preload({
            id: id,
            ...data
        });
        if (!todo) {
            throw new NotFoundException(`Todo #${id} not found`);
        }
        return await this.todoRepository.save(todo);
    }

    async deleteTodo(id: number): Promise<Todo> {
        const todo = await this.todoRepository.findOne(id);
        const res = await this.todoRepository.remove(todo);
        res.id = id;    // id=undefined 상태로 반환됨
        console.log('deleteTodo:', res);
        return res;
    }


    ///////////////////////////////////////
    // select

    /*
SELECT
    "Todo"."id" AS "Todo_id", "Todo"."name" AS "Todo_name", "Todo"."done" AS "Todo_done", "Todo"."created" AS "Todo_created", "Todo"."updated" AS "Todo_updated",
    "Todo__subtodos"."id" AS "Todo__subtodos_id", "Todo__subtodos"."sub_id" AS "Todo__subtodos_sub_id", "Todo__subtodos"."grp_id" AS "Todo__subtodos_grp_id"
FROM "todo" "Todo"
    LEFT JOIN "subtodo" "Todo__subtodos" ON "Todo__subtodos"."grp_id"="Todo"."id"
    */
    async getAll(): Promise<Todo[]> {
        // return await this.todoRepository.find({ relations: ["subtodos"] });
        return await this.todoRepository
            .createQueryBuilder("todo")
            // 참고: leftJoinAndMapOne 는 object 하나만 리턴
            .leftJoinAndMapMany("todo.subtodos", "subtodo", "subtodo",
                'subtodo.grp_id = todo.id'
            )
            .getMany();
    }

    async getTodosByIds(ids: number[]): Promise<Todo[]> {
        return await this.todoRepository.findByIds(ids, { relations: ["subtodos"] });
    }

    async getById(id: number): Promise<Todo> {
        return await this.todoRepository.findOne(id, { relations: ["subtodos"] });
    }

    async getSubtodosByGrpId(id: number): Promise<Subtodo[]> {
        return await this.subtodoRepository.createQueryBuilder("subtodo")
            .where("grp_id = :grp_id", { grp_id: id })
            .getMany();
    }

    ///////////////////////////////////////
    // for TEST

    private newTodo(id: number, name: string) {
        const todo = new Todo();
        if (id) todo.id = id;
        todo.name = name;
        todo.subtodos = [];
        return todo;
    }

    private newSubtodo(grp: Todo, sub_id: number) {
        const subtodo = new Subtodo();
        subtodo.grp = grp;
        subtodo.sub_id = sub_id;
        return subtodo;
    }

    async test1() {
        const todoRepository = this.conn.getRepository(Todo);
        const maintodo = await todoRepository.save(this.newTodo(1, 'todo#1'));
        console.log('STEP#1 create Todo', maintodo);

        let todos = [
            this.newTodo(2, 'todo#2'), this.newTodo(3, 'todo#3')
        ];
        console.log('STEP#2 create Todos', await todoRepository.save(todos));

        const subtodoRepository = this.conn.getRepository(Subtodo);
        let subtodos: Subtodo[] = [
            this.newSubtodo(maintodo, 2),
            this.newSubtodo(maintodo, 3)
        ];
        console.log('STEP#3 create Subtodos ', await subtodoRepository.save(subtodos));

        return await todoRepository.createQueryBuilder("todo")
            // 참고: leftJoinAndMapOne 는 object 하나만 리턴
            .leftJoinAndMapMany("todo.subtodos", "subtodo", "subtodo",
                'subtodo.grp_id = todo.id'
            )
            .where("todo.id < :num", { num: 10 })
            .getMany();
    }

    async test2() {
        const todoRepository = this.conn.getRepository(Todo);
        // Todo 일반 필드 변경
        const temp1 = await todoRepository.findOne(2, { relations: ["subtodos"] });
        temp1.done = true;
        temp1.name = temp1.name + ' UPDATED';
        const temp2 = await todoRepository.save(temp1);
        console.log('STEP#4 update Todo.values', temp2);

        const subtodoRepository = this.conn.getRepository(Subtodo);
        const subtodo = await subtodoRepository.findOne(1005);
        console.log('STEP#5 remove Subtodo', await subtodoRepository.remove(subtodo));

        const todo = await todoRepository.save(this.newTodo(4, 'todo#4'));
        console.log('STEP#6 insert Subtodo', todo);

        const maintodo = await todoRepository.findOne(1, { relations: ["subtodos"] });
        maintodo.subtodos.push(this.newSubtodo(maintodo, 4))
        // let updated = await todoRepository.update(maintodo.id, maintodo);
        let updated = await todoRepository.save(maintodo);
        console.log('STEP#7 update Todo with Subtodo', updated);

        return await todoRepository.findOne(1, { relations: ["subtodos"] });
    }

    async test3() {
        const todoRepository = this.conn.getRepository(Todo);
        const todo = await todoRepository.findOne(4, { relations: ["subtodos"] });
        console.log('STEP#8 delete Todo', await todoRepository.remove(todo));

        return await todoRepository.findOne(1, { relations: ["subtodos"] });
    }
}
