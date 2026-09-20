import { FC, Fragment, useContext, useEffect, useState } from 'react';
import { Card, CardBody, Col, Form, Row, Table, Modal, Button, Spinner } from "react-bootstrap";
import api from '@/src/lib/api';
import Pagination from '@/src/components/common/pagination';
import If from '@/src/components/common/if/if';
import AppContext from '@/src/AppContext/Context';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { FiDollarSign, FiPlus, FiEdit2, FiTrash2, FiClock, FiLayers, FiInfo } from 'react-icons/fi';

interface CreditPackage {
    id: number;
    name: string;
    credits: number;
    price: number;
    validity_days: number;
    active: boolean;
}

const CreditPackages: FC = () => {
    const { themeMode, checkRole } = useContext(AppContext);
    const [packages, setPackages] = useState<CreditPackage[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [getPackages, setGetPackages] = useState<boolean>(true);
    
    // Modal states
    const [showModal, setShowModal] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [editingPackage, setEditingPackage] = useState<CreditPackage | null>(null);

    // Form states
    const [formName, setFormName] = useState<string>('');
    const [formCredits, setFormCredits] = useState<number | ''>('');
    const [formPrice, setFormPrice] = useState<number | ''>('');
    const [formValidityDays, setFormValidityDays] = useState<number>(30);
    const [formActive, setFormActive] = useState<boolean>(true);

    useEffect(() => {
        const params: any = {
            page: currentPage
        };

        if (searchTerm.length) {
            params.name = searchTerm;
        }

        api.get('/credit-packages', { params })
            .then(response => {
                const { data, current_page, last_page } = response.data;
                setPackages(data);
                setCurrentPage(current_page);
                setTotalPages(last_page);
            })
            .catch(err => {
                console.error("Error loading packages", err);
                toast.error("Erro ao carregar pacotes de créditos.");
            });
    }, [currentPage, searchTerm, getPackages]);

    const handleOpenCreateModal = () => {
        setEditingPackage(null);
        setFormName('');
        setFormCredits('');
        setFormPrice('');
        setFormValidityDays(30);
        setFormActive(true);
        setShowModal(true);
    };

    const handleOpenEditModal = (pkg: CreditPackage) => {
        setEditingPackage(pkg);
        setFormName(pkg.name);
        setFormCredits(pkg.credits);
        setFormPrice(pkg.price);
        setFormValidityDays(pkg.validity_days);
        setFormActive(pkg.active);
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formName.trim()) {
            toast.warning("Nome é obrigatório.");
            return;
        }
        if (formCredits === '' || formCredits <= 0) {
            toast.warning("Quantidade de créditos deve ser maior que 0.");
            return;
        }
        if (formPrice === '' || formPrice < 0) {
            toast.warning("O preço não pode ser negativo.");
            return;
        }
        if (!formValidityDays || formValidityDays <= 0) {
            toast.warning("Validade em dias deve ser maior que 0.");
            return;
        }

        setIsSaving(true);
        const payload = {
            name: formName.trim(),
            credits: Number(formCredits),
            price: Number(formPrice),
            validity_days: Number(formValidityDays),
            active: formActive
        };

        try {
            if (editingPackage) {
                await api.put(`/credit-packages/${editingPackage.id}`, payload);
                toast.success("Pacote atualizado com sucesso!");
            } else {
                await api.post('/credit-packages', payload);
                toast.success("Novo pacote cadastrado com sucesso!");
            }
            setShowModal(false);
            setGetPackages(prev => !prev);
        } catch (error) {
            console.error("Erro ao salvar pacote:", error);
            toast.error("Erro ao salvar pacote de créditos.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Tem certeza?',
            text: 'Deseja realmente excluir este pacote?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280'
        }).then((result) => {
            if (result.isConfirmed) {
                api.delete(`/credit-packages/${id}`)
                    .then(() => {
                        Swal.fire('Excluído!', 'Pacote excluído com sucesso.', 'success');
                        setGetPackages(prev => !prev);
                    })
                    .catch(() => {
                        toast.error('Erro ao excluir pacote');
                    });
            }
        });
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleToggleActive = async (pkg: CreditPackage) => {
        try {
            await api.put(`/credit-packages/${pkg.id}`, { active: !pkg.active });
            toast.success(`Pacote ${!pkg.active ? 'ativado' : 'desativado'} com sucesso!`);
            setGetPackages(prev => !prev);
        } catch (err) {
            console.error("Error toggling status", err);
            toast.error("Erro ao atualizar status do pacote.");
        }
    };

    const cardBg = themeMode === 'dark' ? '#1e293b' : '#ffffff';
    const textTitle = themeMode === 'dark' ? '#ffffff' : '#0f172a';
    const textSubtitle = themeMode === 'dark' ? '#cbd5e1' : '#475569';
    const tableHeaderBg = themeMode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc';
    const tableBorder = themeMode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';

    return (
        <Fragment>
            {/* Header section with rich aesthetics */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
                <div>
                    <h3 style={{ color: textTitle, fontWeight: 800, fontSize: '28px', marginBottom: '6px', letterSpacing: '-0.5px' }}>
                        💳 Preços & Pacotes de Créditos
                    </h3>
                    <p style={{ color: textSubtitle, fontSize: '15px', margin: 0 }}>
                        Configure os valores cobrados por certificado avulso e pacotes com desconto.
                    </p>
                </div>

                <If condition={checkRole('Master')}>
                    <button
                        className="btn d-flex align-items-center gap-2 px-4 py-2"
                        onClick={handleOpenCreateModal}
                        style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            color: '#ffffff',
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <FiPlus size={18} /> Novo Pacote
                    </button>
                </If>
            </div>

            {/* Filter Section */}
            <Card style={{ background: cardBg, border: `1px solid ${tableBorder}`, borderRadius: '16px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <CardBody className="p-4">
                    <h6 className="mb-3 d-flex align-items-center gap-2" style={{ color: textTitle, fontWeight: 700 }}>
                        🔍 Filtrar pacotes
                    </h6>
                    <Row>
                        <Col xl={4}>
                            <Form.Group>
                                <Form.Label htmlFor="form-search" style={{ fontSize: '12px', fontWeight: 600, color: textSubtitle, marginBottom: '6px' }}>Nome do Pacote</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    id="form-search"
                                    placeholder="Ex: Certificado Avulso, Pacote 10..."
                                    style={{
                                        background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                                        border: `1px solid ${tableBorder}`,
                                        borderRadius: '10px',
                                        color: textTitle,
                                        height: '42px'
                                    }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {/* Packages List Card */}
            <Card style={{ background: cardBg, border: `1px solid ${tableBorder}`, borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <CardBody className="p-4">
                    <div className="table-responsive">
                        <Table className="table-hover align-middle" style={{ margin: 0 }}>
                            <thead>
                                <tr style={{ background: tableHeaderBg }}>
                                    <th style={{ borderBottom: `2px solid ${tableBorder}`, color: textSubtitle, fontWeight: 700, padding: '16px' }}>ID</th>
                                    <th style={{ borderBottom: `2px solid ${tableBorder}`, color: textSubtitle, fontWeight: 700, padding: '16px' }}>Nome do Pacote</th>
                                    <th style={{ borderBottom: `2px solid ${tableBorder}`, color: textSubtitle, fontWeight: 700, padding: '16px' }}>Créditos</th>
                                    <th style={{ borderBottom: `2px solid ${tableBorder}`, color: textSubtitle, fontWeight: 700, padding: '16px' }}>Valor Total</th>
                                    <th style={{ borderBottom: `2px solid ${tableBorder}`, color: textSubtitle, fontWeight: 700, padding: '16px' }}>Valor por Crédito</th>
                                    <th style={{ borderBottom: `2px solid ${tableBorder}`, color: textSubtitle, fontWeight: 700, padding: '16px' }}>Validade</th>
                                    <th style={{ borderBottom: `2px solid ${tableBorder}`, color: textSubtitle, fontWeight: 700, padding: '16px' }}>Status</th>
                                    <If condition={checkRole('Master')}>
                                        <th style={{ borderBottom: `2px solid ${tableBorder}`, color: textSubtitle, fontWeight: 700, padding: '16px', textAlign: 'right' }}>Ações</th>
                                    </If>
                                </tr>
                            </thead>
                            <tbody>
                                {packages.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-5" style={{ color: textSubtitle }}>
                                            <FiInfo size={24} className="mb-2 text-primary" />
                                            <p className="margin-0">Nenhum pacote de créditos configurado ainda.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    packages.map(pkg => {
                                        const unitPrice = pkg.price / pkg.credits;
                                        return (
                                            <tr key={pkg.id} style={{ borderBottom: `1px solid ${tableBorder}` }}>
                                                <td style={{ padding: '16px', color: textSubtitle, fontWeight: 600 }}>#{pkg.id}</td>
                                                <td style={{ padding: '16px', color: textTitle, fontWeight: 700 }}>{pkg.name}</td>
                                                <td style={{ padding: '16px' }}>
                                                    <span className="badge px-3 py-2" style={{
                                                        background: 'rgba(59, 130, 246, 0.1)',
                                                        color: '#3b82f6',
                                                        borderRadius: '8px',
                                                        fontWeight: 700,
                                                        fontSize: '12px'
                                                    }}>
                                                        {pkg.credits} {pkg.credits === 1 ? 'crédito' : 'créditos'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px', color: textTitle, fontWeight: 800, fontSize: '15px' }}>
                                                    R$ {pkg.price.toFixed(2).replace('.', ',')}
                                                </td>
                                                <td style={{ padding: '16px', color: '#10b981', fontWeight: 600 }}>
                                                    R$ {unitPrice.toFixed(2).replace('.', ',')}
                                                </td>
                                                <td style={{ padding: '16px', color: textSubtitle }}>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <FiClock style={{ color: '#3b82f6' }} />
                                                        <span>{pkg.validity_days} dias</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <Form.Check 
                                                        type="switch"
                                                        id={`active-switch-${pkg.id}`}
                                                        checked={pkg.active}
                                                        disabled={!checkRole('Master')}
                                                        onChange={() => handleToggleActive(pkg)}
                                                        style={{ cursor: checkRole('Master') ? 'pointer' : 'default' }}
                                                    />
                                                </td>
                                                <If condition={checkRole('Master')}>
                                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                                        <div className="d-inline-flex gap-2">
                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => handleOpenEditModal(pkg)}
                                                                style={{ borderRadius: '8px', padding: '6px 10px' }}
                                                                title="Editar Pacote"
                                                            >
                                                                <FiEdit2 size={14} />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDelete(pkg.id)}
                                                                style={{ borderRadius: '8px', padding: '6px 10px' }}
                                                                title="Excluir Pacote"
                                                            >
                                                                <FiTrash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </If>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-end mt-4">
                            <nav className="pagination-style-1">
                                <Pagination
                                    totalPages={totalPages}
                                    handlePageChange={handlePageChange}
                                    currentPage={currentPage}
                                />
                            </nav>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Magnificent Modal for Create/Edit */}
            <Modal 
                show={showModal} 
                onHide={() => setShowModal(false)}
                centered
                contentClassName="border-0 shadow-lg"
                style={{ backdropFilter: 'blur(8px)' }}
            >
                <div style={{
                    background: themeMode === 'dark' ? '#0f172a' : '#ffffff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: `1px solid ${tableBorder}`
                }}>
                    <Modal.Header closeButton closeVariant={themeMode === 'dark' ? 'white' : 'dark'} style={{ borderBottom: `1px solid ${tableBorder}`, padding: '20px 24px' }}>
                        <Modal.Title style={{ color: textTitle, fontWeight: 800, fontSize: '18px' }}>
                            {editingPackage ? '✏️ Editar Pacote de Créditos' : '➕ Novo Pacote de Créditos'}
                        </Modal.Title>
                    </Modal.Header>

                    <Form onSubmit={handleSave}>
                        <Modal.Body className="p-4">
                            <Form.Group className="mb-3">
                                <Form.Label style={{ fontSize: '12px', fontWeight: 600, color: textSubtitle, marginBottom: '6px' }}>Nome do Pacote</Form.Label>
                                <Form.Control
                                    type="text"
                                    required
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                    placeholder="Ex: Certificado Avulso, Plano Bronze 20..."
                                    style={{
                                        background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                                        border: `1px solid ${tableBorder}`,
                                        borderRadius: '10px',
                                        color: textTitle,
                                        height: '42px'
                                    }}
                                />
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label style={{ fontSize: '12px', fontWeight: 600, color: textSubtitle, marginBottom: '6px' }}>Qtd. Créditos (Certificados)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            required
                                            min={1}
                                            value={formCredits}
                                            onChange={e => setFormCredits(e.target.value !== '' ? Number(e.target.value) : '')}
                                            placeholder="10"
                                            style={{
                                                background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                                                border: `1px solid ${tableBorder}`,
                                                borderRadius: '10px',
                                                color: textTitle,
                                                height: '42px'
                                            }}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label style={{ fontSize: '12px', fontWeight: 600, color: textSubtitle, marginBottom: '6px' }}>Valor Total (R$)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            required
                                            min={0}
                                            step="0.01"
                                            value={formPrice}
                                            onChange={e => setFormPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                                            placeholder="49.90"
                                            style={{
                                                background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                                                border: `1px solid ${tableBorder}`,
                                                borderRadius: '10px',
                                                color: textTitle,
                                                height: '42px'
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label style={{ fontSize: '12px', fontWeight: 600, color: textSubtitle, marginBottom: '6px' }}>Validade (Dias)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            required
                                            min={1}
                                            value={formValidityDays}
                                            onChange={e => setFormValidityDays(Number(e.target.value))}
                                            placeholder="30"
                                            style={{
                                                background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                                                border: `1px solid ${tableBorder}`,
                                                borderRadius: '10px',
                                                color: textTitle,
                                                height: '42px'
                                            }}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6} className="d-flex align-items-center mt-3">
                                    <Form.Group className="mb-0">
                                        <Form.Check 
                                            type="switch"
                                            id="form-active-switch"
                                            label={<span style={{ color: textTitle, fontSize: '13px', fontWeight: 600 }}>Pacote Ativo para Compra</span>}
                                            checked={formActive}
                                            onChange={e => setFormActive(e.target.checked)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {formCredits && formPrice ? (
                                <div className="p-3 mt-3 d-flex align-items-center gap-2" style={{
                                    background: themeMode === 'dark' ? 'rgba(16, 185, 129, 0.05)' : '#ecfdf5',
                                    border: '1px solid rgba(16, 185, 129, 0.2)',
                                    borderRadius: '10px'
                                }}>
                                    <FiDollarSign color="#10b981" size={20} />
                                    <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
                                        Cada certificado custará R$ {(Number(formPrice) / Number(formCredits)).toFixed(2).replace('.', ',')} para o cliente.
                                    </span>
                                </div>
                            ) : null}
                        </Modal.Body>

                        <Modal.Footer style={{ borderTop: `1px solid ${tableBorder}`, padding: '16px 24px' }}>
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => setShowModal(false)}
                                style={{ borderRadius: '8px', fontWeight: 600 }}
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSaving}
                                style={{ 
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                                }}
                            >
                                {isSaving ? <><Spinner size="sm" className="me-2" />Salvando...</> : 'Salvar'}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </div>
            </Modal>
        </Fragment>
    );
};

export default CreditPackages;
