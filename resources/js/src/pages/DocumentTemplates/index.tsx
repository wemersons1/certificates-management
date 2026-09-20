import { FC, Fragment, useContext, useEffect, useState } from 'react';
import { Card, CardBody, Col, Row, Table } from "react-bootstrap";
import { firstLetterUppercase, formatDate } from '@/src/lib/helper';
import { Link } from 'react-router-dom';
import api from '@/src/lib/api';
import Pagination from '@/src/components/common/pagination';
import If from '@/src/components/common/if/if';
import AppContext from '@/src/AppContext/Context';
import Select2 from '@/src/components/common/select2';
import { Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

interface DocumentTemplatesProps { }

interface TemplateType {
    value: string;
    label: string;
}

interface DocumentTemplate {
    id: number;
    name: string;
    type: {
        id: number;
        name: string;
    };
    created_at: string;
}

const DocumentTemplates: FC<DocumentTemplatesProps> = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [items, setItems] = useState<DocumentTemplate[]>([]);
    const [name, setName] = useState<string>('');
    const [type, setType] = useState<string>('');
    const [getDocumentTemplates, setGetDocumentTemplates] = useState(true);
    const { checkRole, hasPermission } = useContext(AppContext);

    const templateTypes: TemplateType[] = [
        { value: '0', label: 'Selecione' },
        { value: '1', label: 'Certificado' },
        { value: '2', label: 'Lista de Presença' },
        { value: '3', label: 'Autorização/Anuência' },
    ];

    useEffect(() => {
        let params = {
            page: currentPage,
            name: '',
            type_id: '',
        };

        if (name.length) {
            params['name'] = name;
        }

        if ( +type?.length && +type) {
            params['type_id'] = type;
        }

        api.get('/document-templates', { params }).then(response => {
            const { data, current_page, last_page } = response.data;
            setItems(data);
            setCurrentPage(current_page);
            setTotalPages(last_page);
        });
    }, [currentPage, name, type, getDocumentTemplates]);

    const renderItems = () => {
        return items.map(item => (
            <tr key={item.id}>
                <td>{item.id}</td>
                <td>{firstLetterUppercase(item.name)}</td>
                <td>{item.type?.name ?? '-'}</td>
                <td>{formatDate(item.created_at)}</td>
                <td className={'d-flex gap-1'}>
                    <If condition={checkRole('Entity') && hasPermission('Atualizar')}>
                        <Link to={`${item.id}`} className={'btn btn-outline-primary'}>
                            <i className="bi bi-pencil"></i>
                        </Link>
                    </If>
                    <If condition={checkRole('Entity') && hasPermission('Excluir')}>
                        <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(item.id)}
                            data-bs-toggle="tooltip"
                            title="Excluir empresa"
                        > <i className="bi bi-trash"></i>
                        </button>
                    </If>
                </td>
            </tr>
        ));
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Tem certeza?',
            text: 'Deseja realmente excluir este template?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
            api.delete(`/document-templates/${id}`)
                .then(() => {
                Swal.fire('Excluído!', 'Template excluído com sucesso.', 'success');
                setGetDocumentTemplates(prev => !prev); // forçar recarregamento
                })
                .catch(() => {
                toast.error('Erro ao excluir template');
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
                        <Col xl={6}>
                            <div className="mb-3">
                                <Form.Label className="fs-14 text-dark">Nome</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Nome do template"
                                />
                            </div>
                        </Col>
                        <Col xl={6}>
                            <Select2
                                label={'Tipo'}
                                id="type"
                                name="type"
                                value={templateTypes.find(t => t.value === type) ?? { value: '', label: 'Selecione o tipo' }}
                                onChange={(option: any) => {
                                    setType(option?.value || '');
                                }}
                                options={templateTypes}
                                isClearable
                            />
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <If condition={checkRole('Entity') && hasPermission('Cadastrar')}>
                        <div className="d-flex justify-content-between">
                            <h6 className='mb-3'>📄 Templates de documento</h6>
                            <Link to={'create'} className="xl-2 mb-3 btn btn-outline-primary">
                                Novo template
                            </Link>
                        </div>
                    </If>

                    <Row>
                        <div className="table-responsive">
                            <Table className="table-hover table-sm">
                                <thead>
                                    <tr>
                                        <th scope="col">Id</th>
                                        <th scope="col">Nome</th>
                                        <th scope="col">Tipo</th>
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

export default DocumentTemplates;
