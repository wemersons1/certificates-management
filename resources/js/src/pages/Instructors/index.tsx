import { FC, Fragment, useContext, useEffect, useState } from 'react';
import { firstLetterUppercase, formatDate } from '@/src/lib/helper';
import { Link, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import api from '@/src/lib/api';
import Pagination from '@/src/components/common/pagination';
import If from '@/src/components/common/if/if';
import AppContext from '@/src/AppContext/Context';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import {
    FiSearch,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiEye,
    FiUsers,
    FiUser,
    FiCalendar,
    FiAward,
    FiChevronLeft,
    FiChevronRight,
    FiArrowRight,
} from 'react-icons/fi';

interface InstructorsProps { }

interface Instructor {
    id: number;
    name: string;
    formation: string;
    crea: string;
    created_at: Date;
}

const AVATAR_COLORS = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #0ea5e9, #2563eb)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #ec4899, #db2777)',
    'linear-gradient(135deg, #ef4444, #dc2626)',
    'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    'linear-gradient(135deg, #06b6d4, #0284c7)',
];

function getAvatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }
function getInitials(name: string) {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

const Instructors: FC<InstructorsProps> = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [items, setItems] = useState<Instructor[]>([]);
    const [name, setName] = useState<string>('');
    const [getInstructors, setGetInstructors] = useState(false);
    const [loading, setLoading] = useState(true);
    const { checkRole, hasPermission } = useContext(AppContext);
    const [firstTimeInPage, setFirstTimeInPage] = useState(true);
    const navigate = useNavigate();

    const [creditsBalance, setCreditsBalance] = useState<{ total: number } | null>(null);
    const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);

    useEffect(() => {
        api.get('/credits/balance')
            .then(res => setCreditsBalance(res.data))
            .catch(err => console.error("Error fetching credit balance in Instructors index:", err));
    }, []);

    useEffect(() => {
        setLoading(true);
        const params: any = { page: currentPage };
        if (name.length) params.name = name;

        api.get('/instructors', { params }).then(response => {
            const { data, current_page, last_page } = response.data;
            setItems(data);
            setCurrentPage(current_page);
            setTotalPages(last_page);
            if (firstTimeInPage && data.length === 0) navigate('/instructors/create');
            setFirstTimeInPage(false);
        }).finally(() => setLoading(false));
    }, [currentPage, name, getInstructors]);

    const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Excluir Instrutor?',
            text: 'Esta ação não poderá ser desfeita.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar',
            background: '#151d30',
            color: '#fff',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
        }).then(result => {
            if (result.isConfirmed) {
                api.delete(`/instructors/${id}`)
                    .then(() => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Excluído!',
                            text: 'Instrutor excluído com sucesso.',
                            background: '#151d30',
                            color: '#fff',
                            confirmButtonColor: '#1a56db'
                        });
                        setGetInstructors(prev => !prev);
                    })
                    .catch(() => toast.error('Erro ao excluir instrutor'));
            }
        });
    };

    const canEdit = checkRole('Entity') && hasPermission('Atualizar');
    const canDelete = checkRole('Entity') && hasPermission('Excluir');
    const canCreate = checkRole('Entity') && hasPermission('Cadastrar');
    const hasActions = canEdit || canDelete;

    return (
        <Fragment>
            <style dangerouslySetInnerHTML={{
                __html: `
                :root, [data-theme-mode="light"] {
                    --premium-bg-card: #ffffff;
                    --premium-bg-header: #f8fafc;
                    --premium-border: #e2e8f0;
                    --premium-border-light: #f1f5f9;
                    --premium-text-title: #0f172a;
                    --premium-text-subtitle: #64748b;
                    --premium-text-primary: #1e293b;
                    --premium-text-secondary: #475569;
                    --premium-input-bg: #ffffff;
                    --premium-input-border: #cbd5e1;
                    --premium-table-header-bg: #f8fafc;
                    --premium-table-hover: #f1f5f9;
                    --premium-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }

                [data-theme-mode="dark"] {
                    --premium-bg-card: #111317;
                    --premium-bg-header: #171923;
                    --premium-border: rgba(255,255,255,0.08);
                    --premium-border-light: rgba(255,255,255,0.04);
                    --premium-text-title: #f8fafc;
                    --premium-text-subtitle: #64748b;
                    --premium-text-primary: #e2e8f0;
                    --premium-text-secondary: #cbd5e1;
                    --premium-input-bg: #1a1b23;
                    --premium-input-border: rgba(255,255,255,0.08);
                    --premium-table-header-bg: rgba(255,255,255,0.02);
                    --premium-table-hover: rgba(255,255,255,0.025);
                    --premium-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }

                .premium-page-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 28px;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .premium-page-title {
                    font-size: 28px;
                    font-weight: 800;
                    color: var(--premium-text-title);
                    margin: 0;
                    letter-spacing: -0.5px;
                }
                .premium-page-subtitle {
                    font-size: 14px;
                    color: var(--premium-text-subtitle);
                    margin: 4px 0 0;
                }
                .premium-card {
                    background: var(--premium-bg-card);
                    border: 1px solid var(--premium-border);
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: var(--premium-shadow);
                }
                .premium-card-header {
                    padding: 20px 28px;
                    border-bottom: 1px solid var(--premium-border-light);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    background: var(--premium-bg-header);
                    flex-wrap: wrap;
                }
                .premium-card-title {
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--premium-text-primary);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .premium-search-wrapper {
                    position: relative;
                    flex: 1;
                    max-width: 360px;
                    min-width: 200px;
                }
                .premium-search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--premium-text-subtitle);
                    font-size: 16px;
                    pointer-events: none;
                }
                .premium-search-input {
                    width: 100%;
                    padding: 11px 16px 11px 42px;
                    background: var(--premium-input-bg);
                    border: 1px solid var(--premium-input-border);
                    border-radius: 10px;
                    color: var(--premium-text-title);
                    font-size: 14px;
                    transition: all 0.3s;
                }
                .premium-search-input::placeholder { color: var(--premium-text-subtitle); }
                .premium-search-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
                }
                .premium-btn-create {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #1d4ed8, #1e40af);
                    color: #fff;
                    border: none;
                    padding: 11px 22px;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    text-decoration: none;
                    box-shadow: 0 6px 16px rgba(30,64,175,0.3);
                    transition: all 0.3s;
                    white-space: nowrap;
                }
                .premium-btn-create:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 22px rgba(30,64,175,0.45);
                    color: #fff;
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                }
                .premium-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .premium-table thead tr {
                    background: var(--premium-table-header-bg);
                    border-bottom: 1px solid var(--premium-border-light);
                }
                .premium-table thead th {
                    padding: 14px 20px;
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--premium-text-subtitle);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    white-space: nowrap;
                }
                .premium-table tbody tr {
                    border-bottom: 1px solid var(--premium-border-light);
                    transition: background 0.2s;
                }
                .premium-table tbody tr:hover {
                    background: var(--premium-table-hover);
                }
                .premium-table tbody tr:last-child { border-bottom: none; }
                .premium-table tbody td {
                    padding: 16px 20px;
                    font-size: 14px;
                    color: var(--premium-text-secondary);
                    vertical-align: middle;
                }
                .premium-avatar {
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 800;
                    color: #fff;
                    flex-shrink: 0;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
                }
                .premium-name-cell {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }
                .premium-name-text {
                    font-weight: 600;
                    color: var(--premium-text-primary);
                    font-size: 14px;
                }
                .premium-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    background: rgba(59,130,246,0.1);
                    color: #3b82f6;
                    border: 1px solid rgba(59,130,246,0.2);
                }
                .premium-badge-empty {
                    background: rgba(100,116,139,0.1);
                    color: var(--premium-text-subtitle);
                    border-color: rgba(100,116,139,0.15);
                }
                .premium-action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    border: 1px solid transparent;
                    transition: all 0.25s;
                    text-decoration: none;
                    white-space: nowrap;
                }
                .premium-action-btn-view {
                    background: rgba(14,165,233,0.08);
                    color: #0284c7;
                    border-color: rgba(14,165,233,0.2);
                }
                [data-theme-mode="dark"] .premium-action-btn-view {
                    color: #38bdf8;
                }
                .premium-action-btn-view:hover {
                    background: rgba(14,165,233,0.16);
                    transform: translateY(-1px);
                }
                .premium-action-btn-edit {
                    background: rgba(26,86,219,0.08);
                    color: #2563eb;
                    border-color: rgba(26,86,219,0.2);
                }
                [data-theme-mode="dark"] .premium-action-btn-edit {
                    color: #60a5fa;
                }
                .premium-action-btn-edit:hover {
                    background: rgba(26,86,219,0.16);
                    transform: translateY(-1px);
                }
                .premium-action-btn-delete {
                    background: rgba(239,68,68,0.08);
                    color: #dc2626;
                    border-color: rgba(239,68,68,0.2);
                }
                [data-theme-mode="dark"] .premium-action-btn-delete {
                    color: #f87171;
                }
                .premium-action-btn-delete:hover {
                    background: rgba(239,68,68,0.16);
                    transform: translateY(-1px);
                }
                .premium-empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 64px 24px;
                    color: var(--premium-text-subtitle);
                    text-align: center;
                }
                .premium-empty-icon {
                    font-size: 52px;
                    margin-bottom: 16px;
                    opacity: 0.3;
                }
                .premium-empty-text {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--premium-text-subtitle);
                    margin-bottom: 6px;
                }
                .premium-empty-sub {
                    font-size: 13px;
                    color: var(--premium-text-secondary);
                }
                .premium-pagination-row {
                    padding: 16px 24px;
                    border-top: 1px solid var(--premium-border-light);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--premium-bg-header);
                }
                .premium-pagination-info {
                    font-size: 13px;
                    color: var(--premium-text-subtitle);
                }
                /* Mobile card */
                .premium-mobile-card {
                    margin: 0;
                    padding: 0;
                    border-bottom: 1px solid var(--premium-border-light);
                }
                .premium-mobile-card:last-child { border-bottom: none; }
                .premium-mobile-inner {
                    padding: 18px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    transition: background 0.2s;
                }
                .premium-mobile-inner:hover { background: var(--premium-table-hover); }
                .premium-skeleton {
                    background: linear-gradient(90deg, rgba(148, 163, 184, 0.1) 25%, rgba(148, 163, 184, 0.2) 50%, rgba(148, 163, 184, 0.1) 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    border-radius: 6px;
                    height: 18px;
                }
                [data-theme-mode="dark"] .premium-skeleton {
                    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%);
                    background-size: 200% 100%;
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}} />

            {/* Page Header */}
            <div className="premium-page-header">
                <div>
                    <h1 className="premium-page-title">Instrutores</h1>
                    <p className="premium-page-subtitle">Gerencie os instrutores cadastrados na plataforma</p>
                </div>
                <If condition={canCreate}>
                    <Link 
                        to="create" 
                        className="premium-btn-create"
                        onClick={(e) => {
                            if (!checkRole('Master') && creditsBalance !== null && creditsBalance.total === 0) {
                                e.preventDefault();
                                setShowPaywallModal(true);
                            }
                        }}
                    >
                        <FiPlus size={16} />
                        <span>Novo Instrutor</span>
                    </Link>
                </If>
            </div>

            {/* Main Card */}
            <div className="premium-card">
                {/* Card Header with Search */}
                <div className="premium-card-header">
                    <span className="premium-card-title">
                        <FiUsers size={16} />
                        Lista de Instrutores
                    </span>

                    <div className="premium-search-wrapper">
                        <FiSearch className="premium-search-icon" />
                        <input
                            type="text"
                            className="premium-search-input"
                            value={name}
                            onChange={e => { setName(e.target.value); setCurrentPage(1); }}
                            placeholder="Buscar por nome..."
                        />
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th style={{ width: '56px' }}>#</th>
                                <th>Instrutor</th>
                                <th>Formação / CREA</th>
                                <th>Cadastro</th>
                                <If condition={hasActions}>
                                    <th style={{ textAlign: 'right' }}>Ações</th>
                                </If>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td><div className="premium-skeleton" style={{ width: '32px' }} /></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <div className="premium-skeleton" style={{ width: '42px', height: '42px', borderRadius: '50%' }} />
                                                <div className="premium-skeleton" style={{ width: '160px' }} />
                                            </div>
                                        </td>
                                        <td><div className="premium-skeleton" style={{ width: '120px' }} /></td>
                                        <td><div className="premium-skeleton" style={{ width: '90px' }} /></td>
                                        {hasActions && <td><div className="premium-skeleton" style={{ width: '120px', marginLeft: 'auto' }} /></td>}
                                    </tr>
                                ))
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={hasActions ? 5 : 4}>
                                        <div className="premium-empty-state">
                                            <FiUsers className="premium-empty-icon" />
                                            <p className="premium-empty-text">Nenhum instrutor encontrado</p>
                                            <p className="premium-empty-sub">Tente ajustar o filtro ou cadastre um novo instrutor.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : items.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <span style={{ color: '#374151', fontSize: '12px', fontWeight: 600 }}>#{item.id}</span>
                                    </td>
                                    <td>
                                        <div className="premium-name-cell">
                                            <div
                                                className="premium-avatar"
                                                style={{ background: getAvatarColor(item.id) }}
                                            >
                                                {getInitials(item.name || '?')}
                                            </div>
                                            <div>
                                                <div className="premium-name-text">{firstLetterUppercase(item.name)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {item.formation || item.crea ? (
                                            <div>
                                                {item.formation && (
                                                    <span className="premium-badge">
                                                        <FiAward size={11} />
                                                        {item.formation}
                                                    </span>
                                                )}
                                                {item.crea && (
                                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                                        {item.crea}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="premium-badge inst-badge-empty">Não informado</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px' }}>
                                            <FiCalendar size={13} />
                                            {formatDate(item.created_at)}
                                        </div>
                                    </td>
                                    <If condition={hasActions}>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>

                                                <If condition={canEdit}>
                                                    <Link 
                                                        to={`${item.id}`} 
                                                        className="premium-action-btn premium-action-btn-edit" 
                                                        title="Editar"
                                                        onClick={(e) => {
                                                            if (!checkRole('Master') && creditsBalance !== null && creditsBalance.total === 0) {
                                                                e.preventDefault();
                                                                setShowPaywallModal(true);
                                                            }
                                                        }}
                                                    >
                                                        <i className="bx bx-pencil"></i>
                                                        Editar
                                                    </Link>
                                                </If>
                                                <If condition={canDelete}>
                                                    <button
                                                        className="premium-action-btn premium-action-btn-delete"
                                                        onClick={() => handleDelete(item.id)}
                                                        title="Excluir"
                                                    >
                                                        <i className="bx bx-trash"></i>
                                                        Excluir
                                                    </button>
                                                </If>
                                            </div>
                                        </td>
                                    </If>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile List */}
                <div className="d-block d-md-none">
                    {items.length === 0 && !loading ? (
                        <div className="premium-empty-state">
                            <FiUsers className="premium-empty-icon" />
                            <p className="premium-empty-text">Nenhum instrutor encontrado</p>
                            <p className="premium-empty-sub">Cadastre um novo instrutor para começar.</p>
                        </div>
                    ) : items.map(item => (
                        <div key={item.id} className="premium-mobile-card">
                            <div className="premium-mobile-inner">
                                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                                    <div
                                        className="premium-avatar"
                                        style={{ background: getAvatarColor(item.id) }}
                                    >
                                        {getInitials(item.name || '?')}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div className="premium-name-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {firstLetterUppercase(item.name)}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '2px' }}>
                                            {item.formation || 'Sem formação'} · #{item.id}
                                        </div>
                                    </div>
                                </div>
                                <If condition={hasActions}>
                                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                        <If condition={canEdit}>
                                            <Link to={`${item.id}/view`} className="premium-action-btn inst-action-btn-view" style={{ padding: '8px' }}>
                                                <FiEye size={14} />
                                            </Link>
                                        </If>
                                        <If condition={canEdit}>
                                            <Link 
                                                to={`${item.id}`} 
                                                className="premium-action-btn inst-action-btn-edit" 
                                                style={{ padding: '8px' }}
                                                onClick={(e) => {
                                                    if (!checkRole('Master') && creditsBalance !== null && creditsBalance.total === 0) {
                                                        e.preventDefault();
                                                        setShowPaywallModal(true);
                                                    }
                                                }}
                                            >
                                                <FiEdit2 size={14} />
                                            </Link>
                                        </If>
                                        <If condition={canDelete}>
                                            <button
                                                className="premium-action-btn inst-action-btn-delete"
                                                style={{ padding: '8px' }}
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </If>
                                    </div>
                                </If>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="premium-pagination-row">
                        <span className="premium-pagination-info">
                            Página {currentPage} de {totalPages}
                        </span>
                        <nav aria-label="Page navigation" className="pagination-style-1">
                            <Pagination
                                totalPages={totalPages}
                                handlePageChange={handlePageChange}
                                currentPage={currentPage}
                            />
                        </nav>
                    </div>
                )}
            </div>

            {/* Paywall Limit Modal */}
            <Modal show={showPaywallModal} onHide={() => setShowPaywallModal(false)} centered backdrop="static" keyboard={false}>
                <Modal.Header closeButton style={{ borderBottom: 'none' }}>
                    <Modal.Title className="text-danger fw-bold">Limite de Créditos Atingido</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4">
                    <div className="mb-4">
                        <FiAward size={64} className="text-danger animate__animated animate__bounceIn" />
                    </div>
                    <h4 className="fw-bold mb-3">Você não possui créditos disponíveis</h4>
                    <p className="text-muted mb-4" style={{ fontSize: '15px' }}>
                        Para continuar gerando e emitindo certificados oficiais para seus alunos, é necessário fazer o upgrade do seu plano ou adquirir créditos adicionais.
                    </p>
                    <div className="d-flex flex-column gap-2 px-4">
                        <Button
                            variant="primary"
                            className="fw-bold py-2.5"
                            style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            onClick={() => window.location.href = '/checkout'}
                        >
                            Comprar Créditos / Upgrade <FiArrowRight className="ms-1" />
                        </Button>
                        <Button
                            variant="outline-secondary"
                            className="py-2.5"
                            style={{ borderRadius: '12px' }}
                            onClick={() => navigate('/dashboard')}
                        >
                            Ir para resumo
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </Fragment>
    );
};

export default Instructors;
