import { gql, useQuery, useMutation } from '@apollo/client';

export const GETPAGES = gql`
    query GetPagesOfThisUser {
        getPagesOfThisUser {
            id
            title
            isFav
            isShared
            accessType
            owner
        }
    }
`;

const ADDPAGE = gql`
    mutation AddPage {
        addPage {
            message
            ok
            pageInfo {
                id
                title
                isFav
                isShared
                accessType
                owner
            }
        }
    }
`;
const MARKFAV = gql`
    mutation MarkFav($pageId: String!) {
        markFav(pageId: $pageId) {
            message
            ok
        }
    }
`;

const CHANGETITLE = gql`
    mutation ChangeTitle($title: String!, $pageId: String!) {
        changeTitle(title: $title, pageId: $pageId) {
            message
            ok
        }
    }
`;

const DELETEPAGE = gql`
    mutation DeletePage($pageId: String!) {
        deletePage(pageId: $pageId) {
            message
            ok
        }
    }
`;
export function useGetPages() {
    return useQuery(GETPAGES);
}
export function useAddPage() {
    return useMutation(ADDPAGE, {
        update(cache, { data: { addPage } }) {
            if (addPage.ok) {
                const { getPagesOfThisUser } = cache.readQuery({
                    query: GETPAGES,
                });
                cache.writeQuery({
                    query: GETPAGES,
                    data: {
                        getPagesOfThisUser: [
                            ...getPagesOfThisUser,
                            addPage.pageInfo,
                        ],
                    },
                });
            }
        },
    });
}
export function useMarkFav() {
    return useMutation(MARKFAV, {
        update: (cache, { data: { markFav } }, { variables }) => {
            if (markFav.ok) {
                const { getPagesOfThisUser } = cache.readQuery({
                    query: GETPAGES,
                });
                const newPages = getPagesOfThisUser.map((page) => {
                    if (page.id === variables.pageId) {
                        return { ...page, isFav: !page.isFav };
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
export function useChangeTitle() {
    return useMutation(CHANGETITLE, {
        update: (cache, { data: { changeTitle } }, { variables }) => {
            if (changeTitle.ok) {
                const { getPagesOfThisUser } = cache.readQuery({
                    query: GETPAGES,
                });
                const newPages = getPagesOfThisUser.map((page) => {
                    if (page.id === variables.pageId) {
                        return { ...page, title: variables.title };
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

export const useDeletePage = () => {
    return useMutation(DELETEPAGE, {
        update: (cache, { data: { deletePage } }, { variables }) => {
            if (deletePage.ok) {
                const normalizedId = cache.identify({
                    id: variables.pageId,
                    __typename: 'PageOfAUser',
                });
                cache.evict(normalizedId);
                cache.gc();
            }
        },
    });
};
