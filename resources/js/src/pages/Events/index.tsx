import { FC, Fragment, useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { formatDate } from '@/src/lib/helper';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/src/lib/api';
import Pagination from '@/src/components/common/pagination';
import { toast } from 'react-toastify';

interface Event {
    id: number;
    uuid?: string;
    checkin_code?: string;
    title: string;
    course?: { name: string };
    issue_date?: string;

    number_of_hours?: number;
    has_generated_certificates?: boolean;
    certificates_closed?: boolean;
}

interface Option { value: number; label: string; }

const Items: FC = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [items, setItems] = useState<Event[]>([]);
    const [id, setId] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [courseOptions, setCourseOptions] = useState<Option[]>([]);
    const [courseId, setCourseId] = useState<string>('');
    const [openFilters, setOpenFilters] = useState(false);
    const [selectedQrEvent, setSelectedQrEvent] = useState<Event | null>(null);
    const [copiedQrUuid, setCopiedQrUuid] = useState<string>('');
    const [toggleClosedEvent, setToggleClosedEvent] = useState<Event | null>(null);
    const [isTogglingClosed, setIsTogglingClosed] = useState(false);
    const navigate = useNavigate();

    const getPublicEventUrl = (checkinCode?: string) => {
        if (!checkinCode) return '';
        return `${window.location.origin}/public/events/code/${checkinCode}`;
    };

    const getQrCodeImageUrl = (url: string) =>
        `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(url)}`;

    const handleCopyPublicLink = async (checkinCode?: string) => {
        if (!checkinCode) return;
        try {
            await navigator.clipboard.writeText(getPublicEventUrl(checkinCode));
            setCopiedQrUuid(checkinCode);
            setTimeout(() => setCopiedQrUuid(''), 2000);
            toast.success('Link público copiado!');
        } catch {
            toast.error('Não foi possível copiar o link.');
        }
    };

    useEffect(() => {
        api.get('/courses', { params: { all: 1 } }).then(response => {
            setCourseOptions(response.data.map((item: any) => ({ value: item.id, label: item.name })));
        });
    }, []);

    useEffect(() => {
        api.get('/events', {
            params: { page: currentPage, id, search, course_id: courseId }
        }).then(response => {
            const { data, current_page, last_page } = response.data;
            if (!data.length) { navigate('/events/create'); return; }
            setItems(data);
            setCurrentPage(current_page);
            setTotalPages(last_page);
        });
    }, [currentPage, id, search, courseId]);

    const resetFilters = () => { setId(''); setSearch(''); setCourseId(''); setCurrentPage(1); };

    const handleConfirmToggleClosed = () => {
        if (!toggleClosedEvent) return;
        setIsTogglingClosed(true);
        api.patch(`/events/${toggleClosedEvent.id}/toggle-certificates-close`)
            .then(res => {
                setItems(prev => prev.map(e => e.id === toggleClosedEvent.id ? { ...e, certificates_closed: res.data.certificates_closed } : e));
                toast.success(res.data.certificates_closed ? 'Emissão de certificados encerrada.' : 'Emissão de certificados reaberta.');
                setToggleClosedEvent(null);
            })
            .catch(() => toast.error('Erro ao atualizar o evento.'))
            .finally(() => setIsTogglingClosed(false));
    };

    return (
        <Fragment>
            {/* Page header */}
            <div className="modern-page-header">
                <div>
                    <h1 className="page-title">Eventos</h1>
                    <p className="page-subtitle">Gerencie os eventos e check-ins da plataforma</p>
                </div>
                <div className="page-actions">
                    <Link to="/events/create" className="btn-primary-custom">
                        <i className="bx bx-plus"></i>
                        Novo Evento
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="content-card">
                <div className="content-card-header" style={{ cursor: 'pointer' }} onClick={() => setOpenFilters(v => !v)}>
                    <span className="content-card-title">Filtros</span>
                    <button
                        style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        onClick={e => { e.stopPropagation(); setOpenFilters(v => !v); }}
                    >
                        {openFilters ? 'Esconder' : 'Expandir'}
                        <i className={`bi bi-chevron-${openFilters ? 'up' : 'down'}`}></i>
                    </button>
                </div>
                {openFilters && (
                    <div className="content-card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>ID</label>
                                <input type="text" className="form-control" value={id} onChange={e => { setId(e.target.value); setCurrentPage(1); }} placeholder="Ex: 12" style={{ borderRadius: '8px', fontSize: '0.875rem' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>Buscar</label>
                                <input type="text" className="form-control" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Título ou curso..." style={{ borderRadius: '8px', fontSize: '0.875rem' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>Curso</label>
                                <Form.Select value={courseId} onChange={e => { setCourseId(e.target.value); setCurrentPage(1); }} style={{ borderRadius: '8px', fontSize: '0.875rem' }}>
                                    <option value="">Todos</option>
                                    {courseOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </Form.Select>
                            </div>
                            <div>
                                <button onClick={resetFilters} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#374151', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'pointer', width: '100%' }}>
                                    Limpar filtros
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="content-card">
                <div className="content-card-header">
                    <span className="content-card-title">Eventos</span>
                </div>

                {/* Desktop */}
                <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>#</th>
                                <th>Código</th>
                                <th>Evento</th>
                                <th>Curso</th>
                                <th>Emissão</th>
                                <th>Carga</th>

                                <th style={{ textAlign: 'right' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                                        <i className="bx bx-calendar-event" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
                                        Nenhum evento encontrado
                                    </td>
                                </tr>
                            ) : items.map(item => (
                                <tr key={item.id}>
                                    <td><span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>#{item.id}</span></td>
                                    <td>
                                        <span style={{ fontFamily: 'monospace', letterSpacing: '0.15rem', fontWeight: 700, color: '#2563eb', fontSize: '0.9rem' }}>
                                            {item.checkin_code || '—'}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 500, color: '#111827' }}>{item.title || <span style={{ color: '#9ca3af' }}>Sem título</span>}</td>
                                    <td style={{ color: '#6b7280', fontSize: '0.8125rem' }}>{item.course?.name || '—'}</td>
                                    <td style={{ color: '#6b7280', fontSize: '0.8125rem' }}>{item.issue_date ? formatDate(item.issue_date, 'd/m/Y') : '—'}</td>
                                    <td>
                                        {item.number_of_hours != null ? (
                                            <span className="status-badge status-badge-primary">{item.number_of_hours}h</span>
                                        ) : <span style={{ color: '#d1d5db' }}>—</span>}
                                    </td>

                                    <td>
                                        <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                                            {item.has_generated_certificates && (
                                                <Link to={`/documents?event_id=${item.id}`} className="action-btn" style={{ color: '#d97706', borderColor: '#fef3c7', background: '#fffbeb' }} title="Ver certificados gerados">
                                                    <i className="bi bi-award"></i>
                                                    Certificados
                                                </Link>
                                            )}
                                            <button
                                                className="action-btn action-btn-view"
                                                onClick={() => setSelectedQrEvent(item)}
                                                title={item.checkin_code ? `QR Code — ${item.checkin_code}` : 'QR Code público'}
                                                disabled={!item.checkin_code && !item.uuid}
                                            >
                                                <i className="bi bi-qr-code"></i>
                                                QR Code
                                            </button>
                                            <button
                                                className="action-btn"
                                                style={item.certificates_closed
                                                    ? { color: '#ef4444', background: '#fef2f2', borderColor: '#fecaca' }
                                                    : { color: '#6b7280', background: '#f9fafb', borderColor: '#e5e7eb' }}
                                                onClick={() => setToggleClosedEvent(item)}
                                                title={item.certificates_closed ? 'Encerrado — clique para reabrir' : 'Encerrar emissão'}
                                            >
                                                <i className={`bi ${item.certificates_closed ? 'bi-lock-fill' : 'bi-lock'}`}></i>
                                                {item.certificates_closed ? 'Reabrir' : 'Encerrar'}
                                            </button>
                                            <Link to={`/events/${item.id}/view`} className="action-btn action-btn-edit" title="Visualizar">
                                                <i className="bi bi-eye"></i>
                                                Ver
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile */}
                <div className="d-grid gap-3 d-md-none" style={{ padding: '1rem' }}>
                    {items.map(item => (
                        <div key={item.id} style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: '10px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {item.checkin_code && (
                                        <span style={{ fontFamily: 'monospace', letterSpacing: '0.15rem', fontWeight: 700, color: '#2563eb', fontSize: '1rem' }}>
                                            {item.checkin_code}
                                        </span>
                                    )}
                                    <p style={{ fontWeight: 600, color: '#111827', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>{item.title || 'Sem título'}</p>
                                    <p style={{ color: '#6b7280', margin: '0.125rem 0 0', fontSize: '0.8rem' }}>{item.course?.name || '—'}</p>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                        {item.number_of_hours != null && (
                                            <span className="status-badge status-badge-primary">{item.number_of_hours}h</span>
                                        )}

                                        {item.issue_date && <span style={{ color: '#9ca3af', fontSize: '0.75rem', alignSelf: 'center' }}>{formatDate(item.issue_date, 'd/m/Y')}</span>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flexShrink: 0 }}>
                                    {item.has_generated_certificates && (
                                        <Link to={`/documents?event_id=${item.id}`} className="action-btn" style={{ color: '#d97706', borderColor: '#fef3c7', background: '#fffbeb' }} title="Certificados">
                                            <i className="bi bi-award"></i>
                                        </Link>
                                    )}
                                    <Link to={`/events/${item.id}/view`} className="action-btn action-btn-edit" title="Visualizar"><i className="bi bi-eye"></i></Link>
                                    <button className="action-btn action-btn-view" onClick={() => setSelectedQrEvent(item)} title="QR Code" disabled={!item.checkin_code && !item.uuid}>
                                        <i className="bi bi-qr-code"></i>
                                    </button>
                                    <button
                                        className="action-btn"
                                        style={item.certificates_closed ? { color: '#ef4444', background: '#fef2f2', borderColor: '#fecaca' } : { color: '#6b7280', background: '#f9fafb', borderColor: '#e5e7eb' }}
                                        onClick={() => setToggleClosedEvent(item)}
                                        title={item.certificates_closed ? 'Reabrir emissão' : 'Encerrar emissão'}
                                    >
                                        <i className={`bi ${item.certificates_closed ? 'bi-lock-fill' : 'bi-lock'}`}></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem 1.25rem', borderTop: '1px solid #f3f4f6' }}>
                        <nav aria-label="Page navigation" className="pagination-style-1">
                            <Pagination totalPages={totalPages} handlePageChange={p => setCurrentPage(p)} currentPage={currentPage} />
                        </nav>
                    </div>
                )}
            </div>

            {/* Toggle Closed Modal */}
            <Modal show={Boolean(toggleClosedEvent)} onHide={() => !isTogglingClosed && setToggleClosedEvent(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {toggleClosedEvent?.certificates_closed ? 'Reabrir emissão de certificados' : 'Encerrar emissão de certificados'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {toggleClosedEvent?.certificates_closed ? (
                        <p className="mb-0">
                            Deseja <strong>reabrir</strong> a emissão do evento{' '}
                            <strong>{toggleClosedEvent.title || `#${toggleClosedEvent.id}`}</strong>?
                            Participantes voltarão a conseguir gerar seus certificados.
                        </p>
                    ) : (
                        <p className="mb-0">
                            Deseja <strong>encerrar</strong> a emissão do evento{' '}
                            <strong>{toggleClosedEvent?.title || `#${toggleClosedEvent?.id}`}</strong>?
                            Nenhum participante conseguirá gerar novo certificado pelo link público.
                        </p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setToggleClosedEvent(null)} disabled={isTogglingClosed}>Cancelar</Button>
                    <Button
                        variant={toggleClosedEvent?.certificates_closed ? 'success' : 'danger'}
                        onClick={handleConfirmToggleClosed}
                        disabled={isTogglingClosed}
                    >
                        {isTogglingClosed ? 'Aguarde...' : toggleClosedEvent?.certificates_closed ? 'Sim, reabrir' : 'Sim, encerrar'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* QR Code Modal */}
            <Modal show={Boolean(selectedQrEvent)} onHide={() => { setSelectedQrEvent(null); setCopiedQrUuid(''); }} centered>
                <Modal.Header closeButton>
                    <Modal.Title>QR Code público do evento</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {(selectedQrEvent?.checkin_code || selectedQrEvent?.uuid) ? (
                        <>
                            {selectedQrEvent.checkin_code && (
                                <div className="mb-3">
                                    <small className="text-muted d-block mb-1">Código do evento</small>
                                    <span style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '0.5rem', color: '#2563eb', fontFamily: 'monospace' }}>
                                        {selectedQrEvent.checkin_code}
                                    </span>
                                    <div><small className="text-muted">Digite este código em <strong>/public/events/checkin</strong></small></div>
                                </div>
                            )}
                            <img
                                src={getQrCodeImageUrl(getPublicEventUrl(selectedQrEvent.checkin_code || selectedQrEvent.uuid))}
                                alt="QR Code do evento"
                                style={{ width: 260, height: 260, maxWidth: '100%' }}
                            />
                            <div className="mt-3">
                                <small className="text-muted d-block">Link público</small>
                                <a href={getPublicEventUrl(selectedQrEvent.checkin_code || selectedQrEvent.uuid)} target="_blank" rel="noreferrer" style={{ wordBreak: 'break-all', fontSize: '0.8rem' }}>
                                    {getPublicEventUrl(selectedQrEvent.checkin_code || selectedQrEvent.uuid)}
                                </a>
                            </div>
                        </>
                    ) : (
                        <div className="text-muted">Evento sem código público.</div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant={copiedQrUuid && copiedQrUuid === (selectedQrEvent?.checkin_code || selectedQrEvent?.uuid) ? 'success' : 'outline-primary'}
                        onClick={() => handleCopyPublicLink(selectedQrEvent?.checkin_code || selectedQrEvent?.uuid)}
                        disabled={!selectedQrEvent?.checkin_code && !selectedQrEvent?.uuid}
                    >
                        <i className={`bi ${copiedQrUuid ? 'bi-check2' : 'bi-clipboard'} me-1`}></i>
                        {copiedQrUuid ? 'Copiado!' : 'Copiar link'}
                    </Button>
                    <Button variant="secondary" onClick={() => setSelectedQrEvent(null)}>Fechar</Button>
                </Modal.Footer>
            </Modal>
        </Fragment>
    );
};

export default Items;
