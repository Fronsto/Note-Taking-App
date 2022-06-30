import { Ctx, Field, ID, ObjectType } from 'type-graphql';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    OneToMany,
    PrimaryColumn,
} from 'typeorm';
import { UserToPage } from './UserToPage';

@ObjectType()
@Entity()
export class Page extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field()
    @Column('text')
    title: string;

    @Field()
    @Column()
    isShared: boolean;

    @Field()
    @Column()
    owner: number;

    @OneToMany(() => UserToPage, (userToPage) => userToPage.page)
    userConnection: UserToPage[];
}
