import { FC, Fragment, useEffect, useState } from 'react';
import { Card, CardBody, Col, Form, Modal, Row, Table } from "react-bootstrap";
import { addMaskCnpj, clearMask, formatDate } from '@/src/lib/helper';
import { Link } from 'react-router-dom';
import api from '@/src/lib/api';
import Pagination from '@/src/components/common/pagination';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

interface EntitiesProps { };

interface Entities {
    id: number;
    name: string;
    email: string;
    cnpj: string;
    created_at: Date;
    active: boolean;
    business_segment?: {
        name: string;
    };
}

const Entities: FC<EntitiesProps> = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [items, setItems] = useState<Entities[]>([]);
    const [name, setName] = useState<string>('');
    const [cnpj, setCnpj] = useState<string>('');
    const [email, setEmail] = useState<string>('');

    useEffect(() => {
        let params = {
            page: currentPage,
            name: '',
            email: '',
            cnpj: '',
            role_id: null
        } as {
            page: number;
            name: string;
            email: string;
            cnpj: string;
            role_id: null | number;
        };

        if(name.length) {
            params['name'] = name;
        }

        if(email.length) {
            params['email'] = email;
        }

        if(clearMask(cnpj).length) {
            params['cnpj'] = clearMask(cnpj);
        }

        api.get('/entities', {
            params
        }).then(response => {
            const { data, current_page, last_page } = response.data;
            setItems(data);
            setCurrentPage(current_page);
            setTotalPages(last_page);
        })

    }, [currentPage,, name, email, cnpj]);

    const renderItems = () => {
        return items.map(item => {
            return (
                <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>
                        {item?.email}
                        {item.business_segment && (
                            <div className="small text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                                <i className="bi bi-tag me-1"></i>
                                {item.business_segment.name}
                            </div>
                        )}
                    </td>
                    <td>{item?.cnpj ? addMaskCnpj(item?.cnpj) : '-'}</td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>
                        <Link to={`/entities/${item.id}`} className="action-btn action-btn-edit" title="Editar">
                            <i className="bi bi-pencil"></i>
                            Editar
                        </Link>
                        <button
                            className="action-btn action-btn-delete"
                            onClick={() => handleDelete(item.id)}
                            title="Excluir"
                        >
                            <i className="bi bi-trash"></i>
                            Excluir
                        </button>
                    </td>
              </tr>
            );
        });
    }

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Tem certeza?',
            text: 'Deseja realmente excluir esta entidade?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                api.delete(`/entities/${id}`)
                    .then(() => {
                        toast.success('Entidade excluída com sucesso');
                        setItems(prev => prev.filter(entity => entity.id !== id));
                    })
                    .catch(() => {
                        toast.error('Erro ao excluir entidade');
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
                                <Form.Label htmlFor="form-text" className=" fs-14 text-dark">Nome</Form.Label>
                                <Form.Control type="text" className="" value={name} onChange={e => setName(e.target.value)} id="form-text" placeholder="John Doe" />
                            </div>
                        </Col>
                        <Col xl={4}>
                            <div className="mb-3">
                                <Form.Label htmlFor="form-password" className="fs-14 text-dark">Email</Form.Label>
                                <Form.Control type="email" className=""  value={email} onChange={e => setEmail(e.target.value)} id="form-password" placeholder="email@example.com" />
                            </div>
                        </Col>
                        <Col xl={4}>
                            <div className="mb-3">
                                <Form.Label htmlFor="form-cnpj" className="fs-14 text-dark">Cnpj</Form.Label>
                                <Form.Control type="cnpj" className=""  value={cnpj} onChange={e => setCnpj(e.target.value)} id="form-cnpj" placeholder="XX.XXX.XXX/0001-XX" />
                            </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
            <Card>
                <CardBody>
                <div className="d-flex justify-content-between">
                    <h6 className='mb-3'>Entidade</h6>
                    <Link to={'/entities/create'} className="xl-2 mb-3 btn btn-outline-primary" type="submit">Nova entidade</Link>
                </div>
                
                <Row>
                    <div className="table-responsive">
                    <Table className="table-hover table-sm">
                        <thead>
                        <tr>
                            <th scope="col">Id</th>
                            <th scope="col">Nome</th>
                            <th scope="col">Usuário</th>
                            <th scope="col">CNPJ</th>
                            <th scope="col">Data de cadastro</th>
                            <th scope="col">Ação</th>
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

export default Entities;