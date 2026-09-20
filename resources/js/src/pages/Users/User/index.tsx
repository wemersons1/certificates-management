import React, { FC, Fragment, useContext, useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, Col, Form, Row } from "react-bootstrap";
import api from '@/src/lib/api';
import { useNavigate } from 'react-router-dom';
import {getIdBasedInName, messageErrorAxios } from '@/src/lib/helper';
import { ToastContainer, toast } from 'react-toastify';
import If from '@/src/components/common/if/if';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Select2 from '@/src/components/common/select2';
import AppContext from '@/src/AppContext/Context';

const MIN_LENGTH_PASSWORD = 8;
const DISALLOWED_MENU_PERMISSION_NAMES = ['Companies', 'Templates', 'Positions', 'Notifications'];

interface UserPropos { };
interface Role {
    name: string;
    id: number;
}
interface User {
    name: string;
    email: string;
    phone: string;
    role_id: number;
    company_id: number | null;
    entity_id: number | null;
    active: boolean;
    password: string;
    password_confirmation: string;
    is_main_user: boolean;
    welcome_message_sent: boolean;
    permissions?: number[]; // Adicionando permissions ao tipo User
}

interface UserPermission {
    id: number;
    name: string;
}

const User: FC<UserPropos> = () => {
    const { checkRole, user: userLogged } = useContext(AppContext);
    
    const initialStateUser = {
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role_id: checkRole('Entity') ? 2 : 0,
        active: true,
        company_id: null,
        entity_id: null,
        is_main_user: true,
        welcome_message_sent: false
    };

    const [roles, setRoles] = useState<Role[]>([]);
    const [user, setUser] = useState<User>(initialStateUser);
    const [showTextMinDigitPassword, setShowTextMinDigitPassword] = useState<boolean>(false);
    const [showTextPasswordDontMatch, setShowTextPasswordDontMatch] = useState<boolean>(false);
    const [emailIsAvailable, setEmailIsAvailable] = useState<boolean>(false);
    const [disabledSubmitForm, setDisabledSubmitForm] = useState(false);
    const [passwordRequired, setPasswordRequired] = useState(true);
    const [companyOptions, setCompanyOptions] = useState([]);
    const [segmentsOptions, setSegmentsOptions] = useState([]);
    const [selectedSegment, setSelectedSegment] = useState({value: 0, label: ''});
    const { userId } = useParams();
    const [companyOptionSelected, setCompanyOptionSelected] = useState({value: 0, label: ''});
    const [entityOptionSelected, setEntityOptionSelected] = useState({value: 0, label: ''});
    const [entitiesOptions, setEntitiesOptions] = useState([]);
    const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]); // Novo estado para permissões selecionadas
    const [selectedMenuItems, setSelectedMenuItems] = useState<number[]>([]); // Novo estado para permissões selecionadas
    const [menuItems, setMenuItems] = useState<any[]>([]);

    const navigate = useNavigate();

    const handleSendMessage = () => {
        const now = new Date();
        const hour = now.getHours();
        let greeting = 'Bom dia';
        let farewell = 'Tenha um bom dia!';
        if (hour >= 12 && hour < 18) {
            greeting = 'Boa tarde';
            farewell = 'Tenha uma boa tarde!';
        } else if (hour >= 18) {
            greeting = 'Boa noite';
            farewell = 'Tenha uma boa noite!';
        }

        const message = `${greeting} ${user.name}, tudo bem?

Sou o ${userLogged?.name}, representante do sistema FlashCertificados, qualquer dúvida sobre configuração de curso estou a disposição.

${farewell}`;

        const phone = user.phone.replace(/\D/g, ''); // remove non-digits
        const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;

        // Open WhatsApp
        window.open(whatsappUrl, '_blank');

        // Ask if message was sent
        Swal.fire({
            title: 'Mensagem enviada?',
            text: 'A mensagem foi enviada com sucesso?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim, foi enviada',
            cancelButtonText: 'Não',
        }).then((result) => {
            if (result.isConfirmed) {
                // Mark as sent
                api.patch(`/users/${userId}/mark-welcome-message-sent`)
                    .then(() => {
                        toast.success('Mensagem marcada como enviada.');
                        setUser({...user, welcome_message_sent: true});
                    })
                    .catch(() => {
                        toast.error('Erro ao marcar mensagem como enviada.');
                    });
            }
        });
    };

    useEffect(() => {
        let params = {
            all: 1
        };

        api.get('/roles', {params}).then(response => {
            if (response?.data && response?.data[1]) {
                setRoles([
                    response.data[0],
                    response.data[1],
                ]);
            }
        });

        api.get('/user-permissions').then(response => {
            setUserPermissions(response.data);
        });


        api.get('/menu-items').then(response => {
            setMenuItems(response.data);
        });

        api.get('/companies', {params}).then(response => {
            setCompanyOptions(response.data.map((item: any) => {
                return {
                    value: item.id,
                    label: item.name
                }
            }));
        });

        // Only load segments when current user is not Master. Masters should manage segments via entities.
        if (!checkRole('Master')) {
            api.get('/business-segments', {params}).then(response => {
                setSegmentsOptions(response.data.map((item: any) => ({ value: item.id, label: item.name })));
            });
        }

        api.get('/entities', {params}).then(response => {
            setEntitiesOptions(response.data.map((item: any) => {
                return {
                    value: item.id,
                    label: item.name
                }
            }));
        });

        if(userId) {
            setPasswordRequired(false);
            api.get(`/users/${userId}`).then(response => {
                const { data: user } = response;
                setEmailIsAvailable(true);
                setUser({...user});
                setCompanyOptionSelected({
                    value: user.company_id,
                    label: user?.company?.name
                });

                setEntityOptionSelected({
                    value: user.entity_id,
                    label: user?.entity?.name
                });

                // Pre-selecionar permissões do usuário existente
                if (user.permissions && Array.isArray(user.permissions)) {
                    setSelectedPermissions(user.permissions.map((p: UserPermission) => p.id));
                }

                if (user?.menu_items && Array.isArray(user.menu_items)) {
                    setSelectedMenuItems(user.menu_items.map((p: UserPermission) => p.id));
                }

                // Pre-select business segment (from user or user's entity) only when not Master
                if (!checkRole('Master')) {
                    const segId = user.business_segment_id ?? user?.entity?.business_segment_id ?? null;
                    if (segId) {
                        setSelectedSegment({ value: segId, label: segmentsOptions.find((s: any) => s.value === segId)?.label ?? '' });
                    }
                }
            });
        }

    }, []);
 
    const renderOptionsRole = () => {
        const translateRoles = {
            Entity: userLogged?.role?.name === 'root' ? 'Entidade' : 'Administrador',
        };

        return roles.map(item => {
            return (
                <option key={item.id} value={item.id}>{translateRoles[item.name] ?? item.name}</option>
            );
        });
    }

    const handlerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if(name == 'active' || name == 'is_main_user') {
            setUser({...user, [name]: !!!user[name]});
        } else {
            setUser({...user, [name]: value});
        }
    }

    // Função para lidar com a mudança das permissões
    const handlePermissionChange = (permissionId: number) => {
        setSelectedPermissions(prev => {
            if (prev.includes(permissionId)) {
                return prev.filter(id => id !== permissionId);
            } else {
                return [...prev, permissionId];
            }
        });
    };

    const handleMenuItemChange = (menuId: number) => {
        setSelectedMenuItems(prev => {
            if (prev.includes(menuId)) {
                return prev.filter(id => id !== menuId);
            } else {
                return [...prev, menuId];
            }
        });
    };

    const verifyEmailAvailableOnEmailBlur = () => {
        const params = {email: user.email}
        api.get('/email-available', {
            params
        }).then(response => {
            const { is_available } = response.data;

            if(is_available) {
                toast.success("E-mail disponível")
                setEmailIsAvailable(true);
            } else {
                setEmailIsAvailable(false);
                toast.error("E-mail indisponível")
            }
        }).catch(err => {
            if (err.response) {
                console.error("Erro na resposta da API:", err.response.data);
                console.error("Status code:", err.response.status);
            } else if (err.request) {
                console.error("Nenhuma resposta recebida:", err.request);
            } else {
                console.error("Erro:", err.message);
            }
            setEmailIsAvailable(false);
            toast.error("Erro ao verificar o e-mail");
        });
        
     }

    const verifyIfPasswordIsValid = (value: string) => {
        if(value.length && value.length < MIN_LENGTH_PASSWORD) {
            setShowTextMinDigitPassword(true);
        } else {
            setShowTextMinDigitPassword(false);
        }
    }

    const verifyIfPasswordIsMatch = (value: string) => {
        if(value.length >= MIN_LENGTH_PASSWORD 
            && user.password_confirmation.length 
            && value != user.password_confirmation) {
            setShowTextPasswordDontMatch(true);
        } else {
            setShowTextPasswordDontMatch(false);
        }
    }

    const verifyIfPasswordConfirmationIsMatch = (value: string) => {
        if( value != user.password && value.length) {
            setShowTextPasswordDontMatch(true);
        } else {
            setShowTextPasswordDontMatch(false);
        }
    }

    const translateMenu = (name: string) => {
        const  menuItems = {
            Dashboard: 'Resumo',
            Companies: 'Empresas',
            Students: 'Alunos',
            Certificates: 'Certificados',
            Templates: 'Templates',
            Instructors: 'Instrutores',
            Positions: 'Profissões',
            Courses: 'Cursos',
            Users: 'Usuários',
            Notifications: 'Notificações'
        } as any;

        return menuItems[name] ?? name;
    }

    const handlerSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        if(haveFieldWithError()) {
            toast.error('Verifique todos os campos e tente novamente');
            return;
        }

        const allowedMenuIds = menuItems
            .filter((menuItem: any) => !DISALLOWED_MENU_PERMISSION_NAMES.includes(menuItem.name))
            .map((menuItem: any) => menuItem.id);

        const data: any = {
            ...user,
            is_main_user: roles.find(item => item.name === 'Company')?.id ? user?.is_main_user : false,
            permissions: selectedPermissions,
            menu_items: selectedMenuItems.filter(menuId => allowedMenuIds.includes(menuId))
        };

        // Only include business_segment_id when current user is not Master
        if (!checkRole('Master')) {
            data.business_segment_id = selectedSegment?.value ?? null;
        }

        if (checkRole('Company')) {
            data['role_id'] = getIdBasedInName(roles, 'Company');
        }

        setDisabledSubmitForm(true);

        if(userId) {
            api.put(`/users/${userId}`, data).then(() => {
                Swal.fire({
                    icon: "success",
                    title: 'Sucesso',
                    text: "Usuário atualizado com sucesso",
                    showDenyButton: false,
                    showCancelButton: false,
                    confirmButtonText: "Ok",
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/users');
                    } 
                });
            }).catch(err => {
                const {errors} = err.response.data;

                Swal.fire({
                    icon: "error",
                    title: 'Erro',
                    text: messageErrorAxios(errors),
                    showDenyButton: false,
                    showCancelButton: false,
                    confirmButtonText: "Ok",
                })
                
                toast.error('Verifique todos os campos e tente novamente');
            }).finally(() => {
                setDisabledSubmitForm(false);
            });
        } else {
            api.post('/users', data).then(() => {
                Swal.fire({
                    icon: "success",
                    title: 'Sucesso',
                    text: "Usuário cadastrado com sucesso",
                    showDenyButton: false,
                    showCancelButton: false,
                    confirmButtonText: "Ok",
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/users');
                    } 
                });
            }).catch(() => {
                Swal.fire({
                    icon: "error",
                    title: 'Erro',
                    text: "Verifique os campos e tente novamente",
                    showDenyButton: false,
                    showCancelButton: false,
                    confirmButtonText: "Ok",
                })
            }).finally(() => {
                setDisabledSubmitForm(false);
            });
        }
    }

    const haveFieldWithError = () => {
        return showTextMinDigitPassword || 
                showTextPasswordDontMatch || 
                !emailIsAvailable
    }

    const changeSizeToThree = () => {
        return  (user?.role_id == getIdBasedInName(roles, 'Entity') && userLogged?.role_id != getIdBasedInName(roles, 'Entity')) || (user?.role_id == getIdBasedInName(roles, 'Company'));
    }

    return (
        <Fragment>
            <div className="modern-page-header">
                <div>
                    <h1 className="page-title">{userId ? 'Editar Usuário' : 'Cadastrar Usuário'}</h1>
                    <p className="page-subtitle">Preencha os dados do usuário e permissões</p>
                </div>
            </div>

            <form onSubmit={handlerSubmit}>
                <Col xl={12}>
                    <div className="content-card mb-3">
                        <div className="content-card-header">
                            <span className="content-card-title">Dados do Usuário</span>
                        </div>
                        <div className="content-card-body">
                            <Row>
                                <Col xl={12}>
                                    <div className="mb-3">
                                        <Form.Group>
                                            <Form.Check name={'active'} id={'is_main_user'} checked={user.active} onChange={handlerChange} className='fs-14 text-dark' type="checkbox" label="Ativo" />
                                        </Form.Group>
                                    </div>
                                </Col>
                                <If condition={user.role_id === roles.find(item => item.name === 'Company')?.id}>
                                    <Col xl={12}>
                                        <div className="mb-3">
                                            <Form.Group>
                                                <Form.Check name={'is_main_user'} id={'is_main_user'} checked={user.is_main_user} onChange={handlerChange} className='fs-14 text-dark' type="checkbox" label="Administrador da empresa" />
                                            </Form.Group>
                                        </div>
                                    </Col>
                                </If>
                                         {/* Nova seção para permissões de usuário*/}
                                <If condition={userLogged?.entity?.config?.main_user_id != user?.id && (userLogged?.entity?.config?.main_user_id === userLogged.id || checkRole('Master'))}>
                                    <Col xl={12}>
                                        <div className="mb-3">
                                            <Form.Label className="fs-14 text-dark"><b>Permissões de Usuário</b></Form.Label>
                                            <div className="d-flex flex-wrap gap-3">
                                                {userPermissions.map((permission) => (
                                                    <Form.Check
                                                        key={permission.id}
                                                        type="checkbox"
                                                        id={`permission-${permission.id}`}
                                                        label={permission.name}
                                                        checked={selectedPermissions.includes(permission.id)}
                                                        onChange={() => handlePermissionChange(permission.id)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </Col>
                                </If>

                                <If condition={userLogged?.entity?.config?.main_user_id != user?.id && (userLogged?.entity?.config?.main_user_id === userLogged.id || checkRole('Master'))}>
                                    <Col xl={12}>
                                        <div className="mb-3">
                                            <Form.Label  className="fs-14 text-dark"><b>Visualização de menus</b></Form.Label>
                                            <div className="d-flex flex-wrap gap-3">
                                                {menuItems.map((menuItem) => (
                                                    !DISALLOWED_MENU_PERMISSION_NAMES.includes(menuItem.name) && (
                                                    <Form.Check
                                                        key={menuItem.id}
                                                        type="checkbox"
                                                        id={`menu-${menuItem.id}`}
                                                        label={translateMenu(menuItem.name)}
                                                        checked={selectedMenuItems.includes(menuItem.id)}
                                                        onChange={() => handleMenuItemChange(menuItem.id)}
                                                    />
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    </Col>
                                </If>
                                
                                <If condition={checkRole('Master')}>
                                    <Col md={3}>
                                            <div className="mb-3">
                                                <Form.Label htmlFor="inputState" className="fs-14 text-dark">Perfil de acesso</Form.Label>
                                                <Form.Select name={'role_id'} value={user.role_id} onChange={e => setUser({...user, role_id: +e.target.value})}  id="inputState" required className="form-select-lg">
                                                    <option value={0}>Selecione</option>
                                                    {renderOptionsRole()}
                                                </Form.Select>
                                            </div>
                                    </Col>
                                </If>
                                <Col md={3}>
                                    <div className="mb-3">
                                        <Form.Label htmlFor="form-text"  className=" fs-14 text-dark">Nome</Form.Label>
                                        <Form.Control name={'name'} value={user.name} onChange={handlerChange} type="text" required className="" id="form-text" placeholder="John Doe" />
                                    </div>
                                </Col>
                                <Col md={ 3}>
                                    <div className="mb-3">
                                        <Form.Label htmlFor="form-email" className="fs-14 text-dark">Email</Form.Label>
                                        <Form.Control name={'email'} disabled={!passwordRequired} className={!emailIsAvailable && user.email.length ? 'border-danger': ''} onBlur={verifyEmailAvailableOnEmailBlur} value={user.email} onChange={handlerChange} type="email" required id="form-email" placeholder="email@example.com" />
                                    </div>
                                </Col>
                                <Col md={2}>
                                    <div className="mb-3">
                                        <Form.Label htmlFor="form-phone" className="fs-14 text-dark">Telefone</Form.Label>
                                        <Form.Control name={'phone'} value={user.phone} onChange={handlerChange} type="text" id="form-phone" placeholder="(11) 99999-9999" />
                                    </div>
                                </Col>
                               
                                <If condition={user?.role_id == getIdBasedInName(roles, 'Company')}>
                                    <Col xl={3}>
                                        <div className="mb-3">
                                        <Select2
                                            id='option-company'
                                            label='Empresas'
                                            options={companyOptions}
                                            value={companyOptionSelected}
                                            onChange={(option: any) => {
                                                setUser({...user, company_id: option.value});
                                                setCompanyOptionSelected(option);
                                            }}
                                        />
                                        </div>
                                    </Col>
                                </If>

                                
                            </Row>

                            <Row>
                                <Col xl={checkRole('Entity') ? 4 : 6}>
                                    <div className="mb-3">
                                        <Form.Label htmlFor="form-password"  className="fs-14 text-dark">Senha</Form.Label>
                                        <Form.Control 
                                            name={'password'} 
                                            value={user.password} 
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                            handlerChange(e)
                                                            verifyIfPasswordIsValid(e.target.value);
                                                            verifyIfPasswordIsMatch(e.target.value);
                                                }} 
                                            type="password"
                                            id="form-password" 
                                            required={passwordRequired}
                                            placeholder="********" 
                                        />
                                    </div>

                                    <If
                                        condition={showTextMinDigitPassword}
                                    >
                                        <Badge className={'mb-3 w-100'} bg="danger">A senha deve ter no mínimo {MIN_LENGTH_PASSWORD} dígitos</Badge>
                                    </If>

                                </Col>
                                <Col xl={checkRole('Entity') ? 4 : 6}>
                                    <div className="mb-3">
                                        <Form.Label htmlFor="form-password-confirmation"  className="fs-14 text-dark">Confirmar senha</Form.Label>
                                        <Form.Control   
                                            required={passwordRequired}
                                            name={'password_confirmation'} 
                                            value={user.password_confirmation} 
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                            handlerChange(e)
                                                            verifyIfPasswordConfirmationIsMatch(e.target.value);
                                                }} 
                                            type="password"
                                            id="form-password-confirmation" 
                                            placeholder="********" 
                                        />
                                    </div>
                                    <If
                                        condition={showTextPasswordDontMatch}
                                    >
                                        <Badge className={'mb-3 w-100'} bg="danger">Senhas não conferem</Badge>
                                    </If>
                                </Col>
                            </Row>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <Button variant='outline-secondary' type={'button'} onClick={() => navigate('/users')}>
                            <i className="bx bx-arrow-back me-1"></i> Voltar
                        </Button>
                        <div className="d-flex gap-2">
                            {user.phone && (
                                <Button variant={user.welcome_message_sent ? 'dark' : 'success'} type={'button'} disabled={user.welcome_message_sent} onClick={handleSendMessage}>
                                    <i className="bi bi-whatsapp me-1"></i> {user.welcome_message_sent ? 'Mensagem enviada' : 'Enviar mensagem'}
                                </Button>
                            )}
                            <Button disabled={disabledSubmitForm} variant='primary' type="submit">
                                {userId ? 'Salvar alterações' : 'Novo usuário'}
                            </Button>
                        </div>
                    </div>
                </Col>
            </form>
            <ToastContainer />
        </Fragment>
    );
};

export default User;