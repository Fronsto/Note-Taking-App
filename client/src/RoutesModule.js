import React from 'react';
import {
    BrowserRouter as Router,
    Navigate,
    Route,
    Routes,
} from 'react-router-dom';
import { ActualAppLoad } from './Components/ActualAppLoad';
import Card from './Components/Auth/CustomComps';
import EmailLogin from './Components/Auth/EmailLogin';
import EmailReg from './Components/Auth/EmailReg';
import Loading from './Components/Auth/Loading';
import HomePage from './Components/HomePage';
import { useMeQuery } from './graphql/auth';

const RoutesModule = () => {
    const { data, loading } = useMeQuery();
    if (loading) {
        return (
            <Card>
                <Loading />
            </Card>
        );
    }
    return (
        <Router>
            {!(!loading && data && data.me) ? (
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<EmailLogin />} />
                    <Route path="/register" element={<EmailReg />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            ) : (
                <Routes>
                    <Route path="/:pageId" element={<ActualAppLoad />} />
                    <Route path="/" element={<ActualAppLoad />} />
                </Routes>
            )}
        </Router>
    );
};

const NotFound = () => {
    return <Navigate to="/login" replace />;
};

export default RoutesModule;
