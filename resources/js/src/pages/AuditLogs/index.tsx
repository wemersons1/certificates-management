import React, { FC, Fragment, useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, Col, Form, Row, Table } from "react-bootstrap";
import api from '@/src/lib/api';
import Pagination from '@/src/components/common/pagination';
import If from '@/src/components/common/if/if';
import { formatDate } from '@/src/lib/helper';
import { toast } from 'react-toastify';

interface AuditLogItem {
    id: number;
    user_id: number;
    method: string;
    route: string;
    url: string;
    ip_address: string;
    user_agent: string;
    response_status: number;
    execution_time: number;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
}

const AuditLogs: FC = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [items, setItems] = useState<AuditLogItem[]>([]);
    const [userEmail, setUserEmail] = useState<string>('');
    const [method, setMethod] = useState<string>('');
    const [route, setRoute] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [ip, setIp] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const methodOptions = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    const statusCodeOptions = [200, 201, 400, 401, 403, 404, 422, 500];

    useEffect(() => {
        loadAuditLogs();
    }, [currentPage, userEmail, method, route, status, ip]);

    const loadAuditLogs = () => {
        setIsLoading(true);
        const params = {
            page: currentPage,
            user_email: userEmail.length ? userEmail : '',
            method: method.length ? method : '',
            route: route.length ? route : '',
            status: status.length ? status : '',
            ip: ip.length ? ip : '',
        };

        api.get('/audit-logs', { params })
            .then(response => {
                const { data, current_page, last_page } = response.data;
                setItems(data);
                setCurrentPage(current_page);
                setTotalPages(last_page);
            })
            .catch(() => {
                toast.error('Erro ao carregar os logs de auditoria.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET':
                return 'info';
            case 'POST':
                return 'success';
            case 'PUT':
            case 'PATCH':
                return 'warning';
            case 'DELETE':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    const getStatusColor = (status: number) => {
        if (status >= 200 && status < 300) return 'success';
        if (status >= 300 && status < 400) return 'info';
        if (status >= 400 && status < 500) return 'warning';
        if (status >= 500) return 'danger';
        return 'secondary';
    };

    const getBrowserName = (userAgent: string) => {
        if (!userAgent) return 'Desconhecido';
        
        if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
        if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
        if (userAgent.indexOf('Safari') > -1) return 'Safari';
        if (userAgent.indexOf('Edge') > -1) return 'Edge';
        if (userAgent.indexOf('Opera') > -1) return 'Opera';
        
        return 'Outro';
    };

    const renderItems = () => {
        if (items.length === 0) {
            return (
                <tr>
                    <td colSpan={9} className="text-center text-muted py-4">
                        Nenhum log de auditoria encontrado
                    </td>
                </tr>
            );
        }

        return items.map(item => (
            <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                    <div>{item.user?.name || 'Anônimo'}</div>
                    <small className="text-muted">{item.user?.email}</small>
                </td>
                <td>
                    <Badge bg={getMethodColor(item.method)}>{item.method}</Badge>
                </td>
                <td>
                    <div className="text-truncate" title={item.route} style={{ maxWidth: '200px' }}>
                        {item.route}
                    </div>
                </td>
                <td>
                    <small className="text-muted" title={item.user_agent}>
                        {getBrowserName(item.user_agent)}
                    </small>
                </td>
                <td>
                    <small className="text-monospace">{item.ip_address}</small>
                </td>
                <td>
                    <Badge bg={getStatusColor(item.response_status)}>
                        {item.response_status}
                    </Badge>
                </td>
                <td>
                    <small>{item.execution_time?.toFixed(2)} ms</small>
                </td>
                <td>{formatDate(item.created_at)}</td>
            </tr>
        ));
    };

    return (
        <Fragment>
            <div className="mb-3">
                <h4>🔐 Logs de Auditoria</h4>
            </div>

            <Card>
                <CardBody>
                    <Row>
                        <Col md={12}>
                            <h6 className="mb-3">🔍 Filtros</h6>
                        </Col>
                        <Col xl={2}>
                            <div className="mb-3">
                                <Form.Label htmlFor="filterEmail" className="fs-14 text-dark">Email do Usuário</Form.Label>
                                <Form.Control
                                    type="email"
                                    id="filterEmail"
                                    placeholder="Buscar por email..."
                                    value={userEmail}
                                    onChange={(e) => {
                                        setUserEmail(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </Col>
                        <Col xl={2}>
                            <div className="mb-3">
                                <Form.Label htmlFor="filterMethod" className="fs-14 text-dark">Método</Form.Label>
                                <Form.Select
                                    id="filterMethod"
                                    value={method}
                                    onChange={(e) => {
                                        setMethod(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="">Todos</option>
                                    {methodOptions.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </Form.Select>
                            </div>
                        </Col>
                        <Col xl={2}>
                            <div className="mb-3">
                                <Form.Label htmlFor="filterRoute" className="fs-14 text-dark">Rota</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="filterRoute"
                                    placeholder="Buscar rota..."
                                    value={route}
                                    onChange={(e) => {
                                        setRoute(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </Col>
                        <Col xl={2}>
                            <div className="mb-3">
                                <Form.Label htmlFor="filterStatus" className="fs-14 text-dark">Status HTTP</Form.Label>
                                <Form.Select
                                    id="filterStatus"
                                    value={status}
                                    onChange={(e) => {
                                        setStatus(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="">Todos</option>
                                    {statusCodeOptions.map(code => (
                                        <option key={code} value={code}>{code}</option>
                                    ))}
                                </Form.Select>
                            </div>
                        </Col>
                        <Col xl={2}>
                            <div className="mb-3">
                                <Form.Label htmlFor="filterIp" className="fs-14 text-dark">IP</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="filterIp"
                                    placeholder="Buscar IP..."
                                    value={ip}
                                    onChange={(e) => {
                                        setIp(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </Col>
                        <Col xl={2}>
                            <div className="mb-3">
                                <Form.Label className="fs-14 text-dark">&nbsp;</Form.Label>
                                <Button
                                    variant="outline-secondary"
                                    className="w-100"
                                    onClick={() => {
                                        setUserEmail('');
                                        setMethod('');
                                        setRoute('');
                                        setStatus('');
                                        setIp('');
                                        setCurrentPage(1);
                                    }}
                                >
                                    Limpar
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
                                    <th>Usuário</th>
                                    <th>Método</th>
                                    <th>Rota</th>
                                    <th>Navegador</th>
                                    <th>IP</th>
                                    <th>Status</th>
                                    <th>Tempo (ms)</th>
                                    <th>Data/Hora</th>
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

export default AuditLogs;
