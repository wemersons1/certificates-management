import React, { FC, Fragment, useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, Col, Form, Row } from "react-bootstrap";
import api from '@/src/lib/api';
import { useNavigate, useParams } from 'react-router-dom';
import { addMaskCnpj, clearMask, applyMask, getAddress, getStates, getCities } from '@/src/lib/helper';
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2';
import Nav from 'react-bootstrap/Nav';
import If from '@/src/components/common/if/if';
import Select2 from '@/src/components/common/select2';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import { FaBuilding, FaPalette, FaUser, FaMapMarkedAlt } from "react-icons/fa";

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
    };
    config: { primary_color: string; secondary_color: string; logo: string | null };
    user: { name: string; email: string; password: string; password_confirmation: string };
}

const Entity: FC = () => {
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

    const [item, setItem] = useState<Item>(initialStateItem);
    const [disabledSubmitForm, setDisabledSubmitForm] = useState(false);
    const [tabSelected, setTabSelected] = useState<string>('/company');
    const [files, setFiles] = useState<any[]>([]);
    const [logo, setLogo] = useState<string>('');
    const [showTextMinDigitPassword, setShowTextMinDigitPassword] = useState<boolean>(false);
    const [showTextPasswordDontMatch, setShowTextPasswordDontMatch] = useState<boolean>(false);
    const [emailIsAvailable, setEmailIsAvailable] = useState<boolean>(false);
    const [stateSelected, setStateSelected] = useState<StateCityOption>({ value: 0, label: 'Selecione um estado' });
    const [citySelected, setCitySelected] = useState<StateCityOption>({ value: 0, label: 'Selecione uma cidade' });
    const [states, setStates] = useState<StateCityOption[]>([]);
    const [cities, setCities] = useState<StateCityOption[]>([]);
    const [segmentsOptions, setSegmentsOptions] = useState<any[]>([]);
    const [selectedSegment, setSelectedSegment] = useState({ value: 0, label: 'Selecione um segmento' });
    const navigate = useNavigate();
    const params = useParams();
    const itemId = params?.entityId ?? null;
    const MIN_LENGTH_PASSWORD = 8;

    // Load states/cities and entity for edit
    useEffect(() => {
        const fetchSegments = async () => {
            try {
                const params = { all: 1 };
                const response = await api.get('/business-segments', { params });
                setSegmentsOptions(response.data.map((item: any) => ({ value: item.id, label: item.name })));
            } catch (err) {
                // ignore for now
            }
        };

        fetchSegments();

        const fetchStates = async () => {
            const statesResponse = await getStates();
            statesResponse.unshift({ id: 0, nome: 'Selecione um estado' });
            setStates(
                statesResponse.map((item: { id: number; nome: string }) => ({
                    value: item.id,
                    label: item.nome,
                }))
            );
        };

        if (itemId) {
            api.get(`/entities/${itemId}`).then(async (response: any) => {
                const { data: entity } = response;
                setItem({
                    entity: {
                        name: entity.name || '',
                        email: entity.email || '',
                        cnpj: entity.cnpj || '',
                        zip_code: entity.zip_code || '',
                        street: entity.street || '',
                        number: entity.number || '',
                        complement: entity.complement || '',
                        neighborhood: entity.neighborhood || '',
                        state_id: entity.state_id || 0,
                        city_id: entity.city_id || 0,
                    },
                    config: entity.config,
                    user: {
                        name: entity.config?.main_user?.name || '',
                        email: entity.config?.main_user?.email || '',
                        password: '',
                        password_confirmation: '',
                    },
                });
                setLogo(entity?.config?.logo_base64 || '');
                setFiles([{ source: entity?.config?.logo_base64, options: { type: 'local' } }]);
                setEmailIsAvailable(true);

                setStateSelected({
                    value: entity.state_id || 0,
                    label: entity.state?.nome || 'Selecione um estado',
                });
                // preselect segment if present
                setSelectedSegment({ value: entity.business_segment_id || 0, label: entity.business_segment?.name || 'Selecione um segmento' });
                const citiesResponse = await getCities({ estado_id: entity.state_id });
                citiesResponse.unshift({ id: 0, nome: 'Selecione uma cidade' });
                const citiesTreated = citiesResponse.map((item: { id: number; nome: string }) => ({
                    value: item.id,
                    label: item.nome,
                }));
                setCities(citiesTreated);
                setCitySelected({
                    value: entity.city_id || 0,
                    label: entity.city?.nome || 'Selecione uma cidade',
                });
            });
        }

        fetchStates();
    }, [itemId]);

    // Cities when state changes
    const fetchCities = async (stateId: number | null = null) => {
        const citiesResponse = await getCities({ estado_id: stateId ?? stateSelected?.value });
        citiesResponse.unshift({ id: 0, nome: 'Selecione uma cidade' });
        const citiesTreated = citiesResponse.map((item: { id: number; nome: string }) => ({
            value: item.id,
            label: item.nome,
        }));
        setCities(citiesTreated);
        return citiesTreated;
    };

    useEffect(() => {
        if (stateSelected?.value) {
            fetchCities();
        } else {
            setCities([]);
            setCitySelected({ value: 0, label: 'Selecione uma cidade' });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        if (value.length && value.length < MIN_LENGTH_PASSWORD) {
            setShowTextMinDigitPassword(true);
        } else {
            setShowTextMinDigitPassword(false);
        }
    };

    const verifyIfPasswordIsMatch = (value: string) => {
        if (
            value.length >= MIN_LENGTH_PASSWORD &&
            item.user.password_confirmation.length &&
            value !== item.user.password_confirmation
        ) {
            setShowTextPasswordDontMatch(true);
        } else {
            setShowTextPasswordDontMatch(false);
        }
    };

    const verifyIfPasswordConfirmationIsMatch = (value: string) => {
        if (value !== item.user.password && value.length) {
            setShowTextPasswordDontMatch(true);
        } else {
            setShowTextPasswordDontMatch(false);
        }
    };

    const haveFieldWithError = () => {
        return showTextMinDigitPassword || showTextPasswordDontMatch || !emailIsAvailable;
    };

    // Validações para cada etapa
    const allFieldsRegisterEntityFilled = () => {
        return !!(
            item.entity.email.length &&
            clearMask(item.entity.cnpj).length === 14 &&
            item.entity.name.length &&
            selectedSegment?.value
        );
    };

    const allFieldsAddressFilled = () => {
        return !!(
            clearMask(item.entity.zip_code).length === 8 &&
            item.entity.street.length &&
            item.entity.number.length &&
            item.entity.neighborhood.length &&
            stateSelected.value &&
            citySelected.value
        );
    };

    const allFieldsConfigFilled = () => {
        return !!(
            item?.config?.primary_color?.length &&
            item?.config?.secondary_color?.length &&
            logo.length
        );
    };

    const handlerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (haveFieldWithError()) {
            toast.error('Verifique todos os campos e tente novamente');
            return;
        }
        const data = {
            config: { ...item.config, logo },
            entity: {
                ...item.entity,
                cnpj: clearMask(item.entity.cnpj),
                zip_code: clearMask(item.entity.zip_code),
                state_id: stateSelected.value,
                city_id: citySelected.value,
                business_segment_id: selectedSegment.value
            },
            user: { ...item.user },
        };
        setDisabledSubmitForm(true);
        const request = itemId
            ? api.put(`/entities/${itemId}`, data)
            : api.post('/entities', data);
        request
            .then(() => {
                Swal.fire({
                    icon: "success",
                    title: 'Sucesso',
                    text: itemId ? "Entidade atualizada com sucesso" : "Entidade cadastrada com sucesso",
                    confirmButtonText: "Ok",
                }).then(() => navigate('/entities'));
            })
            .catch(() => {
                toast.error('Verifique todos os campos e tente novamente');
            })
            .finally(() => setDisabledSubmitForm(false));
    };

    function TabsNavigation() {
        return (
            <Nav variant="tabs" activeKey={tabSelected} onSelect={(selectedKey) => {
                if (selectedKey) setTabSelected(selectedKey);
            }}>
                <Nav.Item>
                    <Nav.Link eventKey="/company">
                        <FaBuilding className="me-2" />Empresa
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="/address" disabled={!allFieldsRegisterEntityFilled()}>
                        <FaMapMarkedAlt className="me-2" />Endereço
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="/config" disabled={!(allFieldsRegisterEntityFilled() && allFieldsAddressFilled())}>
                        <FaPalette className="me-2" />Tema
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="/user" disabled={!(allFieldsRegisterEntityFilled() && allFieldsConfigFilled())}>
                        <FaUser className="me-2" />Usuário
                    </Nav.Link>
                </Nav.Item>
            </Nav>
        );
    }

    return (
        <Fragment>
            <TabsNavigation />
            <form onSubmit={handlerSubmit}>
                <Col xl={12}>
                    <Card>
                        <CardBody>
                            <If condition={tabSelected === '/company'}>
                                <Row>
                                    <Col md={4}>
                                        <Select2
                                            id='option-segment'
                                            label='Segmento'
                                            options={segmentsOptions}
                                            value={selectedSegment}
                                            onChange={(option: any) => {
                                                setSelectedSegment(option);
                                            }}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label>Nome</Form.Label>
                                        <Form.Control name={'name'} value={item.entity.name} onChange={handlerChange} type="text" required placeholder="John Doe" />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label>Email da empresa</Form.Label>
                                        <Form.Control name={'email'} value={item.entity.email} onChange={handlerChange} type="email" required placeholder="email@example.com" />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label>CNPJ</Form.Label>
                                        <Form.Control
                                            value={item.entity.cnpj}
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
                                            placeholder="00.000.000/0000-00"
                                            maxLength={18}
                                        />
                                    </Col>
                                </Row>
                            </If>

                            <If condition={tabSelected === '/address'}>
                                <Row>
                                    <Col md={4}>
                                        <Form.Label htmlFor="zip_code" className="fs-14 text-dark">Cep</Form.Label>
                                        <Form.Control
                                            type={'text'}
                                            id={'zip_code'}
                                            name={'zip_code'}
                                            value={item.entity.zip_code}
                                            onKeyUp={async () => {
                                                if (clearMask(item.entity.zip_code).length === 8) {
                                                    const response = await getAddress(item.entity.zip_code);
                                                    if (response?.neighborhood?.length) {
                                                        const { neighborhood, city, state, street } = response;
                                                        const stateItem = states?.find((it) => it.label === state);
                                                        setStateSelected(stateItem as StateCityOption);
                                                        const cityTreated = await fetchCities(stateItem?.value);
                                                        const cityItem = cityTreated?.find((it) => it.label === city);
                                                        setCitySelected(cityItem as StateCityOption);
                                                        setItem((prev) => ({
                                                            ...prev,
                                                            entity: {
                                                                ...prev.entity,
                                                                street: street || '',
                                                                neighborhood: neighborhood || '',
                                                                state_id: stateItem?.value || 0,
                                                                city_id: cityItem?.value || 0,
                                                            },
                                                        }));
                                                    }
                                                }
                                            }}
                                            placeholder={'99999-999'}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const newEvent = {
                                                    ...e,
                                                    target: {
                                                        ...e.target,
                                                        name: 'zip_code',
                                                        value: applyMask(e.target.value, '99999-999'),
                                                    },
                                                };
                                                handlerChange(newEvent as React.ChangeEvent<HTMLInputElement>);
                                            }}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Select2
                                            label={'Estado'}
                                            id="state"
                                            name="state_id"
                                            value={stateSelected}
                                            onChange={(option: any) => {
                                                setStateSelected(option);
                                                setCitySelected({ value: 0, label: 'Selecione uma cidade' });
                                                const e = {
                                                    target: {
                                                        name: 'state_id',
                                                        value: option.value,
                                                    },
                                                } as React.ChangeEvent<HTMLInputElement>;
                                                handlerChange(e);
                                            }}
                                            options={states}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Select2
                                            label={'Cidade'}
                                            id="city"
                                            name="city_id"
                                            value={citySelected}
                                            onChange={(option: any) => {
                                                setCitySelected(option);
                                                const e = {
                                                    target: {
                                                        name: 'city_id',
                                                        value: option.value,
                                                    },
                                                } as React.ChangeEvent<HTMLInputElement>;
                                                handlerChange(e);
                                            }}
                                            options={cities}
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label htmlFor="neighborhood" className="fs-14 text-dark">Bairro</Form.Label>
                                        <Form.Control
                                            type={'text'}
                                            id={'neighborhood'}
                                            name={'neighborhood'}
                                            onChange={handlerChange}
                                            value={item.entity.neighborhood}
                                            placeholder={'Bairro'}
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label htmlFor="street" className="fs-14 text-dark">Rua</Form.Label>
                                        <Form.Control
                                            type={'text'}
                                            id={'street'}
                                            name={'street'}
                                            onChange={handlerChange}
                                            value={item.entity.street}
                                            placeholder={'Rua, Avenida'}
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label htmlFor="number" className="fs-14 text-dark">Número</Form.Label>
                                        <Form.Control
                                            type={'text'}
                                            id={'number'}
                                            name={'number'}
                                            onChange={handlerChange}
                                            value={item.entity.number}
                                            placeholder={'Ex: 01, S/N'}
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label htmlFor="complement" className="fs-14 text-dark">Complemento</Form.Label>
                                        <Form.Control
                                            type={'text'}
                                            id={'complement'}
                                            name={'complement'}
                                            onChange={handlerChange}
                                            value={item.entity.complement}
                                            placeholder={'Ex: Quadra: xx, Lote: xx'}
                                        />
                                    </Col>
                                </Row>
                            </If>

                            <If condition={tabSelected === '/config'}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Label>Cor texto do menu</Form.Label>
                                        <Form.Control name={'config.primary_color'} value={item.config?.primary_color} onChange={handlerChange} type="color" required className="w-100" />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label>Cor dos botões</Form.Label>
                                        <Form.Control name={'config.secondary_color'} value={item.config?.secondary_color} onChange={handlerChange} type="color" required className="w-100" />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xl={4}>
                                        <Form.Label>Imagem</Form.Label>
                                        <Form.Control
                                            type="file"
                                            accept="image/*"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = (evt) => {
                                                        setLogo(evt.target?.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            required={!itemId}
                                        />
                                        {logo && (
                                            <div className="image-preview mt-2">
                                                <img
                                                    src={logo}
                                                    alt="Imagem"
                                                    style={{
                                                        maxWidth: '100%',
                                                        maxHeight: '250px',
                                                        objectFit: 'contain',
                                                        border: '1px solid #ddd',
                                                        padding: 5,
                                                        background: '#f9f9f9',
                                                        borderRadius: 8,
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                            </If>

                            <If condition={tabSelected === '/user'}>
                                <Row>
                                    <Col md={4}>
                                        <Form.Label>Nome</Form.Label>
                                        <Form.Control name={'user.name'} value={item.user.name} onChange={handlerChange} type="text" required placeholder="John Doe" />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label>Usuário</Form.Label>
                                        <Form.Control
                                            name={'user.email'}
                                            className={!emailIsAvailable && item.user.email.length ? 'border-danger' : ''}
                                            onBlur={verifyEmailAvailableOnEmailBlur}
                                            value={item.user.email}
                                            onChange={handlerChange}
                                            type="email"
                                            required
                                            disabled={!!itemId}
                                            placeholder="usuario@exemplo.com"
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={4}>
                                        <Form.Label>Senha</Form.Label>
                                        <Form.Control
                                            name={'user.password'}
                                            value={item.user.password}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                handlerChange(e);
                                                verifyIfPasswordIsValid(e.target.value);
                                                verifyIfPasswordIsMatch(e.target.value);
                                            }}
                                            type="password"
                                            required={!itemId}
                                            placeholder="********"
                                        />
                                        <If condition={showTextMinDigitPassword}>
                                            <Badge className={'mb-3 w-100'} bg="danger">A senha deve ter no mínimo {MIN_LENGTH_PASSWORD} dígitos</Badge>
                                        </If>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label>Confirmar senha</Form.Label>
                                        <Form.Control
                                            name={'user.password_confirmation'}
                                            value={item.user.password_confirmation}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                handlerChange(e);
                                                verifyIfPasswordConfirmationIsMatch(e.target.value);
                                            }}
                                            type="password"
                                            required={!itemId}
                                            placeholder="********"
                                        />
                                        <If condition={showTextPasswordDontMatch}>
                                            <Badge className={'mb-3 w-100'} bg="danger">Senhas não conferem</Badge>
                                        </If>
                                    </Col>
                                </Row>
                            </If>

                            <Row className={'mt-2'}>
                                <Col xs={6}>
                                    <Button
                                        variant='light'
                                        type='button'
                                        onClick={() => {
                                            if (tabSelected === '/config') setTabSelected('/address');
                                            else if (tabSelected === '/address') setTabSelected('/company');
                                            else if (tabSelected === '/user') setTabSelected('/config');
                                            else navigate('/entities');
                                        }}
                                    >
                                        Voltar
                                    </Button>
                                </Col>

                                <If condition={tabSelected === '/company'}>
                                    <Col xs={6} className="d-flex justify-content-end">
                                        <Button disabled={!allFieldsRegisterEntityFilled()} variant='primary' type={'button'} onClick={() => setTabSelected('/address')}>
                                            Próximo
                                        </Button>
                                    </Col>
                                </If>

                                <If condition={tabSelected === '/address'}>
                                    <Col xs={6} className="d-flex justify-content-end">
                                        <Button variant='primary' type={'button'} disabled={!(allFieldsRegisterEntityFilled() && allFieldsAddressFilled())} onClick={() => setTabSelected('/config')}>
                                            Próximo
                                        </Button>
                                    </Col>
                                </If>

                                <If condition={tabSelected === '/config'}>
                                    <Col xs={6} className="d-flex justify-content-end">
                                        <Button variant='primary' type={'button'} disabled={!(allFieldsRegisterEntityFilled() && allFieldsConfigFilled())} onClick={() => setTabSelected('/user')}>
                                            Próximo
                                        </Button>
                                    </Col>
                                </If>

                                <If condition={tabSelected === '/user'}>
                                    <Col xs={6} className="d-flex justify-content-end">
                                        <Button disabled={disabledSubmitForm} variant='primary' type="submit">
                                            {itemId ? 'Salvar alterações' : 'Nova entidade'}
                                        </Button>
                                    </Col>
                                </If>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </form>
            <ToastContainer />
        </Fragment>
    );
};

export default Entity;