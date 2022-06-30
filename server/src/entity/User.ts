import { Field, ID, ObjectType } from 'type-graphql';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    OneToMany,
} from 'typeorm';
import { UserToPage } from './UserToPage';

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column('text')
    username: string;

    @Field()
    @Column('text', { unique: true })
    email: string;

    @Column('text')
    password: string;

    @Column('int', { default: 0 })
    tokenVersion: number;

    @OneToMany(() => UserToPage, (userToPage) => userToPage.user)
    pageConnection: UserToPage[];
}
