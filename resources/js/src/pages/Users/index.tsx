import { FC, Fragment, useContext, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { firstLetterUppercase, formatDate } from '@/src/lib/helper';
import { Link } from 'react-router-dom';
import api from '@/src/lib/api';
import Pagination from '@/src/components/common/pagination';
import If from '@/src/components/common/if/if';
import AppContext from '@/src/AppContext/Context';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

interface ItemsProps { }

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: Role;
    created_at: Date;
    active: boolean;
    company: Company;
    entity: Entity;
    welcome_message_sent: boolean;
    registration_origin?: 'website' | 'google' | 'linkedin' | 'facebook' | null;
}

interface Role { id: number; name: string; }
interface Company { id: number; name: string; contract_active: any; }
interface Entity {
    id: number;
    name: string;
    business_segment?: {
        name: string;
    };
    current_contract?: {
        status?: string;
        description_cancellation?: string | null;
        cancelation_date?: string | null;
    };
}

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#0ea5e9', '#f59e0b', '#ef4444'];
function getAvatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }
function getInitials(name: string) { return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase(); }

const ORIGIN_ICON: Record<string, string> = { website: 'bi-person', google: 'bi-google', linkedin: 'bi-linkedin', facebook: 'bi-facebook' };
const ORIGIN_LABEL: Record<string, string> = { website: 'Normal', google: 'Google', linkedin: 'LinkedIn', facebook: 'Facebook' };

const Items: FC<ItemsProps> = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [items, setItems] = useState<User[]>([]);
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [roleId, setRoleId] = useState<number>(0);
    const [roles, setRoles] = useState<Role[]>([]);
    const [getUsers, setGetUser] = useState(true);
    const [entities, setEntities] = useState<Entity[]>([]);
    const [entityId, setEntityId] = useState(0);
    const [contractStatus, setContractStatus] = useState<string>('');
    const { checkRole, user } = useContext(AppContext);

    useEffect(() => {
        api.get('/roles', { params: { all: 1 } }).then(r => setRoles(r.data));
        if (checkRole('Master')) {
            api.get('/entities', { params: { all: 1 } }).then(r => setEntities(r.data));
        }
    }, []);

    useEffect(() => {
        const params: any = { page: currentPage };
        if (name.length) params.name = name;
        if (email.length) params.email = email;
        if (phone.length) params.phone = phone;
        if (+roleId) params.role_id = +roleId;
        if (+entityId) params.entity_id = +entityId;
        if (contractStatus) params.contract_status = contractStatus;

        api.get('/users', { params }).then(response => {
            const { data, current_page, last_page } = response.data;
            setItems(data);
            setCurrentPage(current_page);
            setTotalPages(last_page);
        });
    }, [currentPage, name, email, phone, roleId, getUsers, entityId, contractStatus]);

    const getCurrentContract = (item: User) => item?.entity?.current_contract;

    const handleViewCancellationObservation = (item: User) => {
        const contract = getCurrentContract(item);
        Swal.fire({
            icon: 'info',
            title: 'Observação de cancelamento',
            text: contract?.description_cancellation?.trim() || 'Nenhuma observação foi informada.',
            confirmButtonText: 'Fechar',
        });
    };

    const showButtonDelete = () => {
        if (checkRole('Master')) return true;
        if (checkRole('Company') && user?.is_main_user) return true;
        if (checkRole('Entity') && user?.entity?.config?.main_user?.id === user?.id) return true;
        return false;
    };

    const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Tem certeza?',
            text: 'Deseja realmente excluir este usuário?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar',
        }).then(result => {
            if (result.isConfirmed) {
                api.delete(`/users/${id}`)
                    .then(() => { Swal.fire('Excluído!', 'Usuário excluído com sucesso.', 'success'); setGetUser(prev => !prev); })
                    .catch(() => toast.error('Erro ao excluir usuário'));
            }
        });
    };

    const handleSendMessage = (userItem: User) => {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
        const message = `${greeting} ${userItem.name.split(' ')[0]}, tudo bem?\n\nSou o ${user?.name.split(' ')[0]}, representante do sistema FlashCertificados, qualquer dúvida sobre o funcionamento da plataforma, estou à disposição.\n\nTenha um ótimo dia!`;
        const phone = userItem.phone.replace(/\D/g, '');
        window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');

        Swal.fire({
            title: 'Mensagem enviada?',
            text: 'A mensagem foi enviada com sucesso?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim, foi enviada',
            cancelButtonText: 'Não',
        }).then(result => {
            if (result.isConfirmed) {
                api.patch(`/users/${userItem.id}/mark-welcome-message-sent`)
                    .then(() => { toast.success('Mensagem marcada como enviada.'); setGetUser(prev => !prev); })
                    .catch(() => toast.error('Erro ao marcar mensagem como enviada.'));
            }
        });
    };

    const isMaster = checkRole('Master');
    const canDelete = showButtonDelete();

    return (
        <Fragment>
            {/* Page header */}
            <div className="modern-page-header">
                <div>
                    <h1 className="page-title">Usuários</h1>
                    <p className="page-subtitle">Gerencie os usuários cadastrados na plataforma</p>
                </div>
                <div className="page-actions">
                    <If condition={canDelete}>
                        <Link to="/users/create" className="btn-primary-custom">
                            <i className="bx bx-plus"></i>
                            Novo Usuário
                        </Link>
                    </If>
                </div>
            </div>

            {/* Filters */}
            <div className="content-card">
                <div className="content-card-header">
                    <span className="content-card-title">Filtros</span>
                </div>
                <div className="content-card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                        <div style={{ position: 'relative' }}>
                            <i className="bx bx-search" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1rem', pointerEvents: 'none' }}></i>
                            <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="Nome..." style={{ paddingLeft: '2.25rem', borderRadius: '8px', fontSize: '0.875rem' }} />
                        </div>
                        <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail..." style={{ borderRadius: '8px', fontSize: '0.875rem' }} />
                        <input type="text" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefone..." style={{ borderRadius: '8px', fontSize: '0.875rem' }} />
                        <If condition={isMaster}>
                            <Form.Select value={roleId} onChange={e => setRoleId(+e.target.value)} style={{ borderRadius: '8px', fontSize: '0.875rem' }}>
                                <option value={0}>Todos os perfis</option>
                                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </Form.Select>
                        </If>
                        <If condition={isMaster}>
                            <Form.Select value={entityId} onChange={e => setEntityId(+e.target.value)} style={{ borderRadius: '8px', fontSize: '0.875rem' }}>
                                <option value={0}>Todas as entidades</option>
                                {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </Form.Select>
                        </If>
                        <If condition={isMaster}>
                            <Form.Select value={contractStatus} onChange={e => setContractStatus(e.target.value)} style={{ borderRadius: '8px', fontSize: '0.875rem' }}>
                                <option value="">Status do plano</option>
                                <option value="cancelled">Plano cancelado</option>
                                <option value="active">Plano ativo</option>
                            </Form.Select>
                        </If>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="content-card">
                <div className="content-card-header">
                    <span className="content-card-title">Usuários</span>
                </div>

                {/* Desktop */}
                <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>#</th>
                                <th>Usuário</th>
                                <th>Telefone</th>
                                <If condition={isMaster}><th>Cadastro</th></If>
                                <If condition={isMaster}><th>Perfil</th></If>
                                <If condition={isMaster}><th>Entidade</th></If>
                                <th>Cadastrado em</th>
                                <If condition={canDelete}><th style={{ textAlign: 'right' }}>Ações</th></If>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                                        <i className="bx bx-user" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
                                        Nenhum usuário encontrado
                                    </td>
                                </tr>
                            ) : items.map(item => {
                                const origin = item.registration_origin ?? 'website';
                                const isCancelled = getCurrentContract(item)?.status === 'cancelled';
                                return (
                                    <tr key={item.id}>
                                        <td><span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>#{item.id}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span className="avatar-initials" style={{ background: getAvatarColor(item.id) }}>{getInitials(item.name || '?')}</span>
                                                <div>
                                                    <p style={{ fontWeight: 500, color: '#111827', margin: 0, fontSize: '0.875rem' }}>{firstLetterUppercase(item.name)}</p>
                                                    <p style={{ color: '#6b7280', margin: 0, fontSize: '0.775rem' }}>{item.email}</p>
                                                    {isMaster && item.entity?.business_segment?.name && (
                                                        <div className="small text-muted" style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                                                            <i className="bi bi-tag me-1"></i>
                                                            {item.entity.business_segment.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ color: '#6b7280', fontSize: '0.8125rem' }}>{item.phone || '—'}</td>
                                        <If condition={isMaster}>
                                            <td>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: '#6b7280', fontSize: '0.8125rem' }}>
                                                    <i className={`bi ${ORIGIN_ICON[origin] ?? 'bi-person'}`}></i>
                                                    {ORIGIN_LABEL[origin] ?? 'Normal'}
                                                </span>
                                            </td>
                                        </If>
                                        <If condition={isMaster}>
                                            <td>
                                                <span className="status-badge status-badge-muted">{item.role?.name || '—'}</span>
                                            </td>
                                        </If>
                                        <If condition={isMaster}>
                                            <td style={{ color: '#6b7280', fontSize: '0.8125rem' }}>{item.entity?.name ?? '—'}</td>
                                        </If>
                                        <td style={{ color: '#6b7280', fontSize: '0.8125rem' }}>{formatDate(item.created_at)}</td>
                                        <If condition={canDelete}>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                                                    {isMaster && item.phone && (
                                                        <button
                                                            className={`action-btn ${item.welcome_message_sent ? '' : 'action-btn-view'}`}
                                                            style={item.welcome_message_sent ? { color: '#9ca3af', border: '1px solid #e5e7eb' } : {}}
                                                            onClick={() => handleSendMessage(item)}
                                                            disabled={item.welcome_message_sent}
                                                            title={item.welcome_message_sent ? 'Mensagem já enviada' : 'Enviar mensagem de boas vindas'}
                                                        >
                                                            <i className="bi bi-whatsapp"></i>
                                                            WhatsApp
                                                        </button>
                                                    )}
                                                    <Link to={`/users/${item.id}/view`} className="action-btn action-btn-view" title="Visualizar">
                                                        <i className="bi bi-eye"></i>
                                                        Ver
                                                    </Link>
                                                    <Link to={`/users/${item.id}`} className="action-btn action-btn-edit" title="Editar">
                                                        <i className="bi bi-pencil"></i>
                                                        Editar
                                                    </Link>
                                                    {isCancelled && (
                                                        <button className="action-btn action-btn-view" onClick={() => handleViewCancellationObservation(item)} title="Ver observação de cancelamento">
                                                            <i className="bi bi-chat-left-text"></i>
                                                            Obs.
                                                        </button>
                                                    )}
                                                    <If condition={user?.id !== item.id}>
                                                        <button className="action-btn action-btn-delete" onClick={() => handleDelete(item.id)} title="Excluir">
                                                            <i className="bi bi-trash"></i>
                                                            Excluir
                                                        </button>
                                                    </If>
                                                </div>
                                            </td>
                                        </If>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile */}
                <div className="d-grid gap-3 d-md-none" style={{ padding: '1rem' }}>
                    {items.map(item => {
                        const origin = item.registration_origin ?? 'website';
                        const isCancelled = getCurrentContract(item)?.status === 'cancelled';
                        return (
                            <div key={item.id} style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: '10px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                                        <span className="avatar-initials" style={{ background: getAvatarColor(item.id), flexShrink: 0 }}>{getInitials(item.name || '?')}</span>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: '0.9rem' }}>{firstLetterUppercase(item.name)}</p>
                                            <p style={{ color: '#6b7280', margin: '0.125rem 0 0', fontSize: '0.8rem' }}>{item.email || '—'}</p>
                                            <p style={{ color: '#9ca3af', margin: '0.125rem 0 0', fontSize: '0.75rem' }}>
                                                #{item.id} · {item.phone || '—'} · {formatDate(item.created_at)}
                                            </p>
                                            {isMaster && <p style={{ color: '#9ca3af', margin: '0.125rem 0 0', fontSize: '0.75rem' }}>{item.role?.name} — {item.entity?.name ?? '—'}</p>}
                                        </div>
                                    </div>
                                    <If condition={canDelete}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flexShrink: 0 }}>
                                            {isMaster && item.phone && (
                                                <button className={`action-btn ${item.welcome_message_sent ? '' : 'action-btn-view'}`} onClick={() => handleSendMessage(item)} disabled={item.welcome_message_sent} title="WhatsApp">
                                                    <i className="bi bi-whatsapp"></i>
                                                </button>
                                            )}
                                            <Link to={`/users/${item.id}/view`} className="action-btn action-btn-view" title="Visualizar"><i className="bi bi-eye"></i></Link>
                                            <Link to={`/users/${item.id}`} className="action-btn action-btn-edit" title="Editar"><i className="bi bi-pencil"></i></Link>
                                            {isCancelled && (
                                                <button className="action-btn action-btn-view" onClick={() => handleViewCancellationObservation(item)} title="Observação">
                                                    <i className="bi bi-chat-left-text"></i>
                                                </button>
                                            )}
                                            <If condition={user?.id !== item.id}>
                                                <button className="action-btn action-btn-delete" onClick={() => handleDelete(item.id)} title="Excluir"><i className="bi bi-trash"></i></button>
                                            </If>
                                        </div>
                                    </If>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem 1.25rem', borderTop: '1px solid #f3f4f6' }}>
                        <nav aria-label="Page navigation" className="pagination-style-1">
                            <Pagination totalPages={totalPages} handlePageChange={handlePageChange} currentPage={currentPage} />
                        </nav>
                    </div>
                )}
            </div>
        </Fragment>
    );
};

export default Items;
