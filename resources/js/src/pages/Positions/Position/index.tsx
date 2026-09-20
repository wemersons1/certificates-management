import React, { FC, Fragment, useEffect, useState } from 'react';
import { Button, Card, CardBody, Col, Form, Row } from "react-bootstrap";
import api from '@/src/lib/api';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Select2 from '@/src/components/common/select2';

interface Course {
    value: number;
    label: string;
}

interface Position {
    name: string;
    description?: string;
    course_ids: number[];
}

const Position: FC = () => {
    const initialState: Position = {
        name: '',
        description: '',
        course_ids: []
    };

    const [item, setItem] = useState<Position>(initialState);
    const [disabledSubmitForm, setDisabledSubmitForm] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [coursesSelected, setCoursesSelected] = useState<Course[]>([]);
    const [nameWithError, setNameWithError] = useState<boolean>(false);
    const [originalName, setOriginalName] = useState<string>('');

    const positionId = useParams()?.positionId ?? null;
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/courses?all=1').then(response => {
            const coursesTreated = response.data.map((item: any) => ({
                value: item.id,
                label: item.name
            }));
            setCourses(coursesTreated);
        });

        if (positionId) {
            api.get(`/positions/${positionId}`).then(response => {
                const { data } = response;

                const selectedCourses = data.courses.map((item: any) => ({
                    value: item.id,
                    label: item.name
                }));

                setCoursesSelected(selectedCourses);
                setOriginalName(data.name);

                setItem({
                    name: data.name,
                    description: data.description ?? '',
                    course_ids: selectedCourses.map((c: Course) => c.value)
                });
            });
        }
    }, []);

    const handlerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setItem(prev => ({ ...prev, [name]: value }));
    };

    const verifyAvailableName = () => {
        if (originalName.toLocaleLowerCase() !== item.name.toLocaleLowerCase()) {
            api.get(`/positions/name-available?name=${item.name}`).then(response => {
                const { data } = response;
                if (data) {
                    toast.error('Já existe um cargo com este nome cadastrado');
                    setNameWithError(true);
                } else {
                    setNameWithError(false);
                }
            });
        } else {
            setNameWithError(false);
        }
    };

    const handlerSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (nameWithError) {
            toast.error('Já existe um cargo com este nome cadastrado');
            return;
        }

        const payload = {
            ...item,
            courses: coursesSelected.map(c => c.value)
        };

        setDisabledSubmitForm(true);

        const request = positionId
            ? api.put(`/positions/${positionId}`, payload)
            : api.post('/positions', payload);

        request.then(() => {
            Swal.fire({
                icon: "success",
                title: 'Sucesso',
                text: positionId ? "Cargo atualizado com sucesso" : "Cargo cadastrado com sucesso",
                confirmButtonText: "Ok",
            }).then(() => {
                navigate('/positions');
            });
        }).catch(() => {
            toast.error('Erro ao processar a requisição');
        }).finally(() => {
            setDisabledSubmitForm(false);
        });
    };

    return (
        <Fragment>
            <form onSubmit={handlerSubmit}>
                <Col xl={12}>
                    <Card>
                        <CardBody>
                            <Row>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <Form.Label>Cargo</Form.Label>
                                        <Form.Control
                                            onBlur={verifyAvailableName}
                                            name="name"
                                            value={item.name}
                                            onChange={handlerChange}
                                            type="text"
                                            required
                                            placeholder="Ex.: Técnico de Segurança"
                                        />
                                    </div>
                                </Col>

                                <Col md={6}>
                                    <Select2
                                        label={'Cursos vinculados'}
                                        id="courses"
                                        name="course_ids"
                                        isMulti
                                        value={coursesSelected}
                                        onChange={(options: any) => {
                                            setCoursesSelected(options);
                                            const e = {
                                                target: {
                                                    name: 'course_ids',
                                                    value: options.map((opt: any) => opt.value)
                                                }
                                            } as unknown as React.ChangeEvent<HTMLInputElement>;
                                            handlerChange(e);
                                        }}
                                        options={courses}
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <Col md={12}>
                                    <div className="mb-3">
                                        <Form.Label>Descrição</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            name="description"
                                            value={item.description}
                                            onChange={handlerChange}
                                            placeholder="Digite uma descrição para o cargo (opcional)"
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mt-4">
                                <Col xs={6}>
                                    <Button
                                        variant="light"
                                        type="button"
                                        onClick={() => navigate('/positions')}
                                    >
                                        Voltar
                                    </Button>
                                </Col>
                                <Col xs={6} className="d-flex justify-content-end">
                                    <Button
                                        disabled={disabledSubmitForm}
                                        variant="primary"
                                        type="submit"
                                    >
                                        {positionId ? 'Salvar alterações' : 'Nova profissão'}
                                    </Button>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </form>
            <ToastContainer />
        </Fragment>
    );
};

export default Position;
