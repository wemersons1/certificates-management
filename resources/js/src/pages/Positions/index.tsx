import { FC, Fragment, useContext, useEffect, useState } from 'react';
import { Card, CardBody, Col, Form, Row, Table } from "react-bootstrap";
import { Link } from 'react-router-dom';
import api from '@/src/lib/api';
import Pagination from '@/src/components/common/pagination';
import If from '@/src/components/common/if/if';
import AppContext from '@/src/AppContext/Context';
import { firstLetterUppercase, formatDate } from '@/src/lib/helper';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

interface PositionsProps { };

interface Course {
    id: number;
    name: string;
}

interface Position {
    id: number;
    name: string;
    created_at: string;
    courses: Course[];
}

const Positions: FC<PositionsProps> = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [items, setItems] = useState<Position[]>([]);
    const [name, setName] = useState<string>('');
    const [getPositions, setGetPositions] = useState(true);
    const { checkRole, hasPermission } = useContext(AppContext);

    useEffect(() => {
        let params = {
            page: currentPage,
            name: '',
        } as {
            page: number;
            name: string;
        };

        if (name.length) {
            params['name'] = name;
        }

        api.get('/positions', {
            params
        }).then(response => {
            const { data, current_page, last_page } = response.data;
            setItems(data);
            setCurrentPage(current_page);
            setTotalPages(last_page);
        });

    }, [currentPage, name, getPositions]);

    const renderItems = () => {
        return items.map(item => {
            const coursesNames = item.courses.map(course => course.name).join(', ') || '-';

            return (
                <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{firstLetterUppercase(item.name)}</td>
                    <td>{coursesNames.slice(0, 80)}</td>
                    <td>{formatDate(item.created_at)}</td>
                    <td className={'d-flex gap-1'}>
                        <If condition={checkRole('Entity') && hasPermission('Atualizar')}>
                            <Link to={`${item.id}`} className="action-btn action-btn-edit" title="Editar">
                                <i className="bi bi-pencil"></i>
                                Editar
                            </Link>
                        </If>
                        <If condition={checkRole('Entity') && hasPermission('Excluir')}>
                            <button
                                className="action-btn action-btn-delete"
                                onClick={() => handleDelete(item.id)}
                                title="Excluir profissão"
                            > 
                                <i className="bi bi-trash"></i>
                                Excluir
                            </button>
                        </If>
                    </td>
                </tr>
            );
        });
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleDelete = (id: number) => {
            Swal.fire({
                title: 'Tem certeza?',
                text: 'Deseja realmente excluir esta profissão?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sim, excluir!',
                cancelButtonText: 'Cancelar',
            }).then((result) => {
                if (result.isConfirmed) {
                api.delete(`/positions/${id}`)
                    .then(() => {
                    Swal.fire('Excluído!', 'Profissão excluído com sucesso.', 'success');
                    setGetPositions(prev => !prev); // forçar recarregamento
                    })
                    .catch(() => {
                    toast.error('Erro ao excluir profissão');
                    });
                }
            });
    };
    
    return (
        <Fragment>
            <Card>
                <CardBody>
                    <h6 className='mb-3'>📍 Filtros</h6>
                    <Row>
                        <Col xl={4}>
                            <div className="mb-3">
                                <Form.Label htmlFor="form-name" className="fs-14 text-dark">Nome</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    id="form-name"
                                    placeholder="Nome do cargo"
                                />
                            </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <If condition={checkRole('Entity') && hasPermission('Cadastrar')}>
                        <div className="d-flex justify-content-between">
                            <h6 className='mb-3'>🛠️ Profissões</h6>
                            <Link to={'create'} className="xl-2 mb-3 btn btn-outline-primary">Nova profissão</Link>
                        </div>
                    </If>

                    <Row>
                        <div className="table-responsive">
                            <Table className="table-hover table-sm">
                                <thead>
                                    <tr>
                                        <th scope="col">Id</th>
                                        <th scope="col">Nome</th>
                                        <th scope="col">Cursos vinculados</th>
                                        <th scope="col">Data de cadastro</th>
                                        <If condition={checkRole('Entity') && (hasPermission('Excluir') || hasPermission('Atualizar'))}>
                                            <th scope="col">Ação</th>
                                        </If>
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderItems()}
                                </tbody>
                            </Table>
                        </div>
                        <div className='d-flex justify-content-end'>
                            <nav aria-label="Page navigation" className="pagination-style-1 me-4 mt-3">
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

export default Positions;
