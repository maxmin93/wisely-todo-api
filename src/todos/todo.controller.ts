import { Controller, Post, Get, Put, Delete, Param, Request, Body, Query } from '@nestjs/common';
import { UseInterceptors, ClassSerializerInterceptor, ParseIntPipe } from '@nestjs/common';
import { TodoService } from './todo.service';
import { Todo } from './model/todo.entity';

// default page size
const DEFAULT_PAGE_SIZE = 5;

@Controller('todo')
export class TodoController {

    constructor(
        private todoService: TodoService,
    ) { }

    ///////////////////////////////////////
    // select

    @Get('all')
    async getAll(): Promise<Todo[]> {
        return await this.todoService.getAll();
    }

    @Get(':id')
    async getOne(@Param('id', ParseIntPipe) id: number): Promise<Todo> {
        return await this.todoService.getById(id);
    }

    ///////////////////////////////////////
    // for TEST

    @Get('test/:num')
    async test(@Param('num', ParseIntPipe) num: number) {
        switch (num) {
            case 1: return await this.todoService.test1();  // insert
            case 2: return await this.todoService.test2();  // update
            case 3: return await this.todoService.test3();  // delete
        }
    }
}
