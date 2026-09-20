import { FC, Fragment, useEffect, useState } from 'react';
import { Button, Card, CardBody, Col, Form, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import api from '@/src/lib/api';
import Editor from '@/src/components/common/Editor/Editor';

interface TermConditionFormProps {}

const TermConditionForm: FC<TermConditionFormProps> = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [content, setContent] = useState<string>('');
    const [active, setActive] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);

    const isEditMode = Boolean(id);

    useEffect(() => {
        if (isEditMode) {
            api.get(`/term-conditions/${id}`)
                .then(response => {
                    const data = response.data;
                    setContent(data.content);
                    setActive(data.active);
                })
                .catch(() => toast.error('Erro ao carregar os dados do termo'));
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            content,
            active,
        };

        try {
            if (isEditMode) {
                await api.put(`/term-conditions/${id}`, payload);
                toast.success('Termo atualizado com sucesso!');
            } else {
                await api.post('/term-conditions', payload);
                toast.success('Termo cadastrado com sucesso!');
            }
            navigate('/term-conditions');
        } catch (error) {
            toast.error('Erro ao salvar termo');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        Swal.fire({
            title: 'Cancelar?',
            text: 'Você perderá todas as alterações não salvas.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, cancelar',
            cancelButtonText: 'Voltar',
        }).then(result => {
            if (result.isConfirmed) {
                navigate('/term-conditions');
            }
        });
    };

    return (
        <Fragment>
            <Card>
                <CardBody>
                    <h5 className="mb-3">
                        <i className="bx bx-file me-2"></i>
                        {isEditMode ? 'Editar Termo' : 'Novo Termo de Condição'}
                    </h5>

                    <Row className="mb-3">
                        <Col md={3}>
                            <Form.Check
                                type="switch"
                                label="Ativo"
                                checked={active}
                                onChange={(e) => setActive(e.target.checked)}
                            />
                        </Col>
                    </Row>

                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Label className="text-dark">Conteúdo</Form.Label>
                                <Editor
                                    value={content}
                                    onEditorChange={setContent}
                                />
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={handleCancel}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </div>
                    </Form>
                </CardBody>
            </Card>
        </Fragment>
    );
};

export default TermConditionForm;
