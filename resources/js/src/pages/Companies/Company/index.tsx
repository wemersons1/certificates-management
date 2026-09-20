import React, { FC, Fragment, useCallback, useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, Col, Form, Modal, Row, Table } from "react-bootstrap";
import api from '@/src/lib/api';
import { useNavigate } from 'react-router-dom';
import { addMaskCnpj, applyMask, clearMask, formatDate, getAddress, getCities, getStates, messageErrorAxios } from '@/src/lib/helper';
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
registerPlugin(FilePondPluginImagePreview);
interface ItemsProps { };
interface Company {
    name: string;
    email: string;
    cnpj: string;
    phone: string;
    cellphone: string;
    zip_code: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    state_id: number;
    city_id: number;
    active: boolean;
}

interface Option {
  value: number | string;
  label: string;
}


const statusOptions: Option[] = [
  { value: 1, label: 'Ativo' },
  { value: 2, label: 'Pendente' },
  { value: 3, label: 'Cancelado' },
  { value: 4, label: 'Finalizado' },
];

const Company: FC<ItemsProps> = () => {
    const initialStateCompany = {
        name: '',
        email: '',
        cnpj: '',
        phone: '',
        cellphone: '',
        zip_code: '',
        street:  '',
        number:  '',
        complement:  '',
        neighborhood:  '',
        state_id: 0,
        city_id: 0,
        active: true
    };

    const today = new Date().toISOString().split('T')[0];

    const [item, setItem] = useState<Company>(initialStateCompany);
    const [disabledSubmitForm, setDisabledSubmitForm] = useState(false);
    const [itemId, setItemId] = useState(useParams()?.companyId ?? null);
    const [tabSelected, setTabSelected] = useState<string | null>('/company');
    const [stateSelected, setStateSelected] = useState({value: 0, label: 'Selecione um estado'});
    const [citySelected, setCitySelected] = useState({value: 0, label: 'Selecione uma cidade'});
    const [states, setStates] = useState<{ value: number; label: string }[]>([]);
    const [cities, setCities] = useState<{ value: number; label: string }[]>([]);
    const [segmentsOptions, setSegmentsOptions] = useState<any[]>([]);
    const [selectedSegment, setSelectedSegment] = useState({ value: 0, label: 'Selecione um segmento' });
    const navigate = useNavigate();

    const getCurrentCompany = () => {
        api.get(`/companies/${itemId}`).then(response => {
            const { data: company } = response;
            setItem({...company});
            setCitySelected({value: company?.city?.id, label:company?.city?.nome});
            setStateSelected({value: company?.state?.id, label:company?.state?.nome});
            if (company.entity?.business_segment) {
                setSelectedSegment({
                    value: company.entity.business_segment.id,
                    label: company.entity.business_segment.name
                });
            }
        });
    }

    useEffect(() => {
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

        const fetchSegments = async () => {
            try {
                const response = await api.get('/business-segments', { params: { all: 1 } });
                setSegmentsOptions(response.data.map((i: any) => ({ value: i.id, label: i.name })));
            } catch (err) {}
        };

        if(itemId) {
            getCurrentCompany();
        }

        fetchStates();
        fetchSegments();
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
        clearMask(item.cnpj).length == 14 &&
        item.name.length);
    }

    const handlerSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        registerCompany();
    }

    const registerCompany = () => {
        const data = {
            ...item,
            cnpj: clearMask(item.cnpj),
            phone: clearMask(item.phone),
            cellphone: clearMask(item.cellphone),
            zip_code: clearMask(item.zip_code),
            business_segment_id: selectedSegment.value > 0 ? selectedSegment.value : null
        };

        setDisabledSubmitForm(true);

        if(itemId) {
            api.put(`/companies/${itemId}`, data).then(() => {
                Swal.fire({
                    icon: "success",
                    title: 'Sucesso',
                    text: "Empresa atualizada com sucesso",
                    showDenyButton: false,
                    showCancelButton: false,
                    confirmButtonText: "Ok",
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/companies');
                    } 
                });
            }).finally(() => {
                setDisabledSubmitForm(false);
            });
        } else {
            api.post('/companies', data).then((response) => {
                Swal.fire({
                    icon: "success",
                    title: 'Sucesso',
                    text: "Empresa cadastrada com sucesso",
                    showDenyButton: false,
                    showCancelButton: false,
                    confirmButtonText: "Ok",
                }).then((result) => {
                    if (result.isConfirmed) {
                        setItemId(response.data.id);
                        setTabSelected('/address');
                        navigate('/companies');
                    } 
                });
            }).finally(() => {
                setDisabledSubmitForm(false);
            });
        }
    }

    function TabsNavigation() {
        return (
          <Nav
            variant="tabs"
            activeKey={tabSelected || '/company'}
            onSelect={(selectedKey) => {
              if (selectedKey) {
                setTabSelected(selectedKey);
              }
            }}
          >
            <Nav.Item>
              <Nav.Link eventKey="/company">
                Empresa
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
                           <If condition={tabSelected == '/company'}>
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
                                </Row>
                                <Row>
                                    <Col md={4}>
                                        <div className="mb-3">
                                            <Form.Label htmlFor="form-text"  className=" fs-14 text-dark">Nome</Form.Label>
                                            <Form.Control name={'name'} value={item.name} onChange={handlerChange} type="text" required className="" id="form-text" placeholder="John Doe" />
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <div className="mb-3">
                                            <Form.Label htmlFor="form-cnpj" className="fs-14 text-dark">CNPJ</Form.Label>
                                            <Form.Control 
                                            value={item.cnpj} 
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const newEvent = {
                                                ...e,
                                                target: {
                                                    ...e.target,
                                                    name: 'cnpj',
                                                    value: addMaskCnpj(e.target.value),
                                                },
                                                };
                                                handlerChange(newEvent);
                                            }}
                                            type="text" 
                                            required 
                                            id="form-cnpj" 
                                            placeholder="00.000.000/0000-00" 
                                            maxLength={18} 
                                            />
                                        </div>
                                    </Col>
                                         <Col md={4}>
                                        <div className="mb-3">
                                            <Form.Label htmlFor="form-email" className="fs-14 text-dark">Email (Opcional)</Form.Label>
                                            <Form.Control name={'email'} value={item.email} onChange={handlerChange} type="email" id="form-email" placeholder="email@example.com" />
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
                                                    name: 'city_id',
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
                                <Col className="d-flex justify-content-end">
                                        <Button disabled={disabledSubmitForm} variant='primary' className="xl-2" type="submit">{itemId ? 'Salvar alterações' : 'Nova empresa'}</Button>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </form>
            <ToastContainer />
        </Fragment>
    );
};

export default Company;