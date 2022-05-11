import { ObjectType, Field, Int, InputType, PartialType, PickType } from "@nestjs/graphql";
import { IsString, IsNotEmpty, IsArray, IsNumber, IsBoolean } from 'class-validator';
import { Todo } from "../model/todo.entity";
import { TodoDto } from "./todo.dto";

// for search
@InputType({ description: 'searchTodo' })
export class SearchDto {

    // defaultValue 는 InputType 또는 Args 에서만 사용 가능
    @Field(() => Int, { defaultValue: 5 })
    size: number;

    @Field(() => Int, { nullable: false })
    page: number;

    @Field(() => String, { nullable: true })
    term?: string;

    @Field(() => Boolean, { nullable: true })
    done?: boolean;

    @Field(() => String, { nullable: true })
    from_dt?: string;    // YYYY-MM-DD

    @Field(() => String, { nullable: true })
    to_dt?: string;      // YYYY-MM-DD
}

// interface 로 처리할 수 없는지?
// 참고) https://docs.nestjs.com/graphql/interfaces
export class PageTodo {

    total: number;
    arrtodos: Todo[];

    constructor(total: number, todos: Todo[]) {
        this.total = total;
        this.arrtodos = todos;
    }
}

@ObjectType({ description: 'Todo Page' })
export class PageTodoDto {

    @Field(() => Int, { nullable: false })
    readonly total: number;

    @Field(() => [TodoDto], { nullable: false })
    readonly arrtodos: TodoDto[];
}
