import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const Master = () => {
    const Users = React.lazy(() => import('@/src/pages/Users'));
    const User = React.lazy(() => import('@/src/pages/Users/User'));
    const UserView = React.lazy(() => import('@/src/pages/Users/View'));

    const Companies = React.lazy(() => import('@/src/pages/Companies'));
    const Company = React.lazy(() => import('@/src/pages/Companies/Company'));

    const Entities = React.lazy(() => import('@/src/pages/Entities'));
    const Entity = React.lazy(() => import('@/src/pages/Entities/Entity'));

    const Plans = React.lazy(() => import('@/src/pages/Plans'));
    const Plan = React.lazy(() => import('@/src/pages/Plans/Plan'));
    const CreditPackages = React.lazy(() => import('@/src/pages/CreditPackages'));

    const TermsAndConditions = React.lazy(() => import('@/src/pages/TermsAndConditions'));
    const TermAndCondition = React.lazy(() => import('@/src/pages/TermsAndConditions/TermAndCondition'));
    
    const Dashboard = React.lazy(() => import('@/src/pages/Dashboard'));

    const Profile = React.lazy(() => import('@/src/pages/Profile'));
    
    const NotificationSends = React.lazy(() => import('@/src/pages/NotificationSends'));
    
    const Events = React.lazy(() => import('@/src/pages/Events'));
    const EventForm = React.lazy(() => import('@/src/pages/Events/Event'));
    const EventView = React.lazy(() => import('@/src/pages/Events/View'));

    const AuditLogs = React.lazy(() => import('@/src/pages/AuditLogs'));

    const Courses = React.lazy(() => import('@/src/pages/Courses'));
    const CourseView = React.lazy(() => import('@/src/pages/Courses/View'));
    const MasterCourseCreate = React.lazy(() => import('@/src/pages/Courses/Cadastrar'));

    return (
        <React.Suspense>
            <Routes>
                <Route path={`/dashboard`} element={<Dashboard />} />
                <Route path={`/profile`} element={<Profile />} />
                <Route path={`/users`} element={<Users />} />  
                <Route path={`/users/create`} element={<User />} />  
                <Route path={`/users/:userId/view`} element={<UserView />} />
                <Route path={`/users/:userId`} element={<User />} />

                <Route path={`/companies`} element={<Companies />} />  
                <Route path={`/companies/create`} element={<Company />} />  
                <Route path={`/companies/:companyId`} element={<Company />} />

                <Route path={`/entities`} element={<Entities />} />  
                <Route path={`/entities/create`} element={<Entity />} />  
                <Route path={`/entities/:entityId`} element={<Entity />} />

                <Route path={`/plans`} element={<Plans />} />  
                <Route path={`/plans/create`} element={<Plan />} />  
                <Route path={`/plans/:planId`} element={<Plan />} />

                <Route path={`/credit-packages`} element={<CreditPackages />} />

                <Route path={`/terms-and-conditions`} element={<TermsAndConditions />} />  
                <Route path={`/terms-and-conditions/create`} element={<TermAndCondition />} />  
                <Route path={`/terms-and-conditions/:termId`} element={<TermAndCondition />} />

                <Route path={`/notification-sends`} element={<NotificationSends />} />

                <Route path={`/events`} element={<Events />} />
                <Route path={`/events/create`} element={<EventForm />} />
                <Route path={`/events/:eventId/view`} element={<EventView />} />
                <Route path={`/events/:eventId`} element={<EventForm />} />

                <Route path={`/audit-logs`} element={<AuditLogs />} />

                <Route path={`/courses`} element={<Courses />} />
                <Route path={`/courses/cadastrar`} element={<MasterCourseCreate />} />
                <Route path={`/courses/:courseId/view`} element={<CourseView />} />

                <Route path="*" element={<Navigate to="/audit-logs" />} />
        
            </Routes>
        </React.Suspense>
    );
}

export default Master;
