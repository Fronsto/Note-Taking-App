import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { GETPAGES, useGetPages } from './page';
import { useMeQuery } from './auth';
const GETUSERS = gql`
    query GetUsersOfThisPage($pageId: String!) {
        getUsersOfThisPage(pageId: $pageId) {
            id
            username
            accessType
        }
    }
`;

const ADDUSER = gql`
    mutation AddUserToTeam($email: String!, $pageId: String!) {
        addUserToTeam(email: $email, pageId: $pageId) {
            message
            ok
            userInfo {
                id
                username
            }
        }
    }
`;

const SETACT = gql`
    mutation SetAccessType(
        $accessType: Float!
        $userId: Float!
        $pageId: String!
    ) {
        setAccessType(
            accessType: $accessType
            userId: $userId
            pageId: $pageId
        ) {
            message
            ok
        }
    }
`;
const LEAVETEAM = gql`
    mutation LeaveTeam($pageId: String!) {
        leaveTeam(pageId: $pageId) {
            message
            ok
        }
    }
`;

const MAKEPRIVATE = gql`
    mutation MakePrivate($pageId: String!) {
        makePrivate(pageId: $pageId) {
            message
            ok
        }
    }
`;

const REMOVEUSER = gql`
    mutation RemoveUserFromTeam($userId: Float!, $pageId: String!) {
        removeUserFromTeam(userId: $userId, pageId: $pageId) {
            message
            ok
        }
    }
`;

export function useGetUsers(pageId, interval) {
    const meRes = useMeQuery();
    const pagesRes = useGetPages();
    const thisPage = pagesRes.data?.getPagesOfThisUser?.find(
        (page) => page.id === pageId
    );
    return useLazyQuery(GETUSERS, {
        variables: { pageId },
        fetchPolicy: 'no-cache',
        pollInterval: interval,
        onCompleted: async (data) => {
            // check if in data current users's acT changed
            if (data) {
                const myId = meRes.data.me.id;
                const newMe = data.getUsersOfThisPage.find(
                    (user) => user.id === myId
                );
                if (newMe && newMe.accessType !== thisPage.accessType) {
                    // update cache with new accessType
                    console.log('updating cache with new accessType');
                    await pagesRes.refetch();
                }
                if (!newMe) {
                    console.log('user removed possilby');
                    await pagesRes.refetch();
                }
            }
        },
    });
}

export function useAddUserToTeam() {
    return useMutation(ADDUSER, {
        update: (cache, { data: { addUserToTeam } }, { variables }) => {
            if (addUserToTeam.ok) {
                const addedUser = {
                    ...addUserToTeam.userInfo,
                    accessType: 2,
                };
                const { getUsersOfThisPage } = cache.readQuery({
                    query: GETUSERS,
                    variables: { pageId: variables.pageId },
                });
                cache.writeQuery({
                    query: GETUSERS,
                    variables: { pageId: variables.pageId },
                    data: {
                        getUsersOfThisPage: [...getUsersOfThisPage, addedUser],
                    },
                });
                // also make the page with id variables.pageId shared
                const { getPagesOfThisUser } = cache.readQuery({
                    query: GETPAGES,
                });
                const newPages = getPagesOfThisUser.map((page) => {
                    if (page.id === variables.pageId) {
                        return { ...page, isShared: true };
                    }
                    return page;
                });
                cache.writeQuery({
                    query: GETPAGES,
                    data: {
                        getPagesOfThisUser: newPages,
                    },
                });
            }
        },
    });
}

export function useMakePrivate() {
    return useMutation(MAKEPRIVATE, {
        update: (cache, { data: { makePrivate } }, { variables }) => {
            if (makePrivate.ok) {
                const { getPagesOfThisUser } = cache.readQuery({
                    query: GETPAGES,
                });
                const newPages = getPagesOfThisUser.map((page) => {
                    if (page.id === variables.pageId) {
                        return { ...page, isShared: false };
                    }
                    return page;
                });
                cache.writeQuery({
                    query: GETPAGES,
                    data: {
                        getPagesOfThisUser: newPages,
                    },
                });
            }
        },
    });
}

export function useLeaveTeam() {
    return useMutation(LEAVETEAM, {
        update: async (cache, { data: { leaveTeam } }, { variables }) => {
            if (leaveTeam.ok) {
                const normalizedId = cache.identify({
                    id: variables.pageId,
                    __typename: 'PageOfAUser',
                });
                cache.evict(normalizedId);
                console.log('leave team: ', cache.gc());
            }
        },
    });
}

export function useSetAccessType() {
    return useMutation(SETACT, {
        update: (cache, { data: { setAccessType } }, { variables }) => {
            if (setAccessType.ok) {
                const { getUsersOfThisPage } = cache.readQuery({
                    query: GETUSERS,
                    variables: { pageId: variables.pageId },
                });
                const newUsers = getUsersOfThisPage.map((user) => {
                    if (user.id === String(variables.userId)) {
                        return {
                            ...user,
                            accessType: variables.accessType,
                        };
                    }
                    return user;
                });
                cache.writeQuery({
                    query: GETUSERS,
                    variables: { pageId: variables.pageId },
                    data: {
                        getUsersOfThisPage: newUsers,
                    },
                });
            }
        },
    });
}

export function useRemoveUserFromTeam() {
    return useMutation(REMOVEUSER, {
        update: (cache, { data: { removeUserFromTeam } }, { variables }) => {
            if (removeUserFromTeam.ok) {
                const { getUsersOfThisPage } = cache.readQuery({
                    query: GETUSERS,
                    variables: { pageId: variables.pageId },
                });
                const newUsers = getUsersOfThisPage.filter(
                    (user) => user.id !== String(variables.userId)
                );
                cache.writeQuery({
                    query: GETUSERS,
                    variables: { pageId: variables.pageId },
                    data: {
                        getUsersOfThisPage: newUsers,
                    },
                });
            }
        },
    });
}
