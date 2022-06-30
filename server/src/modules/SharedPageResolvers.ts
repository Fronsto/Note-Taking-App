import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import 'reflect-metadata';
import { Not } from 'typeorm';

import { Page } from '../entity/Page';
import { UserToPage } from '../entity/UserToPage';

import { MyContext } from '../MyContext';
import { isAuth } from '../middlewares/isAuth';
import { User } from '../entity/User';
require('dotenv').config();

import { ResponseWithMessage, ResponseWithUserInfo } from './@types/UserPage';

@Resolver()
export class SharedPageResolvers {
    @Mutation(() => ResponseWithUserInfo, { nullable: true })
    @UseMiddleware(isAuth)
    async addUserToTeam(
        @Arg('pageId') pageId: string,
        @Arg('email') email: string,
        @Ctx() { payload }: MyContext
    ) {
        if (!payload || !payload.userId) return null;
        try {
            const page = await Page.findOneBy({ id: pageId });
            if (!page) return null;
            const userAddingPpl = await UserToPage.findOneBy({
                userId: payload.userId,
                pageId: pageId,
            });
            if (userAddingPpl?.accessType !== 1) {
                return {
                    message: 'You do not have access to this page',
                    ok: false,
                    userInfo: null,
                };
            }
            const user = await User.findOneBy({ email: email });
            if (!user)
                return {
                    message: 'No user with this email exists',
                    ok: false,
                    userInfo: null,
                };

            const userToAdd = await UserToPage.findOneBy({
                pageId: page.id,
                userId: user.id,
            });
            if (userToAdd)
                return {
                    message: 'User is already in the team',
                    ok: false,
                    userInfo: null,
                };

            await UserToPage.create({
                pageId: page.id,
                userId: user.id,
                isFav: false,
                accessType: 2,
            }).save();
            if (!page.isShared) {
                await Page.update(page.id, { isShared: true });
            }

            return {
                message: 'User added to the team',
                userInfo: {
                    id: user.id,
                    username: user.username,
                },
                ok: true,
            };
        } catch (error) {
            console.log('addUserToTeam error : ', error);
            return {
                message: 'error',
                ok: false,
                userInfo: null,
            };
        }
    }

    @Mutation(() => ResponseWithMessage, { nullable: true })
    @UseMiddleware(isAuth)
    async setAccessType(
        @Arg('pageId') pageId: string,
        @Arg('userId') userId: number,
        @Arg('accessType') accessType: number,
        @Ctx() { payload }: MyContext
    ) {
        if (!payload || !payload.userId) return null;
        try {
            // verify if accessType is a valid value
            if (accessType != 1 && accessType != 2) return null;
            const page = await Page.findOneBy({ id: pageId });
            if (!page) return null;
            if (!page.isShared) return null;
            const userForWhomToChangeAcT = await UserToPage.findOneBy({
                userId: userId,
                pageId: pageId,
            });
            const userChangingTheAcT = await UserToPage.findOneBy({
                userId: payload.userId,
                pageId: pageId,
            });
            if (!userForWhomToChangeAcT || !userChangingTheAcT) return null;

            if (userChangingTheAcT?.accessType !== 1) {
                return {
                    message: 'You do not have access to this page',
                    ok: false,
                };
            }
            if (page.owner === userForWhomToChangeAcT.userId) {
                return {
                    message: 'You cannot change the access type of the owner',
                    ok: false,
                };
            }
            await UserToPage.update(
                { pageId: pageId, userId: userId },
                { accessType: accessType }
            );
            return {
                message: 'AccessType changed successfully',
                ok: true,
            };
        } catch (error) {
            console.log('setAccessType error : ', error);
            return {
                message: 'error',
                ok: false,
            };
        }
    }

    // mutation to remove a user from a page if accessType is not owner
    @Mutation(() => ResponseWithMessage, { nullable: true })
    @UseMiddleware(isAuth)
    async removeUserFromTeam(
        @Arg('pageId') pageId: string,
        @Arg('userId') userId: number,
        @Ctx() { payload }: MyContext
    ) {
        if (!payload || !payload.userId) return null;
        try {
            const page = await Page.findOneBy({ id: pageId });
            if (!page) return null;
            if (!page.isShared) return null;
            const userToRemove = await UserToPage.findOneBy({
                userId: userId,
                pageId: pageId,
            });
            const userAskingForRemoval = await UserToPage.findOneBy({
                userId: payload.userId,
                pageId: pageId,
            });
            if (!userAskingForRemoval || !userToRemove) return null;

            if (userAskingForRemoval?.accessType !== 1) {
                return {
                    message: 'You do not have access to this page',
                    ok: false,
                };
            }
            if (page.owner === userToRemove.userId) {
                return {
                    message:
                        'You cannot remove the owner of the page from the team',
                    ok: false,
                };
            }
            await UserToPage.delete({
                pageId: pageId,
                userId: userId,
            });
            return {
                message: 'User removed successfully',
                ok: true,
            };
        } catch (error) {
            console.log('removeUserFromTeam error : ', error);
            return {
                message: 'error',
                ok: false,
            };
        }
    }

    // mutation to leave a page if accessType is not owner
    @Mutation(() => ResponseWithMessage, { nullable: true })
    @UseMiddleware(isAuth)
    async leaveTeam(
        @Arg('pageId') pageId: string,
        @Ctx() { payload }: MyContext
    ) {
        if (!payload || !payload.userId) return null;
        try {
            const page = await Page.findOneBy({ id: pageId });
            if (!page) return null;
            if (!page.isShared) return null;
            if (page.owner === payload.userId) {
                return {
                    message:
                        'Owners cannot leave the page, you can delete it instead',
                    ok: false,
                };
            }
            // check if user is in the team
            const userLeavingTeam = await UserToPage.findOneBy({
                userId: payload.userId,
                pageId: pageId,
            });
            if (!userLeavingTeam) {
                return {
                    message: 'You are not in this team',
                    ok: false,
                };
            }

            await UserToPage.delete({
                pageId: pageId,
                userId: payload.userId,
            });
            return {
                message: 'You left this page',
                ok: true,
            };
        } catch (error) {
            console.log('leaveTeam error : ', error);
            return {
                message: 'error',
                ok: false,
            };
        }
    }

    // mutation to set isShared false and remove all other users from the page
    @Mutation(() => ResponseWithMessage, { nullable: true })
    @UseMiddleware(isAuth)
    async makePrivate(
        @Arg('pageId') pageId: string,
        @Ctx() { payload }: MyContext
    ) {
        if (!payload || !payload.userId) return null;

        try {
            const page = await Page.findOneBy({ id: pageId });
            if (!page) return null;
            if (!page.isShared) return null;
            if (page.owner !== payload.userId) {
                return {
                    message: 'You do not have access to make this page private',
                    ok: false,
                };
            }
            // delete all users who are not owner
            await UserToPage.delete({
                pageId: pageId,
                userId: Not(payload.userId),
            });
            await Page.update({ id: pageId }, { isShared: false });
            return {
                message: 'Page made private successfully',
                ok: true,
            };
        } catch (error) {
            console.log('makePrivate error : ', error);
            return {
                message: 'error',
                ok: false,
            };
        }
    }
}
