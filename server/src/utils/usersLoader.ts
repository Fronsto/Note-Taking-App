import DataLoader from 'dataloader';
import { User } from '../entity/User';
import { UserToPage } from '../entity/UserToPage';
import { In } from 'typeorm';

const batchUsers = async (pageIds: string[]) => {
    const userpage = await UserToPage.find({
        join: {
            alias: 'userToPage',
            innerJoinAndSelect: {
                user: 'userToPage.user',
            },
        },
        where: {
            pageId: In(pageIds),
        },
    });

    const pageIdsToUsers: { [key: string]: User[] } = {};

    /*
  {
    userId: 1,
    pageId: eurzlqlkjsfd-sdkfjlkqj-lskdjflksj,
    __user__: { id: 1, name: 'user1' }
  }
  */
    userpage.forEach((ab) => {
        if (ab.pageId in pageIdsToUsers) {
            pageIdsToUsers[ab.pageId].push((ab as any).__user__);
        } else {
            pageIdsToUsers[ab.pageId] = [(ab as any).__user__];
        }
    });

    return pageIds.map((pageId) => pageIdsToUsers[pageId]);
};

export const createUsersLoader = () => new DataLoader(batchUsers as any);
