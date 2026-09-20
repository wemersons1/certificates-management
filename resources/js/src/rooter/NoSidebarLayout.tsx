// pages/NoLayout.tsx

import React, { Fragment } from 'react';
import { Provider } from 'react-redux';
import store from '../redux/store';
import { Outlet } from 'react-router-dom';

const NoSidebarLayout = () => {
    return (
        <Fragment>
        <Provider store={store}>
            {/* Apenas o conteúdo principal da página será renderizado */}
            <div className="">
            <Outlet />
            </div>
        </Provider>
        </Fragment>
    );
};

export default NoSidebarLayout;
