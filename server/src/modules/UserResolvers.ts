import {
    Arg,
    Ctx,
    Field,
    Int,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import 'reflect-metadata';
import { User } from '../entity/User';
import { compare, hash } from 'bcryptjs';
import { MyContext } from '../MyContext';
import { createAccessToken, createRefreshToken } from '../auth/Auth';
import { isAuth } from '../middlewares/isAuth';
import { sendRefreshToken } from '../auth/sendRefreshToken';
import { Page } from '../entity/Page';
import { UserToPage } from '../entity/UserToPage';
import { PageDataModel } from '../entity/PageContents';
import GuidePage from '../GuidePage';
require('dotenv').config();

@ObjectType()
class LoginResponse {
    @Field()
    accessToken: string;
    @Field(() => User)
    user: User;
}

@ObjectType()
class RegisterResponse {
    @Field()
    message: string;
    @Field()
    ok: Boolean;
}

@Resolver()
export class UserResolvers {
    @Query(() => User, { nullable: true })
    @UseMiddleware(isAuth)
    async me(@Ctx() { payload }: MyContext) {
        if (!payload || !payload.userId) return null;
        return User.findOneBy({ id: payload.userId });
    }

    @Mutation(() => Boolean)
    async logout(@Ctx() { res }: MyContext) {
        sendRefreshToken(res, '');
        return true;
    }

    @Mutation(() => Boolean)
    async RevokeRefreshToken(@Arg('userId', () => Int) userId: number) {
        try {
            const user = await User.findOneBy({ id: userId });
            if (!user) return false;
            await User.update(
                { id: userId },
                { tokenVersion: user.tokenVersion + 1 }
            );
            return true;
        } catch (err) {
            console.log('RevokeRefreshToken error : ', err);
            return false;
        }
    }

    @Mutation(() => LoginResponse)
    async login(
        @Arg('email') email: string, //
        @Arg('password') password: string, //
        @Ctx() { req, res }: MyContext
    ): Promise<LoginResponse> {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error('Invalid Email/Password');
        }
        const valid = await compare(password, user.password);
        if (!valid) {
            throw new Error('Invalid Email/Password');
        }
        sendRefreshToken(res, createRefreshToken(user));
        return {
            accessToken: createAccessToken(user),
            user,
        };
    }

    @Mutation(() => RegisterResponse)
    async register(
        @Arg('username') username: string, //
        @Arg('email') email: string, //
        @Arg('password') password: string //
    ): Promise<RegisterResponse> {
        try {
            const hashedPassword = await hash(password, 12);
            const oldUser = await User.findOne({ where: { email } });
            if (oldUser) {
                return {
                    message: 'Provided email is already in use',
                    ok: false,
                };
            }
            const user = await User.create({
                username,
                email,
                password: hashedPassword,
            }).save();

            const page = await Page.create({
                title: 'Guide',
                isShared: false,
                owner: user.id,
            }).save();
            await UserToPage.insert({
                userId: user.id,
                pageId: page.id,
                isFav: false,
                accessType: 1,
            });
            new PageDataModel({
                _id: page.id,
                data: GuidePage,
            }).save();
            return { message: 'Success', ok: true };
        } catch (err) {
            console.log('register error: ', err);
            return { message: 'Error occured, please try again', ok: false };
        }
    }
}
