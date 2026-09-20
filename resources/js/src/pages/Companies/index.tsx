import { FC, Fragment, useContext, useEffect, useState } from 'react';
import { Card, CardBody, Col, Form, Modal, Row, Table } from "react-bootstrap";
import { addMaskCnpj, clearMask, firstLetterUppercase, formatDate } from '@/src/lib/helper';
import { Link } from 'react-router-dom';
import api from '@/src/lib/api';
import Pagination from '@/src/components/common/pagination';
import 'filepond/dist/filepond.min.css';
import ImportModal from './components/ImportModal';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import If from '@/src/components/common/if/if';
import AppContext from '@/src/AppContext/Context';
import { BiImport } from 'react-icons/bi';

interface CompaniesProps { };

interface Company {
    id: number;
    name: string;
    email: string;
    cnpj: string;
    created_at: Date;
    active: boolean;
    entity?: {
        business_segment?: {
            name: string;
        };
    };
}

declare global {
    interface Window {
        Pusher: any;
    }
}

const Companies: FC<CompaniesProps> = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [items, setItems] = useState<Company[]>([]);
    const [name, setName] = useState<string>('');
    const [cnpj, setCnpj] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [show, setShow] = useState(false);
    const [getCompanies, setGetcompanies] = useState(false);
    const { hasPermission } = useContext(AppContext);

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

        api.get('/companies', {
            params
        }).then(response => {
            const { data, current_page, last_page } = response.data;
            setItems(data);
            setCurrentPage(current_page);
            setTotalPages(last_page);
        })

    }, [currentPage,, name, email, cnpj, getCompanies]);

    const renderItems = () => {
        return items.map(item => {
            return (
                <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{firstLetterUppercase(item.name)}</td>
                    <td>
                        {item?.email}
                        {item.entity?.business_segment && (
                            <div className="small text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                                <i className="bi bi-tag me-1"></i>
                                {item.entity.business_segment.name}
                            </div>
                        )}
                    </td>
                    <td>{item?.cnpj ? addMaskCnpj(item?.cnpj) : '-'}</td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>
                        <div className="d-flex gap-1">
                            <Link
                            to={`/companies/${item.id}/students`}
                            className="action-btn action-btn-view"
                            title="Gerenciar alunos"
                            >
                            <i className="bx bx-group"></i>
                            Alunos
                            </Link>

                            <If condition={hasPermission('Atualizar')}>
                                 <Link
                                    to={`/companies/${item.id}`}
                                    className="action-btn action-btn-edit"
                                    title="Editar empresa"
                                    >
                                    <i className="bi bi-pencil"></i>
                                    Editar
                                </Link>
                            </If>                

                            <If condition={hasPermission('Excluir')}>
                                <button
                                className="action-btn action-btn-delete"
                                onClick={() => handleDelete(item.id)}
                                title="Excluir empresa"
                                >
                                <i className="bi bi-trash"></i>
                                Excluir
                                </button>
                            </If>

                        </div>
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
            text: 'Deseja realmente excluir esta empresa?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
            api.delete(`/companies/${id}`)
                .then(() => {
                Swal.fire('Excluído!', 'Empresa excluída com sucesso.', 'success');
                setGetcompanies(prev => !prev); // forçar recarregamento
                })
                .catch(() => {
                toast.error('Erro ao excluir empresa');
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
                                <Form.Control type="text" className="" value={name} onChange={e => {
                                    setCurrentPage(1);
                                    setName(e.target.value);
                                }} id="form-text" placeholder="John Doe" />
                            </div>
                        </Col>
                        <Col xl={4}>
                            <div className="mb-3">
                                <Form.Label htmlFor="form-password" className="fs-14 text-dark">Email</Form.Label>
                                <Form.Control type="email" className=""  value={email} onChange={e => {
                                    setCurrentPage(1);
                                    setEmail(e.target.value)
                                }} id="form-password" placeholder="email@example.com" />
                            </div>
                        </Col>
                        <Col xl={4}>
                            <div className="mb-3">
                                <Form.Label htmlFor="form-cnpj" className="fs-14 text-dark">Cnpj</Form.Label>
                                <Form.Control type="cnpj" className=""  value={cnpj} onChange={e => {
                                    setCurrentPage(1);
                                    setCnpj(e.target.value)
                                }} id="form-cnpj" placeholder="XX.XXX.XXX/0001-XX" />
                            </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
            <Card>
                <CardBody>
                    <div className="d-flex justify-content-between">
                        <h6 className='mb-3'>🏢 Empresas</h6>
                        <If condition={hasPermission('Cadastrar')}>
                            <Link to={'/companies/create'} className="xl-2 mb-3 btn btn-outline-primary" type="submit">Nova empresa</Link>
                        </If>
                    </div>
                    <div className="mb-3 text-end">
                        <If condition={hasPermission('Cadastrar')}>
                                <button className="btn btn-success" onClick={() => setShow(true)}>
                                    <BiImport size={18} />
                                    <span className={'m-2'}>Importar Empresas</span>
                                </button>
                        </If>
                       
                        <ImportModal setShow={setShow} show={show} type={'empresas'} getCompanies={getCompanies} setGetcompanies={setGetcompanies} onClose={() => setShow(false)} />
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

export default Companies;