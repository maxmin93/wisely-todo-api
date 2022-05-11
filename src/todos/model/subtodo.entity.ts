import { Entity, PrimaryGeneratedColumn, JoinColumn, Column, PrimaryColumn, ManyToOne } from "typeorm";
import { Todo } from "./todo.entity";

@Entity()
export class Subtodo {

    // 중복 방지가 안된다 --> 일단은 로직으로 처리
    @PrimaryGeneratedColumn()
    id: number;

    // 실패! PrimaryGeneratedColumn 없애고 싶은데 어떻게 하는거냐?
    // (multiple) composite primary keys
    // @PrimaryColumn("integer")
    // grp_id: number;
    // @PrimaryColumn('integer')
    // sub_id: number;

    // 양방향?? ManyToOne 없애면 오류 발생
    // Error: Cannot read properties of undefined (reading 'joinColumns')
    @ManyToOne(() => Todo, todo => todo.id, {
        // 작동 안함. 왜지??
        onDelete: 'CASCADE', onUpdate: 'CASCADE'
    })
    @JoinColumn({ name: 'grp_id' })
    grp: Todo;

    @Column('integer')
    sub_id: number;
}
