import { Injectable, NotFoundException } from '@nestjs/common';
import { getConnection, Connection } from 'typeorm';
import { Todo } from './model/todo.entity';
import { Subtodo } from './model/subtodo.entity';

@Injectable()
export class TestService {

    private conn: Connection;

    constructor() {
        this.conn = getConnection();
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
