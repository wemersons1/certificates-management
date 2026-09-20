import React, { useCallback, useState } from 'react';
import AppContext from "./Context";
import api from "../lib/api";
import { hexToRgb } from '../lib/helper';

const AppProvider = ({ children }: any) => {
    const [user, setUser] = useState(() => {
        const userLocalStorage = localStorage.getItem('user');
        return userLocalStorage ? JSON.parse(userLocalStorage) : null;
    });
    const [token, setToken] = useState(() => {
        const tokenLocalStorage = localStorage.getItem('token');
        return tokenLocalStorage || '';
    });
    const initialStateTheme = {entity: {id: null}};
    const [theme, setTheme] = useState(() => {
        return user?.entity?.config ?? initialStateTheme;
    });

    const sign = useCallback(async (email: string, password: string) => {
        const entity_id = theme?.entity?.id ?? null;
        const response = await api.post('/login', { email, password, entity_id });

        if (response?.data?.user) {
            const { user, token } = response.data;
            setUser(user);
            setToken(token);

            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);

            return {
                data: {
                    message: response.data.message,
                    user: response.data.user
                }
            };
        }

        throw new Error("Usuário ou senha inválidos");
    }, [theme]);

    const signOut = () => {
        api.delete('/logout').finally(() => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
            setToken('');
            window.location.pathname = '/';
        });
    }

    const applyTheme = (configRequest: any = null) => {
        document.documentElement.style.setProperty('--primary-rgb', '255 ,255 ,255');
        document.documentElement.style.setProperty('--secondary-rgb', '255 ,255 ,255');
        const getConfig = () => {
            if (configRequest) return configRequest;

            if (user?.entity?.config) {
                return user?.entity?.config;
            }
            
            const userStorage = localStorage.getItem('user');
            
            if (userStorage) {
                return JSON.parse(userStorage)?.entity?.config;
            }

            return null;
        };

        const config = getConfig();
 
        if (config) {
            document.documentElement.style.setProperty('--primary-rgb', hexToRgb(config?.secondary_color));
            document.documentElement.style.setProperty('--secondary-rgb', hexToRgb(config?.secondary_color));

            localStorage.setItem('theme', JSON.stringify(config));
        } else {
            document.documentElement.style.setProperty('--primary-rgb', '84, 10, 245');
            document.documentElement.style.setProperty('--secondary-rgb', '245, 111, 75');
            setTheme(initialStateTheme);
        }
        
        return config;
    }

    const checkRole = (role: string) => {
        return user?.role?.name === role;
    }

    const hasPermission = (permission: string) => {
        if (user?.entity?.config?.main_user?.id == user?.id) {
            return true;
        }

        return user?.permissions?.some((item: { name: string }) => item.name === permission) ?? false;
    }

    const setUserLogged = (user: any) => {
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
    }

    const setUserToken = (token: string) => {
        localStorage.setItem('token', token);
        setToken(token);
    }

    const userIsBlock = () => {
        return (checkRole('Lead') && user?.email_verified_at) || ((checkRole('Entity')) && user?.entity?.current_contract?.status !== 'active');
    }

    return (
        <AppContext.Provider value={{
            sign, 
            signOut, 
            user, 
            token, 
            setUserLogged, 
            setUserToken, 
            checkRole, 
            applyTheme, 
            theme, 
            hasPermission,
            userIsBlock
        }}>
            {children}
        </AppContext.Provider>
    );
}

export default AppProvider;
