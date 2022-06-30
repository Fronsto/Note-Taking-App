import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {
    ApolloClient,
    ApolloProvider,
    InMemoryCache,
    createHttpLink,
    from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import jwtDecode from 'jwt-decode';
import { setAccessToken, getAccessToken } from './contexts/accessToken';

const httpLink = createHttpLink({
    uri: process.env.REACT_APP_BACKEND_URL + '/graphql',
    credentials: 'include',
});

const authLink = setContext((_, { headers }) => {
    const token = getAccessToken();
    return {
        headers: {
            ...headers,
            authorization: token !== '' ? `Bearer ${token}` : '',
        },
    };
});

const tokenRefreshLink = new TokenRefreshLink({
    accessTokenField: 'accessToken',
    isTokenValidOrUndefined: () => {
        const token = getAccessToken();
        if (token === '') {
            return true;
        }
        try {
            const { exp } = jwtDecode(token);
            if (Date.now() >= exp * 1000) {
                return false;
            }
            return true;
        } catch (err) {
            return false;
        }
    },
    fetchAccessToken: () => {
        return fetch(process.env.REACT_APP_BACKEND_URL + '/refresh_token', {
            method: 'POST',
            credentials: 'include',
        });
    },
    handleFetch: async (accessToken) => {
        setAccessToken(accessToken);
        if (accessToken === '') {
            await client.resetStore();
        }
    },
    handleError: (err) => {},
});
const client = new ApolloClient({
    link: from([tokenRefreshLink, authLink, httpLink]),
    cache: new InMemoryCache(),
});

ReactDOM.render(
    <React.StrictMode>
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
