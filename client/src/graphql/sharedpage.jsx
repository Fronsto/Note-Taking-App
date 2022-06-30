import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { GETPAGES, useGetPages } from './page';
import { useMeQuery } from './auth';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
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
            if (data && data.getUsersOfThisPage) {
                const myId = meRes.data.me.id;
                const newMe = data.getUsersOfThisPage.find(
                    (user) => user.id === myId
                );
                if (newMe && newMe.accessType !== thisPage.accessType) {
                    // update cache with new accessType
                    await pagesRes.refetch();
                }
            } else if (data) {
                await pagesRes.refetch();
                navigate('/');
            }
        },
    });
}

export function useAddUserToTeam() {
    return useMutation(ADDUSER, {
        update: (cache, { data: { addUserToTeam } }, { variables }) => {
            if (addUserToTeam.ok) {
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
                cache.gc();
            }
        },
    });
}

export function useSetAccessType() {
    return useMutation(SETACT);
}

export function useRemoveUserFromTeam() {
    return useMutation(REMOVEUSER);
}
