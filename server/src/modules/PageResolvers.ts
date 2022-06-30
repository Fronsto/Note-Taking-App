import {
    Arg,
    Ctx,
    Field,
    ID,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import 'reflect-metadata';

import { Page } from '../entity/Page';
import { UserToPage } from '../entity/UserToPage';

import { MyContext } from '../MyContext';
import { isAuth } from '../middlewares/isAuth';
import { PageDataModel } from '../entity/PageContents';
require('dotenv').config();

import {
    ResponseWithMessage,
    ResponseWithPageInfo,
    PageOfAUser,
    UserOfAPage,
} from './@types/UserPage';

@Resolver()
export class PageResolvers {
    @Query(() => [PageOfAUser], { nullable: true })
    @UseMiddleware(isAuth)
    async getPagesOfThisUser(@Ctx() { payload }: MyContext) {
        if (!payload || !payload.userId) return null;
        try {
            const userpage = await UserToPage.find({
                where: {
                    userId: payload.userId,
                },
                relations: {
                    page: true,
                },
            });
            const allpages = userpage.map((page) => {
                return {
                    id: page.pageId,
                    title: page.page.title,
                    isFav: page.isFav,
                    isShared: page.page.isShared,
                    accessType: page.accessType,
                    owner: page.page.owner,
                };
            });
            return allpages;
        } catch (error) {
            console.log('getPagesOfThisUser error : ', error);
            return null;
        }
    }

    @Query(() => [UserOfAPage], { nullable: true })
    @UseMiddleware(isAuth)
    async getUsersOfThisPage(
        @Ctx() { payload }: MyContext,
        @Arg('pageId') pageId: string
    ) {
        if (!payload || !payload.userId) return null;

        try {
            // first check if the user is associated with the page
            const isUserAssociated = await UserToPage.findOneBy({
                userId: payload.userId,
                pageId: pageId,
            });
            if (!isUserAssociated) return null;

            const userpage = await UserToPage.find({
                where: {
                    pageId: pageId,
                },
                relations: {
                    user: true,
                },
            });
            const allusers = userpage.map((user) => {
                return {
                    id: user.userId,
                    username: user.user.username,
                    accessType: user.accessType,
                };
            });
            return allusers;
        } catch (error) {
            console.log('getUsersOfThisPage error : ', error);
            return null;
        }
    }

    @Mutation(() => ResponseWithPageInfo, { nullable: true })
    @UseMiddleware(isAuth)
    async addPage(@Ctx() { payload }: MyContext) {
        if (!payload || !payload.userId) return null;
        try {
            const page = await Page.create({
                title: 'New Page',
                isShared: false,
                owner: payload.userId,
            }).save();
            await UserToPage.insert({
                userId: payload.userId,
                pageId: page.id,
                isFav: false,
                accessType: 1,
            });
            const pageInfo = {
                id: page.id,
                title: page.title,
                isFav: false,
                isShared: false,
                accessType: 1,
                owner: payload.userId,
            };
            new PageDataModel({
                _id: page.id,
                data: [{ type: 'paragraph', children: [{ text: '' }] }],
            }).save();
            return {
                message: 'Page added successfully',
                ok: true,
                pageInfo: pageInfo,
            };
        } catch (error) {
            console.log('addPage error : ', error);
            return {
                message: 'error',
                ok: false,
                pageInfo: null,
            };
        }
    }

    @Mutation(() => ResponseWithMessage, { nullable: true })
    @UseMiddleware(isAuth)
    async markFav(
        @Arg('pageId') pageId: string,
        @Ctx() { payload }: MyContext
    ) {
        if (!payload || !payload.userId) return null;

        try {
            await UserToPage.update(
                { pageId: pageId, userId: payload.userId },
                { isFav: () => 'NOT "isFav"' }
            );
            return {
                message: 'Page marked/unmarked as favorite successfully',
                ok: true,
            };
        } catch (error) {
            console.log('markFav error : ', error);
            return {
                message: 'error',
                ok: false,
            };
        }
    }

    @Mutation(() => ResponseWithMessage, { nullable: true })
    @UseMiddleware(isAuth)
    async changeTitle(
        @Arg('pageId') pageId: string,
        @Arg('title') title: string,
        @Ctx() { payload }: MyContext
    ) {
        if (!payload || !payload.userId) return null;

        try {
            const page = await Page.findOneBy({ id: pageId });
            if (!page) return null;
            if (page.owner !== payload.userId) {
                return {
                    message:
                        'You do not have access to change title of this page',
                    ok: false,
                };
            }
            if (!title)
                return {
                    message: 'Title cannot be empty',
                    ok: false,
                };
            await Page.update({ id: pageId }, { title: title });
            return {
                message: 'Title changed successfully',
                ok: true,
            };
        } catch (error) {
            console.log('changeTitle error : ', error);
            return {
                message: 'error',
                ok: false,
            };
        }
    }

    // mutation to delete a page if accessType is owner
    @Mutation(() => ResponseWithMessage, { nullable: true })
    @UseMiddleware(isAuth)
    async deletePage(
        @Arg('pageId') pageId: string,
        @Ctx() { payload }: MyContext
    ) {
        if (!payload || !payload.userId) return null;
        try {
            const page = await Page.findOneBy({ id: pageId });
            if (!page) return null;
            if (page.owner === payload.userId) {
                await UserToPage.delete({ pageId: pageId });
                await Page.delete({ id: pageId });
                await PageDataModel.findByIdAndDelete(pageId).exec();
                return {
                    message: 'Page deleted successfully',
                    ok: true,
                };
            } else {
                return {
                    message: 'Only owners can delete a page',
                    ok: false,
                };
            }
        } catch (error) {
            console.log('deletePage error : ', error);
            return {
                message: 'error',
                ok: false,
            };
        }
    }
}
