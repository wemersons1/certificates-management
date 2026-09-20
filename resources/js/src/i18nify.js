import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ptBrTranslation from './locales/ptBr.json';
import enUsTranslation from './locales/enUs.json';
import esTranslation from './locales/es.json';



const resources = {
    enUs: {
        translation: enUsTranslation,
    },
    ptBr: {
        translation: ptBrTranslation,
    },
    es: {
        translation: esTranslation,
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        debug: true,
        lng: 'enUs',
        fallbackLng: 'enUs',
        interpolation: {
            escapeValue: false,
        },
        react: {
            wait: true
        },
    });

export default i18n;