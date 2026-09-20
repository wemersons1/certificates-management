import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import brazilFlag from "../../../assets/images/flags/brazilFlag.svg";
import colombiaFlag from "../../../assets/images/flags/colombiaFlag.svg";
import usFlag from "../../../assets/images/flags/usaFlag.svg";

const LanguageSelector: React.FC = () => {
    const { t, i18n } = useTranslation();

    const handleChangeLanguage = (language: string) => {
        i18n.changeLanguage(language);
    };

    return (
        <Dropdown className="header-element country-selector">
            <Dropdown.Toggle variant='' aria-label="anchor" className="header-link dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                <i className="las la-language header-link-icon"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu as="ul" className="main-header-dropdown dropdown-menu border-0" data-popper-placement="none">
                <Dropdown.Item 
                    className="d-flex align-items-center border-0" 
                    onClick={() => handleChangeLanguage('ptBr')}
                >
                    <span className="avatar avatar-xs lh-1 me-2">
                        <img src={brazilFlag} alt="Bandeira do Brasil" />
                    </span>
                    {t("languages.ptBr")}
                </Dropdown.Item>
                <Dropdown.Item 
                    className="d-flex align-items-center border-0" 
                    onClick={() => handleChangeLanguage('es')}
                >
                    <span className="avatar avatar-xs lh-1 me-2">
                        <img src={colombiaFlag} alt="Bandeira da Colômbia" />
                    </span>
                    {t("languages.es")}
                </Dropdown.Item>
                <Dropdown.Item 
                    className="d-flex align-items-center border-0" 
                    onClick={() => handleChangeLanguage('enUs')}
                >
                    <span className="avatar avatar-xs lh-1 me-2">
                        <img src={usFlag} alt="Bandeira dos EUA" />
                    </span>
                    {t("languages.enUs")}
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default LanguageSelector;