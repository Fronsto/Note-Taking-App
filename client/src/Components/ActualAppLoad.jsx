import React from 'react';

import { useGetPages } from '../graphql/page.jsx';
import Loading from './Auth/Loading';
import Card from './Auth/CustomComps';
import ActualApp from './ActualApp.jsx';

export const ActualAppLoad = () => {
    const { data, loading, error } = useGetPages();
    if (loading) {
        return (
            <Card>
                <Loading alt="" />
            </Card>
        );
    }
    if (error || !data || !data.getPagesOfThisUser) {
        return (
            <Card>
                <Loading alt="Some unexpected error occurred. Please try again after few minutes." />
            </Card>
        );
    }
    return <ActualApp />;
};
