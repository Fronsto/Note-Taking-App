import {
    Entity,
    Column,
    ManyToOne,
    PrimaryGeneratedColumn,
    PrimaryColumn,
    BaseEntity,
} from 'typeorm';
import { User } from './User';
import { Page } from './Page';
import { Field, Ctx, ObjectType } from 'type-graphql';
import { MyContext } from '../MyContext';

@Entity()
export class UserToPage extends BaseEntity {
    @PrimaryColumn()
    userId: number;

    @PrimaryColumn()
    pageId: string;

    @Column()
    isFav: boolean;

    @Column()
    accessType: number;

    @ManyToOne(() => User, (user) => user.pageConnection)
    user: User;

    @ManyToOne(() => Page, (page) => page.userConnection)
    page: Page;
}
