import AppContext from '@/src/AppContext/Context';
import React, { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const Lead = () => {
    const { user } = useContext(AppContext);
    const NotFound = React.lazy(() => import('@/src/pages/NotFound'));
    const Checkout = React.lazy(() => import('@/src/pages/Checkout'));
    const ConfirmationCode = React.lazy(() => import('@/src/pages/ConfirmationCode'));
    const Profile = React.lazy(() => import('@/src/pages/Profile'));
    const PaymentDetails = React.lazy(() => import('@/src/pages/PaymentDetails'));

    const availableProfile = () => {
        return user?.current_order?.status === 'completed'
    }

    if (! user?.email_verified_at) {

        return (
            <React.Suspense>
            <Routes>
                <Route path={`/confirmation-code`} element={<ConfirmationCode />} />
                <Route path={'/not-found'} element={<NotFound/>} />
                <Route path="*" element={<Navigate to="/not-found" />} />
            </Routes>
        </React.Suspense>
        );
    }
    
    return (
        <React.Suspense>
            <Routes>
                <Route path={`/checkout`} element={<Checkout />} />
                <Route path={`/payment-status`} element={<PaymentDetails />} />
                {availableProfile() && <Route path={`/profile`} element={<Profile />} />}
                <Route path="*" element={<Navigate to="/checkout" />} />
            </Routes>
        </React.Suspense>
    );
}

export default Lead;
