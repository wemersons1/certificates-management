import React, { FC, Fragment, useEffect, useState, ChangeEvent } from 'react';
import { Button, Card, CardBody, Col, Form, Nav, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2';
import api from '@/src/lib/api';
// Remova esta importação, pois não será mais usada
// import Select2 from '@/src/components/common/select2';
import If from '@/src/components/common/if/if';
import { NumericFormat } from 'react-number-format';

interface Option {
    value: number;
    label: string;
}

interface Plan {
    name: string;
    monthly_value: string;
    annual_value: string;
    image: string;
    quantity_days: string;
    quantity_certificates: string;
    benefits: number[];
    active: boolean; // ← novo campo
}

const PlanForm: FC = () => {
    const initialState: Plan = {
        name: '',
        monthly_value: '',
        annual_value: '',
        image: '',
        quantity_days: '',
        quantity_certificates: '',
        benefits: [],
        active: true // ← valor padrão
    };

    const [item, setItem] = useState<Plan>(initialState);
    const [benefitsOptions, setBenefitsOptions] = useState<Option[]>([]);
    const [disabledSubmitForm, setDisabledSubmitForm] = useState(false);
    const [tabSelected, setTabSelected] = useState<string>('/plan');
    const [displayMonthlyValue, setDisplayMonthlyValue] = useState<string>('');
    const [displayAnnualValue, setDisplayAnnualValue] = useState<string>('');
    const planId = useParams()?.planId ?? null;
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([
            api.get('/plan-benefits'),
            planId ? api.get(`/plans/${planId}`) : Promise.resolve({ data: null })
        ]).then(([benefitsResponse, planResponse]) => {
            const benefitOptions = benefitsResponse.data.map((b: any) => ({
                value: b.id,
                label: b.name,
            }));
            setBenefitsOptions(benefitOptions);

            if (planResponse.data) {
                const data = planResponse.data;
                 setItem({
                    name: data.name,
                    monthly_value: data.monthly_value?.toString(),
                    annual_value: data.annual_value?.toString(),
                    image: data.image,
                    quantity_days: String(data.quantity_days),
                    quantity_certificates: String(data.quantity_certificates ?? ''),
                    benefits: data.benefits?.map((b: any) => b.id) ?? [],
                    active: data.active ?? true
                });

                setDisplayMonthlyValue((data.monthly_value / 100)?.toFixed(2).replace('.', ','));
                setDisplayAnnualValue((data.annual_value / 100)?.toFixed(2).replace('.', ','));
            }
        });
    }, []);

    const handlerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setItem(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                toast.error('O tamanho máximo permitido é 4MB.');
                return;
            }

            if (!file.type.startsWith('image/')) {
                toast.error('Por favor, envie um arquivo de imagem válido.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setItem(prev => ({
                    ...prev,
                    image: reader.result as string
                }));
            };
            reader.readAsDataURL(file);
        } else {
            setItem(prev => ({ ...prev, image: '' }));
        }
    };

    // Nova função para lidar com a mudança dos checkboxes
    const handlerCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const benefitId = Number(e.target.value);
        const isChecked = e.target.checked;

        setItem(prev => {
            if (isChecked) {
                // Adiciona o ID do benefício se não estiver na lista
                return { ...prev, benefits: [...prev.benefits, benefitId] };
            } else {
                // Remove o ID do benefício se estiver na lista
                return { ...prev, benefits: prev.benefits.filter(id => id !== benefitId) };
            }
        });
    };

    const handlerSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!item.benefits.length) {
            toast.error('Selecione pelo menos um benefício!');
            return;
        }

        const payload = {
            ...item,
            quantity_certificates: item.quantity_certificates || null,
            monthly_value: Number(item.monthly_value),
            annual_value: Number(item.annual_value),
            active: item.active
        } as any;

        if (payload?.image && payload?.image?.startsWith("https://")) {
            delete payload?.image;
        }

        setDisabledSubmitForm(true);

        const request = planId
            ? api.put(`/plans/${planId}`, payload)
            : api.post('/plans', payload);

        request.then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Sucesso',
                text: planId ? 'Plano atualizado com sucesso' : 'Plano cadastrado com sucesso',
                confirmButtonText: 'Ok'
            }).then(() => navigate('/plans'));
        }).catch(() => {
            toast.error('Erro ao processar a requisição');
        }).finally(() => setDisabledSubmitForm(false));
    };

    const allFieldsPlanFilled = () => {
        return !!(
            item.name &&
            item.image &&
            item.quantity_days
        );
    };

    const TabsNavigation = () => (
        <Nav variant="tabs" activeKey={tabSelected} onSelect={(selectedKey) => {
            if (selectedKey) setTabSelected(selectedKey);
        }}>
            <Nav.Item>
                <Nav.Link eventKey="/plan">Plano</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link eventKey="/benefits" disabled={!allFieldsPlanFilled()}>
                    Benefícios
                </Nav.Link>
            </Nav.Item>
        </Nav>
    );

    return (
        <Fragment>
            <ToastContainer /> {/* Movido para o topo para melhor visualização */}
            <TabsNavigation />
            <form onSubmit={handlerSubmit}>
                <Col xl={12}>
                    <Form.Group as={Col} className="mt-3" controlId="active-switch">
                        <Form.Check
                            type="switch"
                            label="Plano ativo?"
                            checked={item.active}
                            onChange={(e) => setItem(prev => ({ ...prev, active: e.target.checked }))}
                        />
                    </Form.Group>
                </Col>
                <Col xl={12}>
                    <Card>
                        <CardBody>
                            <If condition={tabSelected === '/plan'}>
                                <Row>
                                    <Col md={8}>
                                        <div className="mb-3">
                                            <Form.Label>Nome do Plano</Form.Label>
                                            <Form.Control
                                                name="name"
                                                value={item.name}
                                                onChange={handlerChange}
                                                type="text"
                                                required
                                            />
                                        </div>
                                    </Col>
                                    <Col md={2}>
                                        <div className="mb-3">
                                            <Form.Label>Valor Mensal</Form.Label>
                                            <NumericFormat
                                                required
                                                className="form-control"
                                                value={displayMonthlyValue}
                                                thousandSeparator="."
                                                decimalSeparator=","
                                                prefix="R$ "
                                                allowNegative={false}
                                                fixedDecimalScale
                                                decimalScale={2}
                                                onValueChange={(values) => {
                                                    setDisplayMonthlyValue(values.formattedValue);
                                                    const cents = values.floatValue ? Math.round(values.floatValue * 100).toString() : '';
                                                    setItem(prev => ({ ...prev, monthly_value: cents }));
                                                }}
                                            />
                                        </div>
                                    </Col>
                                    <Col md={2}>
                                        <div className="mb-3">
                                            <Form.Label>Valor Anual</Form.Label>
                                            <NumericFormat
                                                required
                                                className="form-control"
                                                value={displayAnnualValue}
                                                thousandSeparator="."
                                                decimalSeparator=","
                                                prefix="R$ "
                                                allowNegative={false}
                                                fixedDecimalScale
                                                decimalScale={2}
                                                onValueChange={(values) => {
                                                    setDisplayAnnualValue(values.formattedValue);
                                                    const cents = values.floatValue ? Math.round(values.floatValue * 100).toString() : '';
                                                    setItem(prev => ({ ...prev, annual_value: cents }));
                                                }}
                                            />
                                        </div>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={4}>
                                        <div className="mb-3">
                                            <Form.Label>Imagem</Form.Label>
                                            <Form.Control
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                required={!planId}
                                            />
                                            {item.image && (
                                                <div className="image-preview mt-2">
                                                    <img
                                                        src={item.image}
                                                        alt="Imagem do plano"
                                                        style={{
                                                            width: '100%',
                                                            maxHeight: 180,
                                                            objectFit: 'contain',
                                                            border: '1px solid #ddd',
                                                            padding: 5,
                                                            background: '#f9f9f9',
                                                            borderRadius: 8
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <div className="mb-3">
                                            <Form.Label>Duração (dias)</Form.Label>
                                            <Form.Control
                                                name="quantity_days"
                                                value={item.quantity_days}
                                                onChange={handlerChange}
                                                type="number"
                                                required
                                            />
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <div className="mb-3">
                                            <Form.Label>Certificados (limite)</Form.Label>
                                            <Form.Control
                                                name="quantity_certificates"
                                                value={item.quantity_certificates}
                                                onChange={handlerChange}
                                                type="number"
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </If>

                            <If condition={tabSelected === '/benefits'}>
                                <Row>
                                    <Col md={12}>
                                        <div className="mb-3">
                                            <Form.Label>Benefícios do Plano</Form.Label>
                                            {benefitsOptions.map(benefit => (
                                                <Form.Check
                                                    key={benefit.value}
                                                    type="checkbox"
                                                    id={`benefit-checkbox-${benefit.value}`}
                                                    label={benefit.label}
                                                    value={benefit.value}
                                                    checked={item.benefits.includes(benefit.value)}
                                                    onChange={handlerCheckboxChange}
                                                />
                                            ))}
                                        </div>
                                    </Col>
                                </Row>
                            </If>

                            <Row>
                                <Col xs={6}>
                                    <Button
                                        variant="light"
                                        type="button"
                                        onClick={() => navigate('/plans')}
                                    >
                                        Voltar
                                    </Button>
                                </Col>

                                <If condition={tabSelected === '/benefits'}>
                                    <Col xs={6} className="d-flex justify-content-end">
                                        <Button
                                            disabled={disabledSubmitForm}
                                            variant="primary"
                                            type="submit"
                                        >
                                            {planId ? 'Salvar alterações' : 'Novo plano'}
                                        </Button>
                                    </Col>
                                </If>

                                <If condition={tabSelected === '/plan'}>
                                    <Col xs={6} className="d-flex justify-content-end">
                                        <Button
                                            disabled={disabledSubmitForm}
                                            variant="primary"
                                            type="button"
                                            onClick={() => {
                                                if (!allFieldsPlanFilled()) {
                                                    toast.error('Preencha todos os campos obrigatórios do plano');
                                                    return;
                                                }
                                                setTabSelected('/benefits');
                                            }}
                                        >
                                            Próximo
                                        </Button>
                                    </Col>
                                </If>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </form>
        </Fragment>
    );
};

export default PlanForm;