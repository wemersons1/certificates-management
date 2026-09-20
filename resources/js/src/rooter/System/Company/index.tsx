import AppContext from '@/src/AppContext/Context';
import React, { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const Company = () => {
    const { hasPermission } = useContext(AppContext);
    const Users = React.lazy(() => import('@/src/pages/Users'));
    const User = React.lazy(() => import('@/src/pages/Users/User'));
    const UserView = React.lazy(() => import('@/src/pages/Users/View'));

    const Employees = React.lazy(() => import('@/src/pages/Students'));

    const Events = React.lazy(() => import('@/src/pages/Events'));
    const EventForm = React.lazy(() => import('@/src/pages/Events/Event'));
    const EventView = React.lazy(() => import('@/src/pages/Events/View'));

    const Documents = React.lazy(() => import('@/src/pages/Documents'));
    const DocumentView = React.lazy(() => import('@/src/pages/Documents/DocumentView'));
    const Profile = React.lazy(() => import('@/src/pages/Profile'));

    return (
        <React.Suspense>
            <Routes>  
                <Route path={`/users/:userId/view`} element={<UserView />} />
                <Route path={`/users/:userId`} element={<User />} />
                { hasPermission('Cadastrar') && <Route path={`/users/create`} element={<User />} />}
                <Route path={`/users`} element={<Users />} /> 

                <Route path={`/employees`} element={<Employees />} /> 

                <Route path={`/documents/:documentId/view`} element={<DocumentView />} />
                <Route path={`/documents`} element={<Documents />} />

                <Route path={`/companies/:companyId/employees`} element={<Employees />} /> 

                <Route path={`/events`} element={<Events />} />
                <Route path={`/events/create`} element={<EventForm />} />
                <Route path={`/events/:eventId/view`} element={<EventView />} />
                <Route path={`/events/:eventId`} element={<EventForm />} />

                <Route path={`/profile`} element={<Profile />} /> 

                <Route path="*" element={<Navigate to="/documents" />} />
            </Routes>
        </React.Suspense>
    );
}

export default Company;
