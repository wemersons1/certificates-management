import React, { FC, Fragment, useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, Col, Form, Row, Table } from "react-bootstrap";
import api from '@/src/lib/api';
import Pagination from '@/src/components/common/pagination';
import If from '@/src/components/common/if/if';
import { formatDate } from '@/src/lib/helper';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface NotificationSendItem {
    id: number;
    title: string;
    content: string;
    type: string;
    contact: string;
    employee?: {
        name: string;
        email: string;
    };
    company?: {
        name: string;
        email: string;
    };
    presence_list?: {
        id: number;
        course?: {
            name: string;
        };
    };
    entity?: {
        name: string;
    };
    created_at: string;
}

const NotificationSends: FC = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [items, setItems] = useState<NotificationSendItem[]>([]);
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [type, setType] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const typeOptions = [
        { value: 'email', label: 'Email' },
        { value: 'sms', label: 'SMS' },
        { value: 'whatsapp', label: 'WhatsApp' },
    ];

    useEffect(() => {
        loadNotificationSends();
    }, [currentPage, name, email, type]);

    const loadNotificationSends = () => {
        setIsLoading(true);
        const params = {
            page: currentPage,
            name: name.length ? name : '',
            email: email.length ? email : '',
            type: type.length ? type : '',
        };

        api.get('/notification-send', { params })
            .then(response => {
                const { data, current_page, last_page } = response.data;
                setItems(data);
                setCurrentPage(current_page);
                setTotalPages(last_page);
            })
            .catch(() => {
                toast.error('Erro ao carregar os emails enviados.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const getTypeLabel = (type: string) => {
        const option = typeOptions.find(opt => opt.value === type);
        return option ? option.label : type;
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'email':
                return 'info';
            case 'sms':
                return 'warning';
            case 'whatsapp':
                return 'success';
            default:
                return 'secondary';
        }
    };

    const renderItems = () => {
        if (items.length === 0) {
            return (
                <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                        Nenhum email enviado encontrado
                    </td>
                </tr>
            );
        }

        return items.map(item => (
            <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                    <div>{item.title}</div>
                </td>
                <td>
                    <Badge bg={getTypeColor(item.type)}>{getTypeLabel(item.type)}</Badge>
                </td>
                <td>
                    <div>{item.employee?.name || item.company?.name || '-'}</div>
                    <small className="text-muted">{item.contact}</small>
                </td>
                <td>
                    {item.presence_list?.course?.name || item.entity?.name || '-'}
                </td>
                <td>{formatDate(item.created_at)}</td>
            </tr>
        ));
    };

    return (
        <Fragment>
            <div className="mb-3">
                <h4>📧 Emails Enviados</h4>
            </div>

            <Card>
                <CardBody>
                    <Row>
                        <Col md={12}>
                            <h6 className="mb-3">🔍 Filtros</h6>
                        </Col>
                        <Col xl={3}>
                            <div className="mb-3">
                                <Form.Label htmlFor="filterName" className="fs-14 text-dark">Nome/Empresa</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="filterName"
                                    placeholder="Buscar por nome..."
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </Col>
                        <Col xl={3}>
                            <div className="mb-3">
                                <Form.Label htmlFor="filterEmail" className="fs-14 text-dark">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    id="filterEmail"
                                    placeholder="Buscar por email..."
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </Col>
                        <Col xl={3}>
                            <div className="mb-3">
                                <Form.Label htmlFor="filterType" className="fs-14 text-dark">Tipo</Form.Label>
                                <Form.Select
                                    id="filterType"
                                    value={type}
                                    onChange={(e) => {
                                        setType(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="">Todos os tipos</option>
                                    {typeOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </Form.Select>
                            </div>
                        </Col>
                        <Col xl={3}>
                            <div className="mb-3">
                                <Form.Label className="fs-14 text-dark">&nbsp;</Form.Label>
                                <Button
                                    variant="outline-secondary"
                                    className="w-100"
                                    onClick={() => {
                                        setName('');
                                        setEmail('');
                                        setType('');
                                        setCurrentPage(1);
                                    }}
                                >
                                    Limpar filtros
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <Card className="mt-3">
                <CardBody>
                    <div className="table-responsive">
                        <Table hover className="table-sm">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Assunto</th>
                                    <th>Tipo</th>
                                    <th>Destinatário</th>
                                    <th>Origem</th>
                                    <th>Data de Envio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderItems()}
                            </tbody>
                        </Table>
                    </div>

                    <If condition={totalPages > 1}>
                        <div className='d-flex justify-content-end'>
                            <nav aria-label="Page navigation" className="pagination-style-1 me-4 mt-3">
                                <Pagination
                                    totalPages={totalPages}
                                    handlePageChange={handlePageChange}
                                    currentPage={currentPage}
                                />
                            </nav>
                        </div>
                    </If>
                </CardBody>
            </Card>
        </Fragment>
    );
};

export default NotificationSends;
