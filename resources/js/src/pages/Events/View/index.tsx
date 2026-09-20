import React, { FC, Fragment, useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, Col, Modal, Row } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '@/src/lib/api';
import { formatDate } from '@/src/lib/helper';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

interface CoursePeriod {
    start_date: string;
    end_date: string;
}

interface EventData {
    id: number;
    uuid?: string;
    checkin_code?: string;
    title: string;

    number_of_hours?: number;
    periods?: CoursePeriod[];
    company_name?: string;
    city_name?: string;
    date_init_validate?: string;
    date_end_validate?: string;
    issue_date?: string;

    course?: { name: string };
    instructors?: { id: number; name: string }[];
    has_generated_certificates?: boolean;
}

const EventView: FC = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<EventData | null>(null);
    const [showQrModal, setShowQrModal] = useState(false);
    const [copiedPublicLink, setCopiedPublicLink] = useState(false);

    const getPublicEventUrl = (checkinCode?: string, uuid?: string) => {
        if (checkinCode) return `${window.location.origin}/public/events/code/${checkinCode}`;
        if (uuid) return `${window.location.origin}/public/events/${uuid}`;
        return '';
    };

    const getQrCodeImageUrl = (url: string) =>
        `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(url)}`;

    const handleCopyPublicLink = async () => {
        const url = getPublicEventUrl(event?.checkin_code, event?.uuid);
        if (!url) return;
        try {
            await navigator.clipboard.writeText(url);
            setCopiedPublicLink(true);
            setTimeout(() => setCopiedPublicLink(false), 2000);
            toast.success('Link público copiado!');
        } catch {
            toast.error('Não foi possível copiar o link.');
        }
    };

    const handleDelete = () => {
        Swal.fire({
            title: 'Excluir evento?',
            text: 'Esta ação não poderá ser desfeita.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc3545',
        }).then(result => {
            if (!result.isConfirmed) return;
            api.delete(`/events/${eventId}`)
                .then(() => {
                    Swal.fire({ icon: 'success', title: 'Evento excluído com sucesso', confirmButtonText: 'Ok' })
                        .then(() => navigate('/events'));
                })
                .catch(() => toast.error('Erro ao excluir evento.'));
        });
    };

    useEffect(() => {
        if (!eventId) {
            navigate('/events');
            return;
        }

        api.get(`/events/${eventId}`).then(response => {
            setEvent(response.data);
        }).catch(() => {
            navigate('/events');
        });
    }, [eventId]);

    if (!event) return null;

    return (
        <Fragment>
            <div className="modern-page-header">
                <div>
                    <Link to="/events" className="btn btn-sm btn-light mb-2" style={{ borderRadius: '8px', fontWeight: 500 }}>
                        <i className="bi bi-arrow-left"></i> Voltar para a Lista
                    </Link>
                    <h1 className="page-title">Visualização do Evento</h1>
                    <p className="page-subtitle">Detalhes do evento</p>
                </div>
                <div className="page-actions d-flex gap-2 flex-wrap">
                    <Button variant="danger" className="px-3" style={{ borderRadius: '8px' }} onClick={handleDelete}>
                        <i className="bi bi-trash"></i> Excluir
                    </Button>
                    <Link to={`/events/${event.id}`} className="btn-primary-custom px-4">
                        <i className="bi bi-pencil"></i> Editar Evento
                    </Link>
                </div>
            </div>

            <Row className="g-4 mb-4">
                <Col md={8}>
                    <div className="content-card h-100">
                        <div className="content-card-header">
                            <span className="content-card-title">Dados Básicos</span>
                        </div>
                        <div className="content-card-body">
                            <Row className="g-4 mb-4">
                                <Col md={3}>
                                    <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>ID</small>
                                    <div className="modern-table-name fw-medium" style={{ fontSize: '1.05rem' }}>#{event.id}</div>
                                </Col>
                                <Col md={9}>
                                    <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Título do Evento</small>
                                    <div className="modern-table-name fw-medium" style={{ fontSize: '1.05rem' }}>{event.title || '-'}</div>
                                </Col>
                                <Col md={6}>
                                    <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Curso Relacionado</small>
                                    <div className="modern-table-name fw-medium" style={{ fontSize: '1.05rem' }}>{event.course?.name || '-'}</div>
                                </Col>
                                <Col md={6}>
                                    <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Instrutores</small>
                                    <div className="modern-table-name fw-medium" style={{ fontSize: '1.05rem' }}>
                                        {event.instructors?.length ? event.instructors.map(i => i.name).join(', ') : '-'}
                                    </div>
                                </Col>
                            </Row>

                            <hr className="my-4 border-secondary opacity-25" />

                            <Row className="g-4">
                                <Col md={12}>
                                    <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Períodos Cursados</small>
                                    {event.periods && event.periods.length > 0 ? (
                                        <div className="d-flex flex-column gap-1">
                                            {event.periods.map((p, i) => (
                                                <div key={i} className="modern-table-name fw-medium" style={{ fontSize: '1.05rem' }}>
                                                    <i className="bi bi-calendar-event me-2 text-primary opacity-75"></i>
                                                    {formatDate(p.start_date)} <span className="text-muted mx-1">—</span> {formatDate(p.end_date)}
                                                </div>
                                            ))}
                                        </div>
                                    ) : <div className="modern-table-name fw-medium">-</div>}
                                </Col>
                                <Col md={3}>
                                    <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Carga Horária</small>
                                    <div className="modern-table-name fw-medium" style={{ fontSize: '1.05rem' }}>{event.number_of_hours != null ? `${event.number_of_hours} Horas` : '-'}</div>
                                </Col>
                                <Col md={3}>
                                    <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Data de Emissão</small>
                                    <div className="modern-table-name fw-medium" style={{ fontSize: '1.05rem' }}>{event.issue_date ? formatDate(event.issue_date) : '-'}</div>
                                </Col>
                                <Col md={6}>
                                    <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Validade do Certificado</small>
                                    <div className="modern-table-name fw-medium" style={{ fontSize: '1.05rem' }}>
                                        {event.date_init_validate ? formatDate(event.date_init_validate) : '-'} <span className="text-muted mx-1">—</span> {event.date_end_validate ? formatDate(event.date_end_validate) : '-'}
                                    </div>
                                </Col>
                                {event.company_name && (
                                    <Col md={6}>
                                        <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Empresa</small>
                                        <div className="modern-table-name fw-medium" style={{ fontSize: '1.05rem' }}>{event.company_name}</div>
                                    </Col>
                                )}
                                {event.city_name && (
                                    <Col md={6}>
                                        <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Cidade Cursada</small>
                                        <div className="modern-table-name fw-medium" style={{ fontSize: '1.05rem' }}>{event.city_name}</div>
                                    </Col>
                                )}
                            </Row>
                        </div>
                    </div>
                </Col>

                <Col md={4}>
                    <div className="content-card h-100">
                        <div className="content-card-header">
                            <span className="content-card-title">Ações do Evento</span>
                        </div>
                        <div className="content-card-body d-flex flex-column gap-3">
                            {event.has_generated_certificates && (
                                <Link to={`/documents?event_id=${event.id}`} className="doc-btn justify-content-center" style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                                    <i className="bi bi-award fs-5"></i>
                                    Ver Certificados Gerados
                                </Link>
                            )}
                            <button className="doc-btn justify-content-center" onClick={() => setShowQrModal(true)} disabled={!event.checkin_code && !event.uuid} style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                                <i className="bi bi-qr-code-scan fs-5"></i>
                                {event.checkin_code ? 'QR Code do Check-in' : 'QR Code Indisponível'}
                            </button>

                            <hr className="my-2 border-secondary opacity-25" />

                            <div>
                                <small className="modern-table-date d-block mb-2" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Link Público do Evento</small>
                                {(event.checkin_code || event.uuid) ? (
                                    <div className="d-flex flex-column gap-2">
                                        <div className="modern-copy-box">
                                            {getPublicEventUrl(event.checkin_code, event.uuid)}
                                        </div>
                                        <button className="modern-copy-btn" onClick={handleCopyPublicLink}>
                                            <i className="bi bi-clipboard me-1"></i> Copiar Link
                                        </button>
                                    </div>
                                ) : (
                                    <div className="modern-table-name fw-medium">-</div>
                                )}
                            </div>


                                
                                {event.checkin_code && (
                                    <div className="mt-4 text-center">
                                        <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Código (PIN)</small>
                                        <span style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '0.5rem', color: '#2563eb', fontFamily: 'monospace' }}>
                                            {event.checkin_code}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                </Col>
            </Row>



            <Modal show={showQrModal} onHide={() => { setShowQrModal(false); setCopiedPublicLink(false); }} centered>
                <Modal.Header closeButton>
                    <Modal.Title>QR Code público do evento</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {(event.checkin_code || event.uuid) ? (
                        <>
                            {event.checkin_code && (
                                <div className="mb-3">
                                    <small className="text-muted d-block mb-1">Código do evento</small>
                                    <span style={{
                                        fontSize: '2.2rem', fontWeight: 900, letterSpacing: '0.5rem',
                                        color: '#2563eb', fontFamily: 'monospace',
                                    }}>
                                        {event.checkin_code}
                                    </span>
                                    <div>
                                        <small className="text-muted">Digite em <strong>/public/events/checkin</strong> para acessar</small>
                                    </div>
                                </div>
                            )}
                            <img
                                src={getQrCodeImageUrl(getPublicEventUrl(event.checkin_code, event.uuid))}
                                alt="QR Code do evento"
                                style={{ width: 260, height: 260, maxWidth: '100%' }}
                            />
                            <div className="mt-3">
                                <small className="text-muted d-block">Link público</small>
                                <a href={getPublicEventUrl(event.checkin_code, event.uuid)} target="_blank" rel="noreferrer" style={{ wordBreak: 'break-all' }}>
                                    {getPublicEventUrl(event.checkin_code, event.uuid)}
                                </a>
                            </div>
                        </>
                    ) : (
                        <div className="text-muted">Evento sem código público.</div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant={copiedPublicLink ? 'success' : 'outline-primary'}
                        onClick={handleCopyPublicLink}
                        disabled={!event.checkin_code && !event.uuid}
                    >
                        <i className={`bi ${copiedPublicLink ? 'bi-check2' : 'bi-clipboard'} me-1`}></i>
                        {copiedPublicLink ? 'Copiado!' : 'Copiar link'}
                    </Button>
                    <Button variant="secondary" onClick={() => setShowQrModal(false)}>Fechar</Button>
                </Modal.Footer>
            </Modal>
        </Fragment>
    );
};

export default EventView;
