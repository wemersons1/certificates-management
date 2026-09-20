import If from '@/src/components/common/if/if';
import { addMaskCpf, clearMask, applyMask } from '@/src/lib/helper';
import React, { FC, useState } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup, Card } from 'react-bootstrap';
import { FaPlus, FaTimes, FaUser, FaEnvelope, FaBuilding, FaIdCard, FaCog } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface ManualEntryModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (employees: any[]) => void;
    companyName?: string;
    showPosition?: boolean;
    selectedCourseTemplate?: string;
}

const ManualEntryModal: FC<ManualEntryModalProps> = ({ show, onClose, onSubmit, companyName, showPosition = false, selectedCourseTemplate}) => {
    const [employees, setEmployees] = useState<any[]>([
        { name: '', cpf: '', rg: '', email: '', cellphone: '', position: '', machines_operated: '', company_name: companyName || '' }
    ]);

    const hasCpfMask = selectedCourseTemplate ? (selectedCourseTemplate.includes('{{cpf_aluno}}') || selectedCourseTemplate.includes('{cpf_aluno}')) : true;
    const hasRgMask = selectedCourseTemplate ? (selectedCourseTemplate.includes('{{rg_aluno}}') || selectedCourseTemplate.includes('{rg_aluno}')) : true;
    const hasPositionMask = selectedCourseTemplate ? (selectedCourseTemplate.includes('{{funcao_aluno}}') || selectedCourseTemplate.includes('{funcao_aluno}')) : true;

    const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newEmployees = [...employees];
        newEmployees[index] = { ...newEmployees[index], [name]: value };
        setEmployees(newEmployees);
    };

    const handleAddEmployee = () => {
        setEmployees([...employees, { name: '', cpf: '', rg: '', email: '', cellphone: '', position: '', machines_operated: '', company_name: companyName || '' }]);
    };

    const handleRemoveEmployee = (index: number) => {
        if (employees.length > 1) {
            const newEmployees = employees.filter((_, i) => i !== index);
            setEmployees(newEmployees);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        for (let i = 0; i < employees.length; i++) {
            const emp = employees[i];
            if (!emp.name?.trim()) {
                toast.error(`Por favor, preencha o nome do Aluno ${i + 1}.`);
                return;
            }
            if (hasCpfMask && (!emp.cpf || clearMask(emp.cpf).length !== 11)) {
                toast.error(`O campo CPF é obrigatório e deve conter 11 dígitos (Aluno ${i + 1}).`);
                return;
            }
            if (hasRgMask && !emp.rg?.trim()) {
                toast.error(`O campo RG é obrigatório (Aluno ${i + 1}).`);
                return;
            }
            if (hasPositionMask && !emp.position?.trim()) {
                toast.error(`O campo Função é obrigatório (Aluno ${i + 1}).`);
                return;
            }
            if (emp.email && emp.email.trim()) {
                if (!emailRegex.test(emp.email.trim())) {
                    toast.error(`Por favor, insira um e-mail válido para o Aluno ${i + 1}.`);
                    return;
                }
            }
        }

        onSubmit(employees);
        setEmployees([{ name: '', cpf: '', rg: '', email: '', cellphone: '', position: '', machines_operated: '', company_name: companyName || '' }]);
    };

    return (
        <Modal show={show} onHide={onClose} backdrop="static" centered size="lg">
            <form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Digitar Dados de Alunos</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '65vh', overflowY: 'auto' }}>

                    {employees.map((employee, index) => (
                        <Card key={index} className="mb-3" style={{ border: '1px solid #e3e8ee', borderRadius: 8 }}>
                            <Card.Body>
                                <Row className="mb-2">
                                    <Col className="d-flex justify-content-between align-items-center">
                                        <h5 className="fw-bold mb-0">Aluno {index + 1}</h5>
                                        {employees.length > 1 && (
                                            <Button variant="outline-danger" size="sm" onClick={() => handleRemoveEmployee(index)}>
                                                <FaTimes />
                                            </Button>
                                        )}
                                    </Col>
                                </Row>
                                <Form.Group as={Row} className="mb-2">
                                    <Col md={6}>
                                        <Form.Label>Nome Completo  (Obrigatório)</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text><FaUser /></InputGroup.Text>
                                            <Form.Control type="text" name="name" value={employee.name} onChange={(e: any) => handleChange(index, e)} required />
                                        </InputGroup>
                                    </Col>
                                    <If condition={hasCpfMask}>
                                        <Col md={6}>
                                            <Form.Label>CPF (Obrigatório)</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text><FaIdCard /></InputGroup.Text>
                                                <Form.Control
                                                    type="text"
                                                    name="cpf"
                                                    value={employee.cpf}
                                                    onChange={(e: any) => {
                                                        const maskedValue = addMaskCpf(e.target.value);
                                                        handleChange(index, {
                                                            ...e,
                                                            target: {
                                                                ...e.target,
                                                                name: 'cpf',
                                                                value: maskedValue,
                                                            },
                                                        });
                                                    }}
                                                    placeholder="000.000.000-00"
                                                    maxLength={14}
                                                    required={hasCpfMask}
                                                />
                                            </InputGroup>
                                        </Col>
                                    </If>
                                    <If condition={hasRgMask}>
                                        <Col md={6}>
                                            <Form.Label>RG (Obrigatório)</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text><FaIdCard /></InputGroup.Text>
                                                <Form.Control
                                                    type="text"
                                                    name="rg"
                                                    value={employee.rg}
                                                    onChange={(e: any) => {
                                                        const maskedValue = applyMask(e.target.value, '99.999.999-9');
                                                        handleChange(index, {
                                                            ...e,
                                                            target: {
                                                                ...e.target,
                                                                name: 'rg',
                                                                value: maskedValue,
                                                            },
                                                        });
                                                    }}
                                                    placeholder="00.000.000-0"
                                                    maxLength={14}
                                                    required={hasRgMask}
                                                />
                                            </InputGroup>
                                        </Col>
                                    </If>
                                    <Col md={6}>
                                        <Form.Label>Email (Opcional)</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text><FaEnvelope /></InputGroup.Text>
                                            <Form.Control type="email" name="email" value={employee.email} onChange={(e: any) => handleChange(index, e)} />
                                        </InputGroup>
                                    </Col>
                                    <If condition={hasPositionMask}>
                                        <Col md={6}>
                                            <Form.Label>Função (Obrigatório)</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text><FaBuilding /></InputGroup.Text>
                                                <Form.Control type="text" name="position" value={employee.position} onChange={(e: any) => handleChange(index, e)} required={hasPositionMask} />
                                            </InputGroup>
                                        </Col>
                                    </If>
                                    <If condition={showPosition}>
                                        <Col md={12}>
                                            <small className="text-muted">Esse campo será usado para a máscara de profissão no certificado quando aplicável.</small>
                                        </Col>
                                    </If>
                                </Form.Group>
                                
                            </Card.Body>
                        </Card>
                    ))}
                    <div className="d-flex justify-content-center">
                        <Button variant="outline-success" className="d-flex align-items-center" onClick={handleAddEmployee}>
                            <FaPlus className="me-2" /> Adicionar Outro Aluno
                        </Button>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ position: 'sticky', bottom: 0, background: '#fff', zIndex: 1 }}>
                    <Button variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type='submit'>
                        Adicionar Alunos ({employees.length})
                    </Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
};

export default ManualEntryModal;