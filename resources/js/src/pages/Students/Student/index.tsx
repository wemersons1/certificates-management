import React, { FC, Fragment, useContext, useEffect, useState } from 'react';
import { Button, Card, CardBody, Col, Form, Row } from "react-bootstrap";
import api from '@/src/lib/api';
import { useNavigate } from 'react-router-dom';
import { addMaskCnpj, addMaskCpf, applyMask, clearMask, getAddress, getCities, getStates, getGenders } from '@/src/lib/helper';
import { ToastContainer, toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Nav from 'react-bootstrap/Nav';
import If from '@/src/components/common/if/if';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import Select2 from '@/src/components/common/select2';
import AppContext from '@/src/AppContext/Context';
registerPlugin(FilePondPluginImagePreview);
interface ItemsProps { };

interface Employee {
    name: string;
    email: string;
    cpf: string;
    rg?: string;
    admission_date: string; // formato ISO: 'YYYY-MM-DD'
    emitting_organ?: string;
    birthday: string;       // formato ISO: 'YYYY-MM-DD'
    active: boolean;
    phone?: string;
    cellphone: string;
    zip_code: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    state_id: number;
    city_id: number;
    gender_id: number;
    position: string;
    machines_operated: string;
    company_id: null | number;
}
  
const Employee: FC<ItemsProps> = () => {
    const initialStateEmployee: Employee = {
        name: '',
        email: '',
        cpf: '',
        rg: '',
        admission_date: '',
        emitting_organ: '',
        birthday: '',
        active: true,
        phone: '',
        cellphone: '',
        zip_code: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        state_id: 0,
        city_id: 0,
        gender_id: 0,
        position: '',
        machines_operated: '',
        company_id: null
    };

    const [item, setItem] = useState<Employee>(initialStateEmployee);
    const [disabledSubmitForm, setDisabledSubmitForm] = useState(false);
    const [itemId, setItemId] = useState(useParams()?.studentId ?? null);
    const [tabSelected, setTabSelected] = useState<string | null>('/employee');
    const [stateSelected, setStateSelected] = useState({value: 0, label: 'Selecione um estado'});
    const [citySelected, setCitySelected] = useState({value: 0, label: 'Selecione uma cidade'});
    const [genderSelected, setGenderSelected] = useState({value: 0, label: 'Selecione o sexo'});
    const [states, setStates] = useState<{ value: number; label: string }[]>([]);
    const [cities, setCities] = useState<{ value: number; label: string }[]>([]);
    const [genders, setGenders] = useState<{ value: number; label: string }[]>([]);
    const [companies, setCompanies] = useState([]);
    const [companySelected, setCompanySelected] = useState({});
    const [courses, setCourses] = useState<{ value: number; label: string; template: string }[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<{ value: number; label: string; template: string } | null>(null);
    const navigate = useNavigate();
    const { user, checkRole } = useContext(AppContext);
    const companyId = user?.company_id ?? useParams()?.companyId;

    const hasCpfMask = selectedCourse ? (selectedCourse.template.includes('{{cpf_aluno}}') || selectedCourse.template.includes('{cpf_aluno}')) : true;
    const hasRgMask = selectedCourse ? (selectedCourse.template.includes('{{rg_aluno}}') || selectedCourse.template.includes('{rg_aluno}')) : true;
    const hasPositionMask = selectedCourse ? (selectedCourse.template.includes('{{funcao_aluno}}') || selectedCourse.template.includes('{funcao_aluno}')) : true;

    useEffect(() => {
        if (!companyId) {
            api.get('/companies?all=1').then(response => {
                setCompanies(response.data.map((item: any) => {
                    return {
                        value: item.id,
                        label: `${item.name} - ${item.cnpj}`
                    }
                }));
            });
        }
        
        const fetchStates = async () => {
            const statesResponse = await getStates();
            statesResponse.unshift({id: 0, nome: 'Selecione um estado'});
            setStates(statesResponse.map((item: {id: number; nome: string;}) => {
                return {
                    value: item.id,
                    label: item.nome
                }
            }));
        };

        const fetchGeners = async () => {
            const gendersResponse = await getGenders();

            setGenders(gendersResponse.map((item: {id: number; name: string;}) => {
                return {
                    value: item.id,
                    label: item.name
                }
            }));
        };

        api.get('/courses?all=1').then(response => {
            const coursesRaw = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
            const coursesTreated = coursesRaw.map((c: any) => ({
                value: c.id,
                label: c.name,
                template: c.certificate_template?.latest_version?.template ?? ''
            }));
            setCourses(coursesTreated);

            const queryParams = new URLSearchParams(window.location.search);
            const courseIdFromUrl = queryParams.get('course_id');
            if (courseIdFromUrl) {
                const preselected = coursesTreated.find(c => c.value === parseInt(courseIdFromUrl));
                if (preselected) {
                    setSelectedCourse(preselected);
                }
            }
        });

        if(itemId) {
            api.get(`/employees/${itemId}`).then(response => {
                const { data: employee } = response;
                setItem({
                    ...employee,
                    cpf: addMaskCpf(employee.cpf),
                    cellphone: applyMask(employee.cellphone, '(99) 99999-9999') 
                });
                setCitySelected({value: employee?.city?.id, label:employee?.city?.nome});
                setStateSelected({value: employee?.state?.id, label:employee?.state?.nome});
                setCompanySelected({value: employee?.company?.id, label: `${employee?.company?.name} - ${employee?.company?.cnpj}`});
            });
        }

        fetchStates();
        fetchGeners();
    }, []);

    const fetchCities = async (stateId: number | null = null) => {
        const citiesResponse = await getCities({estado_id: stateId ?? stateSelected?.value});
        citiesResponse.unshift({id: 0, nome: 'Selecione uma cidade'});
        const citiesTreated = citiesResponse.map((item: {id: number; nome: string;}) => {
            return {
                value: item.id,
                label: item.nome
            }
        });

        setCities(citiesTreated);

        return citiesTreated;
    };

    useEffect(() => {
        if (stateSelected?.value) {
            fetchCities();
        } else {
            setCities([]);
            setCitySelected({value: 0, label: 'Selecione uma cidade'});
        }
    }, [stateSelected]);

    const handlerChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      ) => {
        const { name, value } = e.target;
        setItem(prev => ({ ...prev, [name]: value }));
    };  

    const allFieldsRegisterEntityFilled = () => {
        return !! (item.email.length &&
        item.name.length);
    }

    const handlerSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        const data = {
            ...item,
            cpf: clearMask(item.cpf),
            phone: clearMask(item.phone),
            cellphone: clearMask(item.cellphone),
            zip_code: clearMask(item.zip_code),
            company_id: companyId ?? item.company_id
        };

        setDisabledSubmitForm(true);
        let navigateLink = `/companies/${companyId ?? item?.company_id}/students`;
        
        if (!companyId && !item?.company_id) {
            navigateLink = '/students';
        }

        if(itemId) {
            api.put(`/employees/${itemId}`, data).then(() => {
                Swal.fire({
                    icon: "success",
                    title: 'Sucesso',
                    text: "Aluno atualizado com sucesso",
                    showDenyButton: false,
                    showCancelButton: false,
                    confirmButtonText: "Ok",
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate(navigateLink);
                    } 
                });
            }).finally(() => {
                setDisabledSubmitForm(false);
            });
        } else {
            api.post('/employees', data).then((response) => {
                Swal.fire({
                    icon: "success",
                    title: 'Sucesso',
                    text: "Aluno cadastrado com sucesso",
                    showDenyButton: false,
                    showCancelButton: false,
                    confirmButtonText: "Ok",
                }).then((result) => {
                    if (result.isConfirmed) {
                        setItemId(response.data.id);
                        setTabSelected('/address');
                        navigate(navigateLink);
                    } 
                });
            }).finally(() => {
                setDisabledSubmitForm(false);
            });
        }
    }

    const searchByCpf = () => {
        if (!itemId && clearMask(item.cpf).length == 11) {
            const params = {cpf: clearMask(item.cpf)}
            api.get('/employees', {params}).then(response => {
                if (response.data.data.length) {
                    const item = response.data.data[0];
                    if (item.company_id == companyId) {
                        Swal.fire({
                                icon: "error",
                                title: 'Erro',
                                text: "Aluno já cadastrado para esta empresa",
                                showDenyButton: false,
                                showCancelButton: false,
                                confirmButtonText: "Ok",
                            });
                        return;
                    }

                    setItem({
                        ...item,
                        active: true
                    });

                    setGenderSelected({
                        value: item?.gender?.id,
                        label: item?.gender?.name
                    });

                    setStateSelected({
                        value: item?.state?.id,
                        label: item?.state?.nome
                    });

                     setCitySelected({
                        value: item?.city?.id,
                        label: item?.city?.nome
                    });
                }
            });
        }
    }

    function TabsNavigation() {
        return (
          <Nav
            variant="tabs"
            activeKey={tabSelected || '/employee'}
            onSelect={(selectedKey) => {
              if (selectedKey) {
                setTabSelected(selectedKey);
              }
            }}
          >
            <Nav.Item>
              <Nav.Link eventKey="/employee">
                Aluno
              </Nav.Link>
            </Nav.Item>
      
            <Nav.Item>
              <Nav.Link eventKey="/address" disabled={!allFieldsRegisterEntityFilled()}>
                Endereço
              </Nav.Link>
            </Nav.Item>
          </Nav>
        );
    }  
      
    return (
        <Fragment>
            {/* <TabsNavigation/> */}
            <form onSubmit={handlerSubmit}>
                <Col xl={12}>
                    <Card>
                        <CardBody>
                           <If condition={tabSelected == '/employee'}>
                                <If condition={!!courses.length}>
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Select2
                                                label={'Filtrar campos por curso (Opcional)'}
                                                id="filter_course_id"
                                                name="filter_course_id"
                                                value={selectedCourse || { value: 0, label: 'Selecione um curso para filtrar' }}
                                                onChange={(option: any) => {
                                                    if (option && option.value !== 0) {
                                                        setSelectedCourse(option);
                                                    } else {
                                                        setSelectedCourse(null);
                                                    }
                                                }}
                                                options={[{ value: 0, label: 'Selecione um curso para filtrar', template: '' }, ...courses]}
                                            />
                                        </Col>
                                    </Row>
                                </If>
                                <Row>
                                    <Col md={4}>
                                        <div className="mb-3">
                                            <Form.Label htmlFor="form-active" className="fs-14 text-dark d-block">Ativo?</Form.Label>
                                            <Form.Check
                                                type="switch"
                                                id="form-active"
                                                name="active"
                                                label={item.active ? 'Sim' : 'Não'}
                                                checked={item.active}
                                                onChange={(e) => {
                                                    setItem(prev => ({
                                                    ...prev,
                                                    active: e.target.checked,
                                                    }));
                                                }}
                                            />

                                        </div>
                                    </Col>
                                </Row>
                                <If condition={!!companies.length}>
                                    <Row>
                                        <Col md={6}>
                                            <Select2
                                                label={'Empresa'}
                                                id="company_id"
                                                name="company_id"
                                                value={companySelected}
                                                onChange={(option: any) => {
                                                    setCompanySelected(option);
                                                    const e = {
                                                    target: {
                                                        name: 'company_id',
                                                        value: option.value,
                                                    },
                                                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                                                    handlerChange(e);
                                                }}
                                                options={companies}
                                            />
                                        </Col>
                                    </Row>
                                </If>

                                <Row>
                                    <Col md={3}>
                                        <div className="mb-3">
                                            <Form.Label htmlFor="form-text"  className=" fs-14 text-dark">Nome</Form.Label>
                                            <Form.Control name={'name'} value={item.name} onChange={handlerChange} type="text" required className="" id="form-text" placeholder="John Doe" />
                                        </div>
                                    </Col>
                                    <If condition={hasCpfMask}>
                                         <Col md={3}>
                                            <div className="mb-3">
                                                <Form.Label htmlFor="form-cpf" className="fs-14 text-dark">CPF (Opcional)</Form.Label>
                                                <Form.Control 
                                                value={item.cpf} 
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const newEvent = {
                                                    ...e,
                                                    target: {
                                                        ...e.target,
                                                        name: 'cpf',
                                                        value: addMaskCpf(e.target.value),
                                                    },
                                                    };
                                                    handlerChange(newEvent);
                                                }}
                                                onBlur={searchByCpf}
                                                type="text" 
                                                id="form-cnpj" 
                                                placeholder="000.000.000-00" 
                                                maxLength={18} 
                                                />
                                            </div>
                                        </Col>
                                    </If>
                                    <If condition={hasRgMask}>
                                        <Col md={3}>
                                            <div className="mb-3">
                                                <Form.Label htmlFor="form-rg" className="fs-14 text-dark">RG (Opcional)</Form.Label>
                                                <Form.Control 
                                                value={item.rg} 
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const newEvent = {
                                                    ...e,
                                                    target: {
                                                        ...e.target,
                                                        name: 'rg',
                                                        value: applyMask(e.target.value, '99.999.999-9'),
                                                    },
                                                    };
                                                    handlerChange(newEvent);
                                                }}
                                                type="text" 
                                                id="form-rg" 
                                                placeholder="00.000.000-0" 
                                                maxLength={12} 
                                                />
                                            </div>
                                        </Col>
                                    </If>
                                    <Col md={3}>
                                        <div className="mb-3">
                                            <Form.Label htmlFor="form-email" className="fs-14 text-dark">Email (Opcional)</Form.Label>
                                            <Form.Control name={'email'} value={item.email} onChange={handlerChange} type="email" id="form-email" placeholder="email@example.com" />
                                        </div>
                                    </Col>
                                    <Col md={3}>
                                        <div className="mb-3">
                                            <Form.Label htmlFor="form-text" className="fs-14 text-dark">Celular (Opcional)</Form.Label>
                                            <Form.Control 
                                                name={'cellphone'} 
                                                value={item.cellphone} 
                                                type="text" 
                                                id="form-text" 
                                                placeholder="(99) 99999-9999" 
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const newEvent = {
                                                        ...e,
                                                        target: {
                                                            ...e.target,
                                                            name: 'cellphone',
                                                            value: applyMask(e.target.value, '(99) 99999-9999'),
                                                        },
                                                    };
                                                    handlerChange(newEvent);
                                                }}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <If condition={hasPositionMask}>
                                        <Col md={6}>
                                            <div className="mb-3">
                                            <Form.Label htmlFor="form-position" className="fs-14 text-dark">Função (Opcional)</Form.Label>
                                            <Form.Control
                                                name="position"
                                                value={item.position}
                                                onChange={handlerChange}
                                                type="text"
                                                id="form-position"
                                                placeholder={"Ex. : Operador de caixa, Atendente"}
                                            />
                                            </div>
                                        </Col>
                                    </If>

                                       <Col md={6}>
                                        <div className="mb-3">
                                        <Form.Label htmlFor="form-position" className="fs-14 text-dark">Máquinas Operadas (Opcional)</Form.Label>
                                        <Form.Control
                                            name="machines_operated"
                                            value={item.machines_operated}
                                            onChange={handlerChange}
                                            type="text"
                                            id="form-position"
                                            placeholder={"Ex. : Operador de caixa, Atendente"}
                                        />
                                        </div>
                                    </Col>
                                </Row>
                           </If>

                           <If condition={tabSelected == '/address'}>
                                <Row>
                                    <Col md={4}>
                                        <Form.Label htmlFor="form-text" className="fs-14 text-dark">Cep</Form.Label>
                                        <Form.Control 
                                            type={'text'}
                                            id={'zip_code'}
                                            name={'zip_code'}
                                            value={item.zip_code}
                                            onKeyUp={async () => {
                                                if (clearMask(item.zip_code).length === 8) {
                                                    const response = await getAddress(item.zip_code);
                                                    if (response?.neighborhood?.length) {
                                                        const {neighborhood, city, state, street} = response;
                                                        const stateItem = states?.find(item => item.label === state);
                                                        setStateSelected(stateItem as { value: number; label: string });
                                                        const cityTreated = await fetchCities(stateItem?.value)
                                                        const cityItem = cityTreated?.find(item => item.label === city);
                                                        setCitySelected(cityItem as { value: number; label: string });
                                                    
                                                        setItem({
                                                            ...item,
                                                            street,
                                                            neighborhood,
                                                            state_id: stateItem?.value as number,
                                                            city_id: cityItem?.value as number,
                                                        });
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
                                                handlerChange(newEvent);
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
                                                setCitySelected({value: 0, label: 'Selecione uma cidade'});
                                                const e = {
                                                target: {
                                                    name: 'state_id',
                                                    value: option.value,
                                                },
                                                } as unknown as React.ChangeEvent<HTMLInputElement>;
                                                handlerChange(e);
                                            }}
                                            options={states}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Select2
                                            label={'Cidade'}
                                            id="city"
                                            name="state_id"
                                            value={citySelected}
                                            onChange={(option: any) => {
                                                setCitySelected(option);
                                                const e = {
                                                target: {
                                                    name: 'cityid',
                                                    value: option.value,
                                                },
                                                } as unknown as React.ChangeEvent<HTMLInputElement>;
                                                handlerChange(e);
                                            }}
                                            options={cities}
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label htmlFor="form-text" className="fs-14 text-dark">Bairro</Form.Label>
                                        <Form.Control 
                                            type={'text'}
                                            id={'neighborhood'}
                                            name={'neighborhood'}
                                            onChange={handlerChange}
                                            value={item.neighborhood}
                                            placeholder={'Bairro'}
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label htmlFor="form-text" className="fs-14 text-dark">Rua</Form.Label>
                                        <Form.Control 
                                            type={'text'}
                                            id={'street'}
                                            name={'street'}
                                            onChange={handlerChange}
                                            value={item.street}
                                            placeholder={'Rua, Avenida'}
                                        />
                                    </Col>                                
                                    <Col md={3}>
                                        <Form.Label htmlFor="form-text" className="fs-14 text-dark">Número</Form.Label>
                                        <Form.Control 
                                            type={'text'}
                                            id={'number'}
                                            name={'number'}
                                            onChange={handlerChange}
                                            value={item.number}
                                            placeholder={'Ex: 01, S/N'}
                                        />
                                        
                                    </Col>                              
                                    <Col md={3}>
                                        <Form.Label htmlFor="form-text" className="fs-14 text-dark">Complemento</Form.Label>
                                        <Form.Control 
                                            type={'text'}
                                            id={'complement'}
                                            name={'complement'}
                                            onChange={handlerChange}
                                            value={item.complement}
                                            placeholder={'Ex: Quadra: xx, Lote: xx'}
                                        />
                                    </Col>
                                </Row>
                           </If>

                            <Row className={'mt-3'}>
                                <Col xs={6} >
                                    <Button variant='light' type={'button'} className="xl-2" onClick={() => navigate(`/companies/${companyId}/employees`)}>Voltar</Button>
                                </Col>
                                
                                <If condition={! checkRole('Company')}>
                                    <Col xs={6} className="d-flex justify-content-end">
                                        <Button disabled={disabledSubmitForm} variant='primary' className="xl-2" type="submit">{itemId ? 'Salvar alterações' : 'Novo aluno'}</Button>
                                    </Col>
                                </If>
                                
                                {/* <If condition={allFieldsRegisterEntityFilled() && tabSelected != '/address'}>
                                    <Col xs={6} className="d-flex justify-content-end ">
                                        <Button disabled={disabledSubmitForm} variant='primary' type={'button'} className="xl-2" onClick={() => {
                                            setTabSelected('/address');
                                        }}>Próximo</Button>
                                    </Col>
                                </If> */}
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </form>
            <ToastContainer />
        </Fragment>
    );
};

export default Employee;