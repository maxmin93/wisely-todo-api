import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, getConnection, Connection } from 'typeorm';
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

}
