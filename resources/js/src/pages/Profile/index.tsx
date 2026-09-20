import React, { FC, Fragment, useContext, useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, Col, Form, Row, Table } from "react-bootstrap";
import api from '@/src/lib/api';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { addMaskCnpj, clearMask, applyMask, getAddress, getStates, getCities, formatDate, convertCentToReal, isValidDocument, optimizeImage } from '@/src/lib/helper';
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2';
import Nav from 'react-bootstrap/Nav';
import If from '@/src/components/common/if/if';
import Select2 from '@/src/components/common/select2';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import { FaBuilding, FaPalette, FaUser, FaMapMarkedAlt } from "react-icons/fa";
import AppContext from '@/src/AppContext/Context';

registerPlugin(FilePondPluginImagePreview);

interface StateCityOption {
    value: number;
    label: string;
}

interface Item {
    entity: {
        name: string;
        email: string;
        cnpj: string;
        zip_code: string;
        street: string;
        number: string;
        complement: string;
        neighborhood: string;
        state_id: number;
        city_id: number;
        contracts: any[];
    };
    config: { primary_color: string; secondary_color: string; logo: string | null };
    user: { name: string; email: string; password: string; password_confirmation: string; phone: string; };
}

const Profile: FC = () => {
    const reduxTheme = useSelector((state: any) => state);
    const themeMode = reduxTheme?.dataThemeMode === 'dark' ? 'dark' : 'light';

    const initialStateItem: Item = {
        entity: {
            name: '',
            email: '',
            cnpj: '',
            zip_code: '',
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            state_id: 0,
            city_id: 0,
        },
        config: { primary_color: '#000', secondary_color: '#000', logo: null },
        user: { name: '', email: '', password: '', password_confirmation: '' }
    };

    const { checkRole, user, setUserLogged, applyTheme } = useContext(AppContext);

    const canEditTheme = () => {
        return (checkRole('Entity') && user?.entity?.config?.main_user?.id === user?.id) || (user?.current_order?.status === 'completed' && checkRole('Lead'));
    }

    const [item, setItem] = useState<Item>(initialStateItem);
    const [disabledSubmitForm, setDisabledSubmitForm] = useState(false);
    const [tabSelected, setTabSelected] = useState<string>(canEditTheme() ? '/company' : '/user');
    const [logo, setLogo] = useState<string>('');
    const [showTextMinDigitPassword, setShowTextMinDigitPassword] = useState<boolean>(false);
    const [showTextPasswordDontMatch, setShowTextPasswordDontMatch] = useState<boolean>(false);
    const [emailIsAvailable, setEmailIsAvailable] = useState<boolean>(false);
    const [stateSelected, setStateSelected] = useState<StateCityOption>({ value: 0, label: 'Selecione um estado' });
    const [citySelected, setCitySelected] = useState<StateCityOption>({ value: 0, label: 'Selecione uma cidade' });
    const [states, setStates] = useState<StateCityOption[]>([]);
    const [cities, setCities] = useState<StateCityOption[]>([]);
    const navigate = useNavigate();
    const MIN_LENGTH_PASSWORD = 8;

    useEffect(() => {
        api.get(`/me`).then(async (response: any) => {
            const user = response.data;
            const entity = response?.data?.entity;

            setItem({
                entity: {
                    name: entity?.name || '',
                    email: entity?.email || '',
                    cnpj: entity?.cnpj ? applyMask(entity?.cnpj, "99.999.999/9999-99") : '',
                    zip_code: entity?.zip_code || '',
                    street: entity?.street || '',
                    number: entity?.number || '',
                    complement: entity?.complement || '',
                    neighborhood: entity?.neighborhood || '',
                    state_id: entity?.state_id || 0,
                    city_id: entity?.city_id || 0,
                    contracts: entity?.contracts ?? []
                },
                config: entity?.config ?? {},
                user: {
                    name: user?.name || '',
                    email: user?.email || '',
                    phone: user?.phone ? applyMask(user?.phone, '(99) 99999-9999') : '',
                    password: '',
                    password_confirmation: '',
                },
            });
            setLogo(entity?.config?.logo_base64 || '');
            setEmailIsAvailable(true);
        });

    }, []);

    useEffect(() => {
         setCities([]);
        setCitySelected({ value: 0, label: 'Selecione uma cidade' });
    }, [stateSelected.value]);

    const handlerChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => { 
        const { name, value } = e.target;

        if (name in item.entity) {
            setItem((prev) => ({
                ...prev,
                entity: {
                    ...prev.entity,
                    [name]: value,
                },
            }));
        } else if (name.startsWith('config.')) {
            const configKey = name.split('.')[1];
            setItem((prev) => ({
                ...prev,
                config: {
                    ...prev.config,
                    [configKey]: value,
                },
            }));
        } else if (name.startsWith('user.')) {
            const userKey = name.split('.')[1];
            setItem((prev) => ({
                ...prev,
                user: {
                    ...prev.user,
                    [userKey]: value,
                },
            }));
        }
    };

    const verifyEmailAvailableOnEmailBlur = () => {
        const params = { email: item.user.email };
        api.get('/email-available', { params }).then((response: any) => {
            const { is_available } = response.data;
            if (is_available) {
                toast.success("E-mail disponível");
                setEmailIsAvailable(true);
            } else {
                setEmailIsAvailable(false);
                toast.error("E-mail indisponível");
            }
        }).catch(() => {
            setEmailIsAvailable(false);
            toast.error("Erro ao verificar o e-mail");
        });
    };

    const verifyIfPasswordIsValid = (value: string) => {
        if (value?.length && value?.length < MIN_LENGTH_PASSWORD) {
            setShowTextMinDigitPassword(true);
        } else {
            setShowTextMinDigitPassword(false);
        }
    };

    const verifyIfPasswordIsMatch = (value: string) => {
        if (
            value?.length >= MIN_LENGTH_PASSWORD &&
            item.user.password_confirmation?.length &&
            value !== item.user.password_confirmation
        ) {
            setShowTextPasswordDontMatch(true);
        } else {
            setShowTextPasswordDontMatch(false);
        }
    };

    const verifyIfPasswordConfirmationIsMatch = (value: string) => {
        if (value !== item.user.password && value?.length) {
            setShowTextPasswordDontMatch(true);
        } else {
            setShowTextPasswordDontMatch(false);
        }
    };

    const haveFieldWithError = () => {
        return showTextMinDigitPassword || showTextPasswordDontMatch || !emailIsAvailable || clearMask(item.user.phone).length < 11;
    };

    const allFieldsRegisterEntityFilled = () => {
        return !!(
            item.entity?.email?.length &&
            clearMask(item.entity?.cnpj)?.length === 14 &&
            item.entity?.name?.length &&
            isValidDocument(item.entity?.cnpj)
        );
    };

    const allFieldsAddressFilled = () => {
        return !!(
            clearMask(item.entity?.zip_code)?.length === 8 &&
            item.entity?.street?.length &&
            item.entity?.neighborhood?.length &&
            stateSelected?.value &&
            citySelected?.value
        );
    };

    const allFieldsConfigFilled = () => {
        return !!(
            item?.config?.primary_color?.length &&
            item?.config?.secondary_color?.length &&
            logo?.length
        );
    };

    const handlerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (tabSelected === '/company') {
            if (!allFieldsRegisterEntityFilled()) {
                toast.error('Preencha todos os campos da empresa antes de continuar.');
                return;
            }
            setTabSelected('/user');
            return;
        }

        if (tabSelected === '/user') {
            if (!!item.entity?.contracts?.length) {
                setTabSelected('/contracts');
                return;
            }
        }

        if (haveFieldWithError()) {
            toast.error('Verifique todos os campos e tente novamente');
            return;
        }

        let data: any = {
            user: { ...item.user },
        };

        if (canEditTheme()) {
            data = {
                ...data,
                user: {
                    ...item.user,
                    phone: clearMask(item.user.phone), 
                },
                config: { ...item.config, logo },
                entity: {
                    ...item.entity,
                    cnpj: clearMask(item.entity?.cnpj),
                    zip_code: clearMask(item.entity?.zip_code),
                    state_id: stateSelected?.value,
                    city_id: citySelected?.value,
                },
            }
        }

        setDisabledSubmitForm(true);
        api.put('/me', data)
            .then((response) => {
                Swal.fire({
                    icon: "success",
                    title: 'Sucesso',
                    text: "Perfil atualizado com sucesso",
                    confirmButtonText: "Ok",
                });
                setUserLogged(response?.data);
                
                setTimeout(() => {
                    applyTheme();
                    navigate('/dashboard');
                }, 1000);
                
            })
            .catch(() => {
                toast.error('Verifique todos os campos e tente novamente');
            })
            .finally(() => setDisabledSubmitForm(false));
    };

    const showButtonCancel = (status: string) => {
        return status === 'active';
    }

    const getStatusContract = (status: string) => {
        if (status === 'cancelled' || status === 'finished') {
            return (<Badge bg={'warning'}>Inativo</Badge>)
        }
        return (<Badge bg={'success'}>Ativo</Badge>)
    }

    const handleCancelContract = async (contractId: number) => {
        Swal.fire({
            title: 'Você tem certeza?',
            text: 'Você não poderá reverter isso!',
            icon: 'warning',
            input: 'textarea',
            inputLabel: 'Motivo do cancelamento (opcional)',
            inputPlaceholder: 'Digite uma observação sobre o cancelamento...'
                ,
            inputAttributes: {
                maxlength: '2000',
                'aria-label': 'Motivo do cancelamento do plano',
            },
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, cancelar plano!',
            cancelButtonText: 'Não'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const description = typeof result.value === 'string' ? result.value.trim() : '';
                    const response = await api.put(`/cancel-contract/${contractId}`, {
                        description_cancellation: description || null,
                    });
                    Swal.fire(
                        'Cancelado!',
                        'Seu contrato foi cancelado com sucesso.',
                        'success'
                    );
                    // Atualiza o estado com os novos dados
                    setItem(prev => ({
                        ...prev,
                        entity: {
                            ...prev.entity,
                            contracts: response.data.contracts // Assumindo que a resposta contém os contratos atualizados
                        }
                    }));

                    setUserLogged(response.data);
                } catch (error) {
                    toast.error('Erro ao cancelar o contrato. Tente novamente.');
                }
            }
        });
    };

    const handleViewCancellationReason = (description?: string | null) => {
        Swal.fire({
            icon: 'info',
            title: 'Motivo do cancelamento',
            text: description?.trim() || 'Nenhuma observação foi informada.',
            confirmButtonText: 'Fechar',
        });
    };

    const renderContracts = () => {
        return item?.entity?.contracts?.map(item => {
            return (
                <tr key={item.id}>
                    <td>{getStatusContract(item.status)}</td>
                    <td>{item?.plan_version?.name}</td>
                    <td>{item?.order?.value > 0 ? convertCentToReal(item?.order?.value) : '-'}</td>
                    <td>{formatDate(item?.activation_date, 'd/m/Y')}</td>
                    <td>{formatDate(item?.expiration_date, 'd/m/Y')}</td>
                   
                    <td className={'d-flex gap-1'}>
                    <If condition={showButtonCancel(item.status)}>
                            <button
                                className="btn btn-outline-danger"
                                onClick={() => handleCancelContract(item.id)} // Chama a função com o ID do contrato
                                data-bs-toggle="tooltip"
                                title="Cancelar plano"
                                type={'button'}
                            ><i className="bi bi-x-circle m-2"></i>
                                Cancelar plano
                            </button>
                    </If>

                    <If condition={item.status === 'cancelled'}>
                        <button
                            className="btn btn-outline-info"
                            onClick={() => handleViewCancellationReason(item.description_cancellation)}
                            data-bs-toggle="tooltip"
                            title="Ver motivo do cancelamento"
                            type={'button'}
                        >
                            <i className="bi bi-chat-left-text m-2"></i>
                            Ver motivo
                        </button>
                    </If>
                    </td>
              </tr>
            );
        });
    }
    
    return (
        <Fragment>
            <style dangerouslySetInnerHTML={{
                __html: `
                .premium-profile-container {
                    display: flex;
                    min-height: calc(100vh - 120px);
                    background: ${themeMode === 'dark' ? '#111317' : '#ffffff'};
                    border-radius: 16px;
                    border: 1px solid ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
                    overflow: hidden;
                    font-family: 'Inter', sans-serif;
                    box-shadow: ${themeMode === 'dark' ? '0 20px 40px rgba(0, 0, 0, 0.4)' : '0 20px 40px rgba(0, 0, 0, 0.05)'};
                }

                .premium-profile-sidebar {
                    width: 300px;
                    background: ${themeMode === 'dark' ? '#171923' : '#f8fafc'};
                    border-right: 1px solid ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
                    padding: 32px 24px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .premium-profile-content {
                    flex: 1;
                    background: ${themeMode === 'dark' ? '#131419' : '#ffffff'};
                    padding: 40px 48px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                }

                .premium-sidebar-title-section {
                    margin-bottom: 32px;
                }

                .premium-sidebar-subtitle {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: #4f46e5;
                    font-weight: 700;
                    margin-bottom: 8px;
                }

                .premium-sidebar-title {
                    font-size: 22px;
                    font-weight: 800;
                    color: ${themeMode === 'dark' ? '#ffffff' : '#0f172a'};
                }

                .premium-tab-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .premium-tab-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px 20px;
                    border-radius: 12px;
                    background: transparent;
                    border: 1px solid transparent;
                    color: ${themeMode === 'dark' ? '#94a3b8' : '#475569'};
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    text-align: left;
                    width: 100%;
                }

                .premium-tab-item:hover:not(:disabled) {
                    background: ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)'};
                    color: ${themeMode === 'dark' ? '#f1f5f9' : '#0f172a'};
                }

                .premium-tab-item:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .premium-tab-item.active {
                    background: ${themeMode === 'dark' ? 'rgba(26, 86, 219, 0.08)' : '#eff6ff'};
                    border-color: ${themeMode === 'dark' ? 'rgba(26, 86, 219, 0.3)' : '#3b82f6'};
                    color: ${themeMode === 'dark' ? '#3b82f6' : '#1d4ed8'};
                    box-shadow: 0 0 15px rgba(26, 86, 219, 0.1);
                    font-weight: 600;
                }

                .premium-tab-icon {
                    font-size: 20px;
                }

                .premium-form-section {
                    animation: fadeIn 0.4s ease-out;
                }

                .premium-form-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: ${themeMode === 'dark' ? '#ffffff' : '#0f172a'};
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .premium-input-group {
                    position: relative;
                    margin-bottom: 24px;
                }

                .premium-input-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 800;
                    color: ${themeMode === 'dark' ? '#94a3b8' : '#1e293b'};
                    margin-bottom: 8px;
                    letter-spacing: 0.5px;
                }

                .premium-control {
                    width: 100%;
                    padding: 14px 16px;
                    background: ${themeMode === 'dark' ? '#1a1b23' : '#ffffff'};
                    border: 1px solid ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#cbd5e1'};
                    border-radius: 10px;
                    color: ${themeMode === 'dark' ? '#f8fafc' : '#0f172a'};
                    font-size: 14px;
                    transition: all 0.3s;
                }

                .premium-control:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
                    background: ${themeMode === 'dark' ? '#20212b' : '#ffffff'};
                }

                .premium-control:disabled {
                    background: ${themeMode === 'dark' ? '#14151a' : '#f1f5f9'};
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .premium-footer-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 40px;
                    padding-top: 24px;
                    border-top: 1px solid ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
                }

                .premium-btn-back {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: transparent;
                    border: 1.5px solid ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'};
                    color: ${themeMode === 'dark' ? '#94a3b8' : '#475569'};
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .premium-btn-back:hover {
                    background: ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9'};
                    color: ${themeMode === 'dark' ? '#f1f5f9' : '#0f172a'};
                    border-color: ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#94a3b8'};
                }

                .premium-btn-submit {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
                    color: #ffffff;
                    border: none;
                    padding: 14px 28px;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 8px 20px rgba(30, 64, 175, 0.3);
                    transition: all 0.3s;
                }

                .premium-btn-submit:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 25px rgba(30, 64, 175, 0.45);
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                }

                .premium-btn-submit:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* Plans Table Style */
                .premium-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 16px;
                }

                .premium-table thead tr {
                    background: ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc'};
                    border-bottom: 1px solid ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#e2e8f0'};
                }

                .premium-table thead th {
                    padding: 14px 20px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    white-space: nowrap;
                    text-align: left;
                }

                .premium-table tbody tr {
                    border-bottom: 1px solid ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9'};
                    transition: background 0.2s;
                }

                .premium-table tbody tr:hover {
                    background: ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.015)' : '#f8fafc'};
                }

                .premium-table tbody td {
                    padding: 16px 20px;
                    font-size: 14px;
                    color: ${themeMode === 'dark' ? '#cbd5e1' : '#475569'};
                    vertical-align: middle;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                `
            }} />

            <div className="premium-profile-container">
                {/* Sidebar Navigation */}
                <div className="premium-profile-sidebar">
                    <div>
                        <div className="premium-sidebar-title-section">
                            <div className="premium-sidebar-subtitle">Configurações</div>
                            <h2 className="premium-sidebar-title">Meu Perfil</h2>
                        </div>

                        <div className="premium-tab-list">
                            {canEditTheme() && (
                                <button
                                    type="button"
                                    className={`premium-tab-item ${tabSelected === '/company' ? 'active' : ''}`}
                                    onClick={() => setTabSelected('/company')}
                                >
                                    <FaBuilding className="premium-tab-icon" />
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Dados da Empresa</div>
                                        <div style={{ fontSize: '11px', opacity: 0.7 }}>Nome, CNPJ</div>
                                    </div>
                                </button>
                            )}

                            <button
                                type="button"
                                className={`premium-tab-item ${tabSelected === '/user' ? 'active' : ''}`}
                                onClick={() => setTabSelected('/user')}
                                disabled={canEditTheme() && !allFieldsRegisterEntityFilled()}
                            >
                                <FaUser className="premium-tab-icon" />
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Dados do Usuário</div>
                                    <div style={{ fontSize: '11px', opacity: 0.7 }}>Nome, Usuário, Celular</div>
                                </div>
                            </button>

                            {canEditTheme() && !!item.entity?.contracts?.length && (
                                <button
                                    type="button"
                                    className={`premium-tab-item ${tabSelected === '/contracts' ? 'active' : ''}`}
                                    onClick={() => setTabSelected('/contracts')}
                                    disabled={!allFieldsRegisterEntityFilled()}
                                >
                                    <FaBuilding className="premium-tab-icon" />
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Planos Contratados</div>
                                        <div style={{ fontSize: '11px', opacity: 0.7 }}>Status, Vigência</div>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Content Area */}
                <form onSubmit={handlerSubmit} className="premium-profile-content">
                    <div>
                        {tabSelected === '/company' && (
                            <div className="premium-form-section">
                                <h3 className="premium-form-title">
                                    <FaBuilding size={18} />
                                    <span>Identificação da Empresa</span>
                                </h3>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="premium-input-group">
                                            <label className="premium-input-label">Nome da Empresa</label>
                                            <input
                                                name="name"
                                                value={item.entity?.name}
                                                onChange={handlerChange}
                                                type="text"
                                                required
                                                className="premium-control"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="premium-input-group">
                                            <label className="premium-input-label">Email da Empresa</label>
                                            <input
                                                name="email"
                                                value={item.entity?.email}
                                                onChange={handlerChange}
                                                type="email"
                                                required
                                                className="premium-control"
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="premium-input-group">
                                            <label className="premium-input-label">CNPJ</label>
                                            <input
                                                onKeyUp={(e: any) => {
                                                    const cnpj = e.target.value;
                                                    const isValid = isValidDocument(cnpj);
                                                    if (!isValid && clearMask(cnpj).length === 14) {
                                                         toast('CNPJ inválido');
                                                    }
                                                }}
                                                value={item.entity?.cnpj}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const newEvent = {
                                                        ...e,
                                                        target: {
                                                            ...e.target,
                                                            name: 'cnpj',
                                                            value: addMaskCnpj(e.target.value),
                                                        },
                                                    };
                                                    handlerChange(newEvent as React.ChangeEvent<HTMLInputElement>);
                                                }}
                                                type="text"
                                                required
                                                className="premium-control"
                                                placeholder="00.000.000/0000-00"
                                                maxLength={18}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {tabSelected === '/user' && (
                            <div className="premium-form-section">
                                <h3 className="premium-form-title">
                                    <FaUser size={18} />
                                    <span>Identificação do Usuário</span>
                                </h3>

                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="premium-input-group">
                                            <label className="premium-input-label">Nome Completo</label>
                                            <input
                                                name="user.name"
                                                value={item.user.name}
                                                onChange={handlerChange}
                                                type="text"
                                                required
                                                className="premium-control"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="premium-input-group">
                                            <label className="premium-input-label">Usuário (E-mail)</label>
                                            <input
                                                name="user.email"
                                                className={`premium-control ${!emailIsAvailable && item.user.email?.length ? 'border-danger' : ''}`}
                                                onBlur={verifyEmailAvailableOnEmailBlur}
                                                value={item.user.email}
                                                onChange={handlerChange}
                                                type="email"
                                                required
                                                disabled={true}
                                                placeholder="usuario@exemplo.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="premium-input-group">
                                            <label className="premium-input-label">Celular</label>
                                            <input
                                                name="user.phone"
                                                value={item.user.phone}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const newEvent = {
                                                        ...e,
                                                        target: {
                                                            ...e.target,
                                                            name: 'user.phone',
                                                            value: applyMask(e.target.value, '(99) 99999-9999'),
                                                        },
                                                    };
                                                    handlerChange(newEvent as React.ChangeEvent<HTMLInputElement>);
                                                }}
                                                type="text"
                                                required
                                                className="premium-control"
                                                placeholder="(99) 99999-9999"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="premium-input-group">
                                            <label className="premium-input-label">Senha</label>
                                            <input
                                                name="user.password"
                                                value={item.user.password}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    handlerChange(e);
                                                    verifyIfPasswordIsValid(e.target.value);
                                                    verifyIfPasswordIsMatch(e.target.value);
                                                }}
                                                type="password"
                                                className="premium-control"
                                                placeholder="********"
                                            />
                                            {showTextMinDigitPassword && (
                                                <Badge className="mt-2 w-100" bg="danger">
                                                    A senha deve ter no mínimo {MIN_LENGTH_PASSWORD} dígitos
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="premium-input-group">
                                            <label className="premium-input-label">Confirmar Senha</label>
                                            <input
                                                name="user.password_confirmation"
                                                value={item.user.password_confirmation}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    handlerChange(e);
                                                    verifyIfPasswordConfirmationIsMatch(e.target.value);
                                                }}
                                                type="password"
                                                className="premium-control"
                                                placeholder="********"
                                            />
                                            {showTextPasswordDontMatch && (
                                                <Badge className="mt-2 w-100" bg="danger">
                                                    Senhas não conferem
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {tabSelected === '/contracts' && (
                            <div className="premium-form-section">
                                <h3 className="premium-form-title">
                                    <FaBuilding size={18} />
                                    <span>Planos Contratados</span>
                                </h3>

                                <div style={{ overflowX: 'auto' }}>
                                    <table className="premium-table">
                                        <thead>
                                            <tr>
                                                <th scope="col">Status</th>
                                                <th scope="col">Plano</th>
                                                <th scope="col">Valor</th>
                                                <th scope="col">Data de Ativação</th>
                                                <th scope="col">Data de Expiração</th>
                                                <th scope="col">Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {renderContracts()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="premium-footer-actions">
                        <button
                            type="button"
                            className="premium-btn-back"
                            onClick={() => {
                                if (tabSelected === '/contracts') {
                                    setTabSelected('/user');
                                } else if (tabSelected === '/user') {
                                    if (canEditTheme()) {
                                        setTabSelected('/company');
                                    } else {
                                        navigate('/dashboard');
                                    }
                                } else {
                                    navigate('/dashboard');
                                }
                            }}
                        >
                            <span>Voltar</span>
                        </button>

                        <button
                            type="submit"
                            disabled={disabledSubmitForm}
                            className="premium-btn-submit"
                        >
                            <span>
                                {((tabSelected === '/user' && !item.entity?.contracts?.length) || tabSelected === '/contracts' || !canEditTheme())
                                    ? 'Salvar Alterações'
                                    : 'Próximo'}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
            <ToastContainer />
        </Fragment>
    );
};

export default Profile;