import { ObjectType, Field, Int, InputType, PartialType, PickType } from "@nestjs/graphql";
import { Todo } from "../model/todo.entity";
import { Subtodo } from "../model/subtodo.entity";
import { Transform, Expose } from "class-transformer";

@ObjectType({ description: 'Sub-todo' })
export class SubtodoDto {

    @Field(() => Int)
    readonly id: number;

    @Field(() => Int)
    readonly sub_id: number;
}

@ObjectType({ description: 'Todo List' })
export class TodoDto {

    @Field(() => Int)
    readonly id: number;

    @Field()
    readonly name: string;

    @Field()
    readonly done: boolean;

    @Field()
    readonly created: string;

    @Field()
    readonly updated: string;

    @Field(() => [SubtodoDto])
    readonly subtodos: SubtodoDto[];

    // @Field(() => [Int])
    // readonly subtodos: Int32Array;
    // constructor(todo: Todo) {
    //     this.id = todo.id;
    //     this.name = todo.name;
    //     this.done = todo.done;
    //     this.created = todo.created;
    //     this.updated = todo.updated;
    //     const ids = todo.subtodos.map(r => r.sub_id);
    //     this.subtodos = todo.subtodos ? Int32Array.from(ids) : Int32Array.of();
    // }
}

@InputType({ description: 'createTodo' })
export class CreateTodoDto {

    @Field({ nullable: true })
    readonly id?: number;

    @Field()
    readonly name: string;
}

@InputType({ description: 'updateTodo' })
export class UpdateTodoDto extends PickType(PartialType(CreateTodoDto), ['name']) {

    @Field(() => Int, { nullable: false })
    readonly id!: number;

    @Field(() => Boolean)
    readonly done!: boolean;

    // @Field()
    // readonly subtodos?: Subtodo[];
}
