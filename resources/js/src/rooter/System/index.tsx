import { useContext, useEffect } from 'react';
import AppContext from '../../AppContext/Context';
import api from '../../lib/api';
import Master from './Master';
import Company from './Company';
import Lead from './Lead';
import Entity from './Entity';
import { useNavigate } from 'react-router-dom';

const System = () => {
    const { setUserLogged, checkRole, user, userIsBlock, applyTheme } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/me')
        .then((response) => {
            setUserLogged(response.data);  
             
            if (user?.current_order?.status === 'completed' && !user?.entity && user?.email_verified_at) {
                navigate('/profile');
			} else if (userIsBlock()){
				navigate('/checkout');
            }
	
        })
        .catch((error) => {
            console.error("Error getting user data: ", error);
        });
        setTimeout(() => {
            applyTheme();
        });
    }, [])

    if(checkRole('Master')){
        return <Master/>
    } else if (checkRole('Lead') || !user?.email_verified_at || userIsBlock()) {
        return <Lead/>
    } else if (checkRole('Entity')) {
        return <Entity/>
    } else if (checkRole('Company')) {
        return <Company/>
    }
}

export default System;
