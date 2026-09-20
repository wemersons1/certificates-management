import { FC, Fragment, useContext, useEffect, useState } from 'react';
import { Card, CardBody, Col, Form, Row, Table } from "react-bootstrap";
import { Link } from 'react-router-dom';
import api from '@/src/lib/api';
import Pagination from '@/src/components/common/pagination';
import If from '@/src/components/common/if/if';
import AppContext from '@/src/AppContext/Context';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { formatDate } from '@/src/lib/helper';

interface TermCondition {
    id: number;
    active: boolean;
    created_at: string;
}

const TermConditions: FC = () => {
    const [terms, setTerms] = useState<TermCondition[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const { checkRole } = useContext(AppContext);

    useEffect(() => {
        api.get('/term-conditions', { params: { page: currentPage } }).then(response => {
            const { data, current_page, last_page } = response.data;

            setTerms(data);
            setCurrentPage(current_page);
            setTotalPages(last_page);
        });
    }, [currentPage]);

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Tem certeza?',
            text: 'Deseja excluir este termo?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                api.delete(`/term-conditions/${id}`)
                    .then(() => {
                        Swal.fire('Excluído!', 'Termo excluído com sucesso.', 'success');
                        setTerms(prev => prev.filter(term => term.id !== id));
                    })
                    .catch(() => {
                        toast.error('Erro ao excluir termo');
                    });
            }
        });
    };

    const renderTerms = () => {
        return terms.map(term => (
            <tr key={term.id}>
                <td>{term.id}</td>
                <td>
                    {term.active ? (
                        <span className="badge bg-success">Ativo</span>
                    ) : (
                        <span className="badge bg-secondary">Inativo</span>
                    )}
                </td>
                <td>{formatDate(term.created_at)}</td>
                <If condition={checkRole('Master')}>
                    <td className="d-flex gap-1">
                        <Link to={`${term.id}`} className="btn btn-outline-primary btn-sm">
                            <i className="bi bi-eye"></i>
                        </Link>
                        <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(term.id)}
                        >
                            <i className="bi bi-trash"></i>
                        </button>
                    </td>
                </If>
            </tr>
        ));
    };

    return (
        <Fragment>
            <Card>
                <CardBody>
                    <If condition={checkRole('Master')}>
                        <div className="d-flex justify-content-between">
                            <h6 className="mb-3"><i className="bx bx-file me-1"></i> Termos e Condições</h6>
                            <Link to="create" className="btn btn-outline-primary mb-3">Novo termo</Link>
                        </div>
                    </If>

                    <Row>
                        <div className="table-responsive">
                            <Table className="table-hover table-sm">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Status</th>
                                        <th>Criado em</th>
                                        <If condition={checkRole('Master')}>
                                            <th>Ação</th>
                                        </If>
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderTerms()}
                                </tbody>
                            </Table>
                        </div>
                        <div className="d-flex justify-content-end">
                            <nav className="pagination-style-1 me-4 mt-3">
                                <Pagination
                                    totalPages={totalPages}
                                    handlePageChange={setCurrentPage}
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

export default TermConditions;
