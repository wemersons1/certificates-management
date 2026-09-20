import { FC, Fragment, useContext, useEffect, useState } from 'react';
import { Card, CardBody, Col, Form, Modal, Row, Table, ListGroup, Button } from "react-bootstrap";
import api from '@/src/lib/api';
import Pagination from '@/src/components/common/pagination';
import If from '@/src/components/common/if/if';
import AppContext from '@/src/AppContext/Context';
import { formatDate } from '@/src/lib/helper';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';

interface ImportsProps { };

interface ImportItem {
    id: number;
    title: string;
    errors: string;
    is_read: boolean;
    created_at: string;
}

interface ErrorDetail {
    description: string;
}

const Imports: FC<ImportsProps> = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [items, setItems] = useState<ImportItem[]>([]);
    const [title, setTitle] = useState<string>('');
    const [getImports, setGetImports] = useState(true);
    const { checkRole, hasPermission } = useContext(AppContext);
    const [showErrorsModal, setShowErrorsModal] = useState(false);
    const [selectedErrors, setSelectedErrors] = useState<ErrorDetail[]>([]);

    useEffect(() => {
        const params = {
            page: currentPage,
            title: title.length ? title : '',
        };

        api.get('/notifications', { params })
            .then(response => {
                const { data, current_page, last_page } = response.data;
                setItems(data);
                setCurrentPage(current_page);
                setTotalPages(last_page);
            })
            .catch(() => {
                toast.error('Erro ao carregar as importações.');
            });
    }, [currentPage, title, getImports]);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleToggleRead = async (id: number, isRead: boolean) => {
        try {
            await api.put(`/notifications/${id}`, { is_read: !isRead });
            setItems(prevItems =>
                prevItems.map(item =>
                    item.id === id ? { ...item, is_read: !isRead } : item
                )
            );
        } catch (error) {
            toast.error('Erro ao atualizar o status de leitura.');
        }
    };

    const handleShowErrors = (errorsString: string) => {
        try {
            const errorsArray: ErrorDetail[] = JSON.parse(errorsString);
            setSelectedErrors(errorsArray);
            setShowErrorsModal(true);
        } catch (e) {
            toast.error('Erro ao processar os detalhes dos erros.');
            setSelectedErrors([]);
            setShowErrorsModal(true);
        }
    };

    const renderItems = () => {
     
        return items.map(item => {
               console.log(item);
            const hasErrors = item.errors && item.errors !== '[]';
            const isRead = item.is_read;
            return (
                <tr key={item.id} className={!isRead ? 'table-warning' : ''}>
                    <td>{item.id}</td>
                    <td>{item.title}</td>
                    <td className='text-center'>
                        {hasErrors ? (
                            <FaExclamationCircle className='text-danger' title='Contém erros' />
                        ) : (
                            <i className="bi bi-check-circle-fill text-success"></i>
                        )}
                    </td>
                    <td>{formatDate(item.created_at)}</td>
                    <td className={'d-flex gap-2'}>
                        <If condition={hasErrors}>
                            <Button
                                variant="outline-danger"
                                onClick={() => handleShowErrors(item.errors)}
                                data-bs-toggle="tooltip"
                                title="Visualizar Erros"
                            >
                                <i className="bi bi-exclamation-circle-fill"></i>
                            </Button>
                        </If>
                        <Button
                            variant="outline-secondary"
                            onClick={() => handleToggleRead(item.id, isRead)}
                            data-bs-toggle="tooltip"
                            title={isRead ? 'Marcar como não lido' : 'Marcar como lido'}
                        >
                            {isRead ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                    </td>
                </tr>
            );
        });
    }

    return (
        <Fragment>
            <Card>
                <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className='mb-0'>🔔 Notificações</h6>
                    </div>

                    <Row>
                        <div className="table-responsive">
                            <Table className="table table-nowrap">
                                <thead>
                                    <tr>
                                        <th scope="col">Id</th>
                                        <th scope="col">Título</th>
                                        <th scope="col" className='text-center'>Status</th>
                                        <th scope="col">Data</th>
                                        <th scope="col">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <If condition={items.length > 0} fallback={
                                        <tr>
                                            <td colSpan={5} className="text-center text-muted">Nenhuma importação encontrada.</td>
                                        </tr>
                                    }>
                                        {renderItems()}
                                    </If>
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

            <Modal show={showErrorsModal} onHide={() => setShowErrorsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Detalhes dos Erros</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ListGroup>
                        <If condition={selectedErrors.length > 0} fallback={
                            <p className="text-muted text-center">Nenhum erro detalhado encontrado.</p>
                        }>
                            {selectedErrors.map((error, index) => (
                                <ListGroup.Item key={index} variant="danger">
                                    {error.description}
                                </ListGroup.Item>
                            ))}
                        </If>
                    </ListGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowErrorsModal(false)}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Fragment>
    );
};

export default Imports;