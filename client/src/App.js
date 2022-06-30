import React, { useEffect, useState } from 'react';
import RoutesModule from './RoutesModule';
import Card from './Components/Auth/CustomComps';
import { setAccessToken } from './contexts/accessToken';
import Loading from './Components/Auth/Loading';

const App = () => {
    const [loading, setLoading] = useState(true);
    const [alt, setAlt] = useState('');
    useEffect(() => {
        fetch(process.env.REACT_APP_BACKEND_URL + '/refresh_token', {
            method: 'POST',
            credentials: 'include',
        })
            .then(async (x) => {
                const { accessToken } = await x.json();
                setAccessToken(accessToken);
                setLoading(false);
            })
            .catch((err) => {
                setAlt(
                    'There seems to be some problem with the server, please try again after few minutes.'
                );
            });
    }, []); // eslint-disable-line

    if (loading) {
        return (
            <Card title="">
                <Loading alt={alt} />
            </Card>
        );
    }

    return <RoutesModule />;
};

export default App;
