import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, getConnection, Connection } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Todo } from './model/todo.entity';
import { Subtodo } from './model/subtodo.entity';
import { TodoDto, CreateTodoDto, UpdateTodoDto, TodoDetailDto } from './graphql/todo.dto';
import { SearchDto, PageTodoDto, PageTodo } from './graphql/search.dto';

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

    async getDetail(id: number): Promise<TodoDetailDto> {
        const todo = await this.todoRepository.findOne(id, { relations: ["subtodos"] });
        const ids: number[] = await this.subtodoRepository.createQueryBuilder("subtodo")
            .where("grp_id = :grp_id", { grp_id: id })
            .select('subtodo.sub_id')
            .distinct()
            .getMany()
            .then(r => Promise.resolve(r.map(t => t.sub_id)));
        console.log(`subtodos[${id}]:`, ids);
        todo.arrtodos = await this.todoRepository.findByIds(ids);
        return todo;
    }

    // for TEST
    async getSubtodosByGrpId(id: number): Promise<Todo[]> {
        const ids: number[] = await this.subtodoRepository.createQueryBuilder("subtodo")
            .where("grp_id = :grp_id", { grp_id: id })
            .select('subtodo.sub_id')
            .distinct()
            .getMany()
            .then(r => Promise.resolve(r.map(t => t.sub_id)));
        console.log(`subtodos[${id}]:`, ids);
        return await this.todoRepository.findByIds(ids);
    }

    ///////////////////////////////////////
    // search by conditions

    // query = query.andWhere 안해도 되는건가?
    // https://velog.io/@loakick/Nest.js-TypeORM-%EB%A6%AC%ED%8C%A9%ED%84%B0%EB%A7%81-QueryBuilder
    private queryByConditions(dto: SearchDto) {
        let query = this.todoRepository.createQueryBuilder('todo');
        if (dto.term) {
            query = query.andWhere("name like :term", { term: '%' + dto.term + '%' });
        }
        if (dto.done != undefined) {
            query = query.andWhere(dto.done ? "done != 0" : "done = 0");
        }
        if (dto.from_dt) {  // equal or greater than
            query = query.andWhere("created > :date", { date: dto.from_dt });
        }
        if (dto.to_dt) {    // less than
            query = query.andWhere("created < :date", { date: dto.to_dt });
        }
        return query;
    }

    async searchTodos(dto: SearchDto) {
        const query = this.queryByConditions(dto);
        const total = await query.getCount();
        const todos = await query
            .offset(dto.page * dto.size)    // skip
            .limit(dto.size)                // take
            .getMany();
        return new PageTodo(total, todos);
    }
}
