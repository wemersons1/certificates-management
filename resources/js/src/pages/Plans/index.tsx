import { FC, Fragment, useContext, useEffect, useState } from 'react';
import { Card, CardBody, Col, Form, Row, Table } from "react-bootstrap";
import { Link } from 'react-router-dom';
import api from '@/src/lib/api';
import Pagination from '@/src/components/common/pagination';
import If from '@/src/components/common/if/if';
import AppContext from '@/src/AppContext/Context';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

interface PlansProps { }

interface Plan {
    id: number;
    name: string;
    monthly_value: number;
    annual_value: number;
    image: string;
    quantity_days: number;
    quantity_certificates: number | null;
}

const Plans: FC<PlansProps> = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [name, setName] = useState<string>('');
    const [getPlans, setGetPlans] = useState<boolean>(true);
    const { checkRole } = useContext(AppContext);

    useEffect(() => {
        const params: any = {
            page: currentPage
        };

        if (name.length) {
            params.name = name;
        }

        api.get('/plans', { params }).then(response => {
            const { data, current_page, last_page } = response.data;
    
            setPlans(data);
            setCurrentPage(current_page);
            setTotalPages(last_page);
        });
    }, [currentPage, name, getPlans]);

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Tem certeza?',
            text: 'Deseja realmente excluir este plano?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                api.delete(`/plans/${id}`)
                    .then(() => {
                        Swal.fire('Excluído!', 'Plano excluído com sucesso.', 'success');
                        setGetPlans(prev => !prev);
                    })
                    .catch(() => {
                        toast.error('Erro ao excluir plano');
                    });
            }
        });
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const renderPlans = () => {
        console.log(plans[0]);
        return plans.map(plan => (
            <tr key={plan.id}>
                <td>{plan.id}</td>
                <td>{plan.name}</td>
                <td>R$ {(plan.monthly_value / 100).toFixed(2).replace('.', ',') ?? '0,00'}</td>
                <td>R$ {(plan.annual_value / 100).toFixed(2).replace('.', ',') ?? '0,00'}</td>
                <td>
                    <img src={plan.image} alt={plan.name} width="50" height="50" style={{ objectFit: 'cover' }} />
                </td>
                <td>{plan.quantity_days} dias</td>
                <td>{plan.quantity_certificates ?? '-'}</td>
                <td className="d-flex gap-1">
                    <If condition={checkRole('Master')}>
                        <Link to={`${plan.id}`} className="btn btn-outline-primary">
                            <i className="bi bi-pencil"></i>
                        </Link>
                    </If>
                    <If condition={checkRole('Master')}>
                        <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(plan.id)}
                            title="Excluir plano"
                        >
                            <i className="bi bi-trash"></i>
                        </button>
                    </If>
                </td>
            </tr>
        ));
    };

    return (
        <Fragment>
            <Card>
                <CardBody>
                    <h6 className="mb-3">📍 Filtros</h6>
                    <Row>
                        <Col xl={4}>
                            <div className="mb-3">
                                <Form.Label htmlFor="form-name" className="fs-14 text-dark">Nome</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    id="form-name"
                                    placeholder="Nome do plano"
                                />
                            </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <If condition={checkRole('Master')}>
                        <div className="d-flex justify-content-between">
                            <h6 className="mb-3">📦 Planos disponíveis</h6>
                            <Link to="create" className="btn btn-outline-primary mb-3">Novo plano</Link>
                        </div>
                    </If>

                    <Row>
                        <div className="table-responsive">
                            <Table className="table-hover table-sm">
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Nome</th>
                                        <th>Mensal</th>
                                        <th>Anual</th>
                                        <th>Imagem</th>
                                        <th>Duração (dias)</th>
                                        <th>Certificados</th>
                                        <If condition={checkRole('Master')}>
                                            <th>Ação</th>
                                        </If>
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderPlans()}
                                </tbody>
                            </Table>
                        </div>
                        <div className="d-flex justify-content-end">
                            <nav className="pagination-style-1 me-4 mt-3">
                                <Pagination
                                    totalPages={totalPages}
                                    handlePageChange={handlePageChange}
                                    currentPage={currentPage}
                                />
                            </nav>
                        </div>
                    </Row>
                </CardBody>
            </Card>
        </Fragment>
    );
};

export default Plans;
