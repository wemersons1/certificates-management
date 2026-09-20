import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Badge, Button, Card, CardBody, Col, Container, Form, Offcanvas, Row, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/src/lib/api';
import { formatDate } from '@/src/lib/helper';
import { toast } from 'react-toastify';

interface CoursePeriod {
  start_date: string;
  end_date: string;
}

interface PublicEventData {
  id: number;
  uuid?: string;
  title: string;

  certificates_closed?: boolean;
  number_of_hours?: number;
  periods?: CoursePeriod[];
  issue_date?: string;
  course?: { name: string };
  instructors?: { id: number; name: string }[];
}

const PublicEventWelcome: FC = () => {
  const { uuid, token, code } = useParams();
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState('');
  const [event, setEvent] = useState<PublicEventData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [alreadyUsed, setAlreadyUsed] = useState(false);
  const [alreadyUsedMessage, setAlreadyUsedMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [usedEmail, setUsedEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [documentUuid, setDocumentUuid] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [issuingUniqueLink, setIssuingUniqueLink] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const siteName = import.meta.env.VITE_SITE_NAME || import.meta.env.VITE_APP_NAME || 'Flash Certificados';
  const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

  const getDocumentUuidFromDownloadUrl = (url?: string) => {
    if (!url) return '';
    const match = url.match(/\/public\/documents\/([^/]+)\/download/i);
    return match?.[1] || '';
  };

  const certificatePublicLink = (() => {
    const uuidFromDownload = getDocumentUuidFromDownloadUrl(downloadUrl);
    const finalUuid = documentUuid || uuidFromDownload;
    return finalUuid ? `${siteUrl}/document-validate/${finalUuid}` : '';
  })();

  const firstInstructor = event?.instructors?.[0]?.name || '';

  const whatsappShareText = `Finalizei meu curso de ${event?.course?.name || 'capacitação'}${firstInstructor ? `, ministrado por ${firstInstructor}` : ''}, com certificado emitido pela ${siteName}. Confira: ${certificatePublicLink || siteUrl}`;

  const handleShareLinkedIn = () => {
    if (!certificatePublicLink) {
      toast.info('O link público do certificado ainda não está disponível para compartilhamento.');
      return;
    }
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificatePublicLink)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(whatsappShareText)}`, '_blank', 'noopener,noreferrer');
  };

  const instructorsLabel = useMemo(() => {
    if (!event?.instructors?.length) return '-';
    return event.instructors.map(i => i.name).join(', ');
  }, [event]);

  const renderPeriod = () => {
    if (!event) return '-';
    if (event.periods && event.periods.length > 0) {
      return event.periods.map(p => `${formatDate(p.start_date)} a ${formatDate(p.end_date)}`).join(' | ');
    }
    if (event.issue_date) return formatDate(event.issue_date);
    return '-';
  };



  const renderHeader = () => (
    <>
      <nav className="landing-navbar" style={{
        background: '#fff', width: '100%', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 0 #e7eefa', display: 'flex', justifyContent: 'center',
      }}>
        <div className="navbar-inner" style={{
          width: '100%', maxWidth: 1350, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '1rem 1.5rem',
        }}>
          <a href="/" className="logo-group text-decoration-none" style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 900,
            fontSize: '1.43rem', color: '#2563eb', letterSpacing: '-1.2px',
          }}>
            <img src="/assets/images/logo-flash.png" width="50" alt="Flash Certificados" />
            Flash Certificados
          </a>

          <div className="nav-items d-none d-lg-flex" style={{ alignItems: 'center', gap: '2rem' }}>
            <a className="nav-link text-decoration-none" href="/#recursos" style={{ color: '#2563eb', fontWeight: 600 }}>Recursos</a>
            <a className="nav-link text-decoration-none" href="/#precos" style={{ color: '#2563eb', fontWeight: 600 }}>Preços</a>
            <a className="nav-link text-decoration-none" href="/sobre" style={{ color: '#2563eb', fontWeight: 600 }}>Sobre</a>
            <a className="nav-link text-decoration-none" href="/blog" style={{ color: '#2563eb', fontWeight: 600 }}>Blog</a>
            <a className="nav-link text-decoration-none d-flex align-items-center gap-1" href="/public/events/checkin" style={{ color: '#2563eb', fontWeight: 700 }}>
              <i className="bi bi-qr-code-scan"></i> Check-in
            </a>
            <a className="btn-outline text-decoration-none" href="/?signin=true" style={{
              background: '#fff', color: '#2563eb', border: '2.5px solid #d2e6ff',
              borderRadius: 10, padding: '0.68rem 1.8rem', fontSize: '1.05rem', fontWeight: 800,
            }}>Entrar</a>
            <a className="btn-cta text-decoration-none" href="/" style={{
              background: 'linear-gradient(110deg, #2563eb 0%, #4f8cff 100%)', color: '#fff',
              border: 'none', borderRadius: 10, padding: '0.68rem 1.8rem', fontSize: '1.05rem',
              fontWeight: 800, boxShadow: '0 2px 12px 0 rgba(37,99,235,0.13)',
            }}>Teste Grátis</a>
          </div>

          <button
            className="btn btn-link d-lg-none"
            type="button"
            onClick={() => setShowMobileNav(true)}
            aria-label="Abrir menu"
            style={{ color: '#2563eb', textDecoration: 'none' }}
          >
            <i className="bi bi-list" style={{ fontSize: 30 }}></i>
          </button>
        </div>
      </nav>

      <Offcanvas show={showMobileNav} onHide={() => setShowMobileNav(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="d-flex align-items-center gap-2" style={{ color: '#2563eb', fontWeight: 900 }}>
            <img src="/assets/images/logo-flash.png" width="36" alt="Flash Certificados" />
            Flash Certificados
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column">
          <a className="nav-link mb-3 text-decoration-none" href="/#recursos" onClick={() => setShowMobileNav(false)}>Recursos</a>
          <a className="nav-link mb-3 text-decoration-none" href="/#precos" onClick={() => setShowMobileNav(false)}>Preços</a>
          <a className="nav-link mb-3 text-decoration-none" href="/sobre" onClick={() => setShowMobileNav(false)}>Sobre</a>
          <a className="nav-link mb-3 text-decoration-none" href="/blog" onClick={() => setShowMobileNav(false)}>Blog</a>
          <a className="nav-link mb-3 text-decoration-none d-flex align-items-center gap-2" href="/public/events/checkin" onClick={() => setShowMobileNav(false)} style={{ color: '#2563eb', fontWeight: 700 }}>
            <i className="bi bi-qr-code-scan"></i> Check-in de evento
          </a>
          <a className="btn-outline mb-3 text-decoration-none text-center" href="/?signin=true" onClick={() => setShowMobileNav(false)} style={{
            background: '#fff', color: '#2563eb', border: '2.5px solid #d2e6ff',
            borderRadius: 10, padding: '0.68rem 1.8rem', fontSize: '1.05rem', fontWeight: 800,
          }}>Entrar</a>
          <a className="btn-cta mt-auto text-decoration-none text-center" href="/" onClick={() => setShowMobileNav(false)} style={{
            background: 'linear-gradient(110deg, #2563eb 0%, #4f8cff 100%)', color: '#fff',
            border: 'none', borderRadius: 10, padding: '0.68rem 1.8rem', fontSize: '1.05rem',
            fontWeight: 800, boxShadow: '0 2px 12px 0 rgba(37,99,235,0.13)',
          }}>Teste Grátis</a>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );

  useEffect(() => {
    if (code) {
      setIssuingUniqueLink(true);
      api
        .get(`/public/events/code/${code}/issue-checkin-link`)
        .then((response) => {
          const redirectUrl = response.data?.redirect_url;
          if (redirectUrl) {
            window.location.replace(redirectUrl);
            return;
          }
          setNotFound(true);
        })
        .catch(() => setNotFound(true))
        .finally(() => setIssuingUniqueLink(false));
      return;
    }

    if (uuid && !token) {
      setIssuingUniqueLink(true);
      api
        .get(`/public/events/${uuid}/issue-checkin-link`)
        .then((response) => {
          const redirectUrl = response.data?.redirect_url;
          if (redirectUrl) {
            window.location.replace(redirectUrl);
            return;
          }
          setNotFound(true);
        })
        .catch(() => setNotFound(true))
        .finally(() => setIssuingUniqueLink(false));
      return;
    }

    if (!token) {
      return;
    }

    api
      .get(`/public/events/checkin/${token}`)
      .then((response) => {
        setNotFound(false);
        setEvent(response.data?.event || null);
        setAlreadyUsed(!!response.data?.already_used);
        setAlreadyUsedMessage(response.data?.message || '');
        setUsedEmail(response.data?.used_by_email || '');
        setDocumentUuid(response.data?.document_uuid || '');
        setDownloadUrl(response.data?.download_url || '');
        if (response.data?.already_used) {
          setSuccessMessage('Este check-in já foi realizado anteriormente.');
        }
      })
      .catch(() => setNotFound(true));
  }, [uuid, token, code]);

  const handleSubmitCheckin = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();
    if (!token) return;



    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      if (email.trim()) formData.append('email', email.trim());

      const response = await api.post(`/public/events/checkin/${token}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccessMessage(response.data?.message || 'Check-in realizado com sucesso!');
      setDocumentUuid(response.data?.document_uuid || '');
      setDownloadUrl(response.data?.download_url || '');
      setUsedEmail(response.data?.used_by_email || email || '');
      setAlreadyUsed(true);
      toast.success('Check-in realizado com sucesso!');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Não foi possível concluir seu check-in agora. Tente novamente em instantes.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCertificate = async () => {
    if (!token) return;
    setIsResending(true);
    try {
      const response = await api.post(`/public/events/checkin/${token}/resend-certificate`);
      toast.success(response.data?.message || 'Certificado reenviado com sucesso!');
      setUsedEmail(response.data?.used_by_email || usedEmail);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Não foi possível reenviar o certificado agora.');
    } finally {
      setIsResending(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!downloadUrl) return;
    setIsDownloading(true);
    try {
      const response = await api.get(downloadUrl, { responseType: 'blob' });
      const contentDisposition = response.headers?.['content-disposition'] || '';
      const fileNameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
      const fileName = fileNameMatch?.[1] || 'CERTIFICADO.pdf';

      const blobUrl = URL.createObjectURL(response.data);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error('Não foi possível baixar o certificado agora.');
    } finally {
      setIsDownloading(false);
    }
  };

  const sectionStyle = {
    background: 'linear-gradient(120deg, #eaf1fb 0 70%, #f7fafd 100%)',
    minHeight: '100vh',
    padding: '4rem 1rem',
    display: 'flex',
    alignItems: 'center',
  };

  if (!uuid && !token && !code) {
    const handleCodeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = manualCode.trim().toUpperCase();
      if (trimmed.length !== 4) {
        toast.error('Digite um código válido de 4 caracteres.');
        return;
      }
      navigate(`/public/events/code/${trimmed}`);
    };

    return (
      <>
        {renderHeader()}
        <section style={sectionStyle}>
          <Container>
            <Row className="justify-content-center">
              <Col md={6} lg={5}>
                <Card className="border-0 shadow" style={{ borderRadius: 20 }}>
                  <CardBody className="p-4 p-md-5 text-center">
                    <i className="bi bi-qr-code-scan" style={{ fontSize: 48, color: '#2563eb' }}></i>
                    <h3 className="mb-2 mt-3" style={{ color: '#18306b', fontWeight: 800 }}>Fazer check-in</h3>
                    <p className="text-muted mb-4">Digite o código de 4 caracteres do evento para acessar seu check-in.</p>
                    <Form onSubmit={handleCodeSubmit}>
                      <Form.Control
                        className="text-center fw-bold mb-3"
                        style={{ fontSize: '2rem', letterSpacing: '0.5rem', textTransform: 'uppercase' }}
                        maxLength={4}
                        value={manualCode}
                        onChange={e => setManualCode(e.target.value.toUpperCase())}
                        placeholder="XXXX"
                        autoFocus
                      />
                      <Button type="submit" variant="primary" className="w-100" size="lg">
                        <i className="bi bi-arrow-right-circle me-2"></i>
                        Acessar evento
                      </Button>
                    </Form>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>
      </>
    );
  }

  if (notFound) {
    return (
      <>
        {renderHeader()}
        <section style={sectionStyle}>
          <Container>
            <Card className="border-0 shadow" style={{ borderRadius: 20 }}>
              <CardBody className="p-4 p-md-5 text-center">
                <h3 className="mb-2">Evento não encontrado</h3>
                <p className="text-muted mb-0">O link informado é inválido ou este evento não está mais disponível.</p>
              </CardBody>
            </Card>
          </Container>
        </section>
      </>
    );
  }

  if (issuingUniqueLink) {
    return (
      <>
        {renderHeader()}
        <section style={sectionStyle}>
          <Container className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-3 mb-0">Preparando seu link único de check-in...</p>
          </Container>
        </section>
      </>
    );
  }

  if (!event) {
    return (
      <>
        {renderHeader()}
        <section style={sectionStyle}>
          <Container className="text-center">
            <Spinner animation="border" variant="primary" />
          </Container>
        </section>
      </>
    );
  }

  return (
    <>
      {renderHeader()}
      <section style={{ background: 'linear-gradient(120deg, #eaf1fb 0 70%, #f7fafd 100%)', minHeight: '100vh', padding: '3rem 1rem' }}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={10} xl={9}>
              <Card className="border-0 shadow" style={{ borderRadius: 20 }}>
                <CardBody className="p-4 p-md-5">
                  <div className="text-center mb-4">
                    <h2 className="mb-2" style={{ color: '#18306b', fontWeight: 800 }}>Check-in do evento</h2>
                    <p className="text-muted mb-0">Confirme sua presença e acesse seu certificado com segurança.</p>
                  </div>

                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <small className="text-muted d-block">Evento</small>
                      <div className="fw-semibold fs-5">{event.title || '-'}</div>
                    </Col>
                    <Col md={6}>
                      <small className="text-muted d-block">Curso</small>
                      <div className="fw-semibold">{event.course?.name || '-'}</div>
                    </Col>
                    <Col md={6}>
                      <small className="text-muted d-block">Instrutor(es)</small>
                      <div className="fw-semibold">{instructorsLabel}</div>
                    </Col>
                    <Col md={3}>
                      <small className="text-muted d-block">Período</small>
                      <div className="fw-semibold">{renderPeriod()}</div>
                    </Col>
                    {event.number_of_hours != null && (
                      <Col md={3}>
                        <small className="text-muted d-block">Carga horária</small>
                        <div className="fw-semibold">{event.number_of_hours}h</div>
                      </Col>
                    )}
                    <Col md={12}>
                      <div className="d-flex flex-wrap gap-2">

                      </div>
                    </Col>
                  </Row>

                  <div className="p-3 rounded border bg-light mb-4">
                    <small className="text-muted d-block">
                      Após o check-in, seu certificado será gerado e enviado para o e-mail informado (se fornecido).
                    </small>
                  </div>

                  {event.certificates_closed ? (
                    <Alert variant="warning" className="mb-0">
                      <strong>Emissão encerrada.</strong> O organizador encerrou a emissão de certificados para este evento.
                      Entre em contato com o organizador para mais informações.
                    </Alert>
                  ) : successMessage ? (
                    <>
                      <Alert variant="success" className="mb-3">
                        <strong>Tudo certo!</strong> {successMessage}
                      </Alert>
                      {alreadyUsedMessage && (
                        <Alert variant="info" className="mb-3">{alreadyUsedMessage}</Alert>
                      )}
                      <div className="d-flex flex-wrap gap-2">
                        {downloadUrl && (
                          <Button type="button" onClick={handleDownloadCertificate} variant="primary" disabled={isDownloading}>
                            {isDownloading ? (
                              <><Spinner size="sm" animation="border" className="me-2" />Baixando...</>
                            ) : (
                              <><i className="bi bi-download me-1"></i>Baixar certificado</>
                            )}
                          </Button>
                        )}
                        {downloadUrl && (
                          <Button type="button" onClick={handleShareLinkedIn} variant="outline-info">
                            <i className="bi bi-linkedin me-1"></i>
                            Compartilhar no LinkedIn
                          </Button>
                        )}
                        {downloadUrl && (
                          <Button type="button" onClick={handleShareWhatsApp} variant="outline-success">
                            <i className="bi bi-whatsapp me-1"></i>
                            Compartilhar no WhatsApp
                          </Button>
                        )}
                        {usedEmail && (
                          <Button type="button" onClick={handleResendCertificate} variant="outline-primary" disabled={isResending}>
                            {isResending ? (
                              <><Spinner size="sm" animation="border" className="me-2" />Reenviando...</>
                            ) : (
                              <><i className="bi bi-envelope me-1"></i>Reenviar certificado por e-mail</>
                            )}
                          </Button>
                        )}
                      </div>
                      {usedEmail && <small className="text-muted d-block mt-2">E-mail: {usedEmail}</small>}
                    </>
                  ) : (
                    <Form onSubmit={handleSubmitCheckin}>
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Label>Seu nome *</Form.Label>
                          <Form.Control
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Digite seu nome completo"
                            required
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Label>Seu e-mail (opcional)</Form.Label>
                          <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Digite seu melhor e-mail"
                          />
                        </Col>



                        <Col md={12}>
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <><Spinner size="sm" animation="border" className="me-2" />Confirmando...</>
                            ) : (
                              <><i className="bi bi-check2-circle me-1"></i>Fazer check-in</>
                            )}
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default PublicEventWelcome;
