import { Field, ID, ObjectType } from 'type-graphql';
import 'reflect-metadata';

@ObjectType()
export class ResponseWithMessage {
    @Field()
    message: string;
    @Field()
    ok: Boolean;
}
@ObjectType()
export class UserOfAPage {
    @Field(() => ID)
    id: number;
    @Field()
    username: string;
    @Field()
    accessType: number;
}
@ObjectType()
export class PageOfAUser {
    @Field(() => ID)
    id: string;
    @Field()
    title: string;
    @Field()
    isFav: boolean;
    @Field()
    isShared: boolean;
    @Field()
    accessType: number;
    @Field()
    owner: number;
}

@ObjectType()
export class ResponseWithUserInfo {
    @Field()
    message: string;
    @Field()
    ok: Boolean;
    @Field({ nullable: true })
    userInfo: UserOfAPage;
}

@ObjectType()
export class ResponseWithPageInfo {
    @Field()
    message: string;
    @Field()
    ok: Boolean;
    @Field({ nullable: true })
    pageInfo: PageOfAUser;
}
