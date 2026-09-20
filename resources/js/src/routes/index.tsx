import React, { useContext, useEffect, useState } from 'react';
import AppContext from "../AppContext/Context";
import PagesFree from '../rooter/PagesFree';
import System from '../rooter/System';
import App from '../rooter/App';
import { Route, Routes as RouterRoutes, useLocation } from 'react-router-dom';

const PublicEventWelcome = React.lazy(() => import('@/src/pages/Events/PublicWelcome'));

const Routes = () => {
    const { user, token } = useContext(AppContext);
    const location = useLocation();

    if (location.pathname.startsWith('/public/events')) {
        return (
            <React.Suspense>
                <RouterRoutes>
                    <Route path="/public/events/checkin" element={<PublicEventWelcome />} />
                    <Route path="/public/events/checkin/:token" element={<PublicEventWelcome />} />
                    <Route path="/public/events/code" element={<PublicEventWelcome />} />
                    <Route path="/public/events/code/:code" element={<PublicEventWelcome />} />
                    <Route path="/public/events/:uuid" element={<PublicEventWelcome />} />
                </RouterRoutes>
            </React.Suspense>
        );
    }

    if (!user) {
        return <PagesFree />;
    }

    return (
        <App>
            {user && token ? <System /> : null}
        </App>
    );
};

export default Routes;
