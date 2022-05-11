import { Query, Resolver, Mutation, Args, Int, Parent, ResolveField } from '@nestjs/graphql';
import { TodoService } from '../todo.service';
import { TodoDto, CreateTodoDto, UpdateTodoDto, SubtodoDto } from './todo.dto';
import { Todo } from '../model/todo.entity';

@Resolver('Todo')   // (() => TodoDto)
export class TodoResolver {

    constructor(
        private readonly todoService: TodoService,
    ) { }

    /*
    // 없어도 잘 됨 (하위 1:N 호출도 안함)
    @ResolveField('subtodos', returns => [SubtodoDto])
    async getSubtodos(@Parent() todo: TodoDto) {
        console.log('grp_todo:', todo);
        const { id } = todo;
        // 1:N 호출 --> Dataloader
        // https://velog.io/@peter0618/NestJS-graphql-3-%EA%B0%84%EB%8B%A8%ED%95%9C-1N-%EA%B4%80%EA%B3%84-%EC%98%88%EC%A0%9C
        return await this.todoService.getSubtodosByGrpId(id);
    }
    */

    /*
query {
  todoAll {
    id, name, done, created, updated, subtodos {
        sub_id
    }
  }
}
    */
    @Query(() => [TodoDto], { name: "todoAll" })
    async getTodos() {
        return await this.todoService.getAll();
    }

    /*
query {
    todos(ids:[12,13,14]) {
        id, name, done, created, updated
    }
}
    */
    @Query(() => [TodoDto], { name: "todos" })
    async getTodosByIds(@Args({ name: 'ids', type: () => [Int] }) ids: number[]) {
        return await this.todoService.getTodosByIds(ids);
    }

    /*
query {
    todo(id:1) {
          id, name, done, created, updated
    }
}
    */
    @Query(() => TodoDto, { name: "todo" })
    async getTodo(@Args('id', { type: () => Int }) id: number) {
        return await this.todoService.getById(id);
    }

    /*
mutation {
  createTodo(data:{
    id: 1,
    name: "new Todo"
  }) {
    id, name, done, created
  }
}
    */
    // GraphQL output type => TodoDto
    @Mutation(() => TodoDto, { name: "createTodo" })
    async createTodo(@Args('data') data: CreateTodoDto) {
        return await this.todoService.createTodo(data);
    }

    /*
mutation {
  updateTodo(data:{
    id: 12,
    done: true
  }) {
    id, name, done
  }
}
    */
    @Mutation(() => TodoDto, { name: "updateTodo" })
    async updateTodo(@Args('data') data: UpdateTodoDto) {
        return await this.todoService.updateTodo(data.id, data);
    }

    /*
mutation {
  deleteTodo(id:17) {
    id
  }
}
    */
    @Mutation(() => TodoDto, { name: "deleteTodo" })
    async deleteTodo(@Args('id', { type: () => Int }) id: number) {
        return await this.todoService.deleteTodo(id);
    }
}
