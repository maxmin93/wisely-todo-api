import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeUpdate, BeforeInsert, AfterLoad } from "typeorm";
import { Subtodo } from "./subtodo.entity";
import * as moment from 'moment';
// Entity 조인 처리 과정때문에 데코레이터가 작동하지 않음
// import { Transform, Expose } from "class-transformer";

@Entity()
export class Todo {

    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column('text')
    name: string;

    @Column('boolean', { default: false })
    // @Field((type) => Boolean)    // graphql
    done: boolean;

    @Column('text', { default: () => "datetime('now','localtime')" })
    created: string;

    @Column('text')
    updated: string;

    // 쌍방 정의: @OneToMany, @ManyToOne 둘다 필요
    // Error: Relation "subtodos" was not found
    @OneToMany(() => Subtodo, subtodo => subtodo.grp, { cascade: true })
    subtodos: Subtodo[];

    @BeforeInsert()
    @BeforeUpdate()
    // Entity 자체 변경이 있는 경우의 save 때만 적용됨 (JOIN subtodos 없이)
    // ==> subtodos 변경시에 대해서는 로직으로 수동 처리
    async beforeSave() {
        this.updated = moment().format("YYYY-MM-DD HH:mm:ss");
    }

    // 이것도 작동하지 않음
    // readonly arrtodos: number[] = undefined;
    // @AfterLoad()
    // async getTodosArr() {
    //     return this.subtodos ? this.subtodos.map(r => r.sub_id) : [];
    // }
}
