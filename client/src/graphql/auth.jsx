import { gql, useQuery, useMutation } from '@apollo/client';
import { setAccessToken } from '../contexts/accessToken';
import { useNavigate } from 'react-router-dom';

const REGISTER = gql`
    mutation Register($password: String!, $email: String!, $username: String!) {
        register(password: $password, email: $email, username: $username) {
            message
            ok
        }
    }
`;
const LOGIN = gql`
    mutation Login($password: String!, $email: String!) {
        login(password: $password, email: $email) {
            accessToken
            user {
                id
                email
                username
            }
        }
    }
`;
const LOGOUT = gql`
    mutation Logout {
        logout
    }
`;
export const MEQUERY = gql`
    query Me {
        me {
            id
            username
            email
        }
    }
`;
const REVOKETOKEN = gql`
    mutation RevokeRefreshToken($userId: Int!) {
        RevokeRefreshToken(userId: $userId)
    }
`;

export function useRegisterMutation() {
    return useMutation(REGISTER);
}
export function useLoginMutation() {
    return useMutation(LOGIN);
}
export function useLogoutMutation() {
    return useMutation(LOGOUT);
}
export function useMeQuery() {
    return useQuery(MEQUERY, {
        fetchPolicy: 'cache-first',
    });
}

export function useRevokeToken() {
    return useMutation(REVOKETOKEN);
}

export function useLogout() {
    const navigate = useNavigate();
    const [logoutFunction, { client, error }] = useLogoutMutation();
    return async function logout() {
        await logoutFunction();
        if (error) console.log(error.message);
        setAccessToken('');
        await client.resetStore();
        navigate('/');
    };
}
