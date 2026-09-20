import { FC, Fragment, useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardBody, Col, Row, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import api from '@/src/lib/api';
import { addMaskCpf, formatDate } from '@/src/lib/helper';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import If from '@/src/components/common/if/if';
import AppContext from '@/src/AppContext/Context';
import { MdOutlineLocalPrintshop } from "react-icons/md";
import { MdOutlineCloudDownload } from "react-icons/md";

const DocumentView: FC = () => {
  const { documentId } = useParams();
  const [item, setItem] = useState<any>(null);
  const [isProcessingDocument, setIsProcessingDocument] = useState(false);
  const [isProcessingPrint, setIsProcessingPrint] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { checkRole, hasPermission } = useContext(AppContext);
  const navigate = useNavigate();

  const reduxTheme = useSelector((state: any) => state);
  const isDark = reduxTheme?.dataThemeMode === 'dark';

  useEffect(() => {
    api.get(`/documents/${documentId}`)
      .then(({ data }) => setItem(data))
      .catch(() => toast.error('Erro ao carregar documento'));
  }, [documentId]);

  const isDeletable = (createdAtString: string): boolean => {
    if (!createdAtString) return true;
    const createdAt = new Date(createdAtString);
    const now = new Date();
    const diffInMs = now.getTime() - createdAt.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    return diffInHours < 24;
  };

  const handleDelete = () => {
    Swal.fire({
      title: 'Excluir documento?',
      text: 'Ao excluir, o certificado será invalidado permanentemente. Essa ação não poderá ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        api.delete(`/documents/${documentId}`)
          .then(() => {
            toast.success('Documento excluído com sucesso!');
            window.dispatchEvent(new CustomEvent('credits-updated'));
            navigate('/documents');
          })
          .catch(() => toast.error('Erro ao excluir documento'));
      }
    });
  };

  const handlePrintMountedTemplate = (html: string, docName?: string) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      if (docName) {
        doc.title = docName;
      }

      iframe.onload = () => {
        setTimeout(() => {
          const originalTitle = window.document.title;
          if (docName) {
            window.document.title = docName;
          }
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();

          setTimeout(() => {
            if (docName) {
              window.document.title = originalTitle;
            }
            document.body.removeChild(iframe);
            setIsProcessingPrint(false);
          }, 1000);
        }, 300);
      };
    } else {
      setIsProcessingPrint(false);
    }
  };

  const getDocumentView = async (document: string) => {
    setIsProcessingPrint(true);
    const params = { document };
    const dynamicField = `${document}_template_mounted`;

    try {
      const response = await api.get(`/documents/html/${item.id}`, { params });
      
      const docName = `CERTIFICADO_${item?.employee?.name || item?.employee?.name}_${item?.course?.name}${item?.date_init_validate ? `_${item.date_init_validate}` : ''}${item?.date_end_validate ? `_ATÉ_${item.date_end_validate}` : ''}`
        .toUpperCase()
        .split(' ')
        .join('_');
        
      handlePrintMountedTemplate(response?.data?.[dynamicField], docName);
    } catch (error) {
      toast.error('Erro ao carregar o documento para visualização.');
      setIsProcessingPrint(false);
    }
  };

  const getDocumentDownloadFile = async (document: string) => {
    setIsProcessingDocument(true);
    const params = { document };

    try {
      const response = await api.get(`/documents/download/${item.id}`, {
        params,
        responseType: 'blob',
      });

      const nameDocument = `CERTIFICADO_${item?.employee.name}_${item.course.name}${item?.date_init_validate ? `_${item.date_init_validate}` : ''}${item?.date_end_validate ? `_ATÉ_${item.date_end_validate}` : ''}`
        .toUpperCase()
        .split(' ')
        .join('_');

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );
      const link = window.document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        nameDocument + ".pdf"
      );
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download iniciado com sucesso.');

    } catch (error) {
      toast.error("Erro ao baixar o documento.");
    } finally {
      setIsProcessingDocument(false);
    }
  };

  const handleSendEmailClick = () => {
    const defaultEmail = item?.employee?.email || '';
    
    let htmlContent = `
      <div class="text-start fs-14">
        <label class="form-label fw-semibold text-dark">E-mail do Aluno:</label>
        <input type="email" id="swal-email" class="form-control mb-3" value="${defaultEmail}" placeholder="exemplo@email.com" style="border-radius: 8px; padding: 10px;">
        
        <label class="form-label fw-semibold text-dark mb-2">Selecione os documentos a enviar:</label>
        <div class="form-check mb-2">
          <input class="form-check-input" type="checkbox" id="swal-send-cert" checked>
          <label class="form-check-label text-dark" for="swal-send-cert">
            Certificado
          </label>
        </div>
    `;

    if (item.presence_list_template_mounted) {
      htmlContent += `
        <div class="form-check mb-2">
          <input class="form-check-input" type="checkbox" id="swal-send-presence" checked>
          <label class="form-check-label text-dark" for="swal-send-presence">
            Lista de Presença
          </label>
        </div>
      `;
    } else {
      htmlContent += `<input type="hidden" id="swal-send-presence" value="false">`;
    }

    if (item.authorization_template_mounted || item.authorization_template_version_id) {
      htmlContent += `
        <div class="form-check mb-2">
          <input class="form-check-input" type="checkbox" id="swal-send-auth" checked>
          <label class="form-check-label text-dark" for="swal-send-auth">
            Anuência / Autorização
          </label>
        </div>
      `;
    } else {
      htmlContent += `<input type="hidden" id="swal-send-auth" value="false">`;
    }

    htmlContent += `</div>`;

    Swal.fire({
      title: 'Enviar por E-mail',
      html: htmlContent,
      icon: 'envelope',
      showCancelButton: true,
      confirmButtonText: 'Enviar E-mail',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6c757d',
      preConfirm: () => {
        const emailInput = document.getElementById('swal-email') as HTMLInputElement;
        const email = emailInput ? emailInput.value : '';
        const sendCertEl = document.getElementById('swal-send-cert') as HTMLInputElement;
        const sendPresenceEl = document.getElementById('swal-send-presence') as HTMLInputElement;
        const sendAuthEl = document.getElementById('swal-send-auth') as HTMLInputElement;

        const sendCertificate = sendCertEl ? sendCertEl.checked : true;
        const sendPresence = sendPresenceEl ? (sendPresenceEl.type === 'hidden' ? false : sendPresenceEl.checked) : false;
        const sendAuthorization = sendAuthEl ? (sendAuthEl.type === 'hidden' ? false : sendAuthEl.checked) : false;

        if (!email) {
          Swal.showValidationMessage('O e-mail é obrigatório para envio.');
          return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          Swal.showValidationMessage('Insira um e-mail válido.');
          return false;
        }

        return { email, sendCertificate, sendPresence, sendAuthorization };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        setIsSendingEmail(true);
        api.post('/documents/send-email', {
          document_id: item.id,
          email: result.value.email,
          send_certificate: result.value.sendCertificate,
          send_presence_list: result.value.sendPresence,
          send_authorization: result.value.sendAuthorization
        })
          .then((res: any) => {
            Swal.fire({
              title: 'Sucesso!',
              text: res.data.message || 'E-mail enviado com sucesso.',
              icon: 'success',
              confirmButtonColor: '#10b981'
            });
          })
          .catch(() => {
            toast.error('Erro ao enviar e-mail.');
          })
          .finally(() => {
            setIsSendingEmail(false);
          });
      }
    });
  };

  if (!item) return null;

  const renderProcessingSpinner = () => (
    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
  );

  return (
    <Fragment>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .premium-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.25s ease;
          text-decoration: none;
          white-space: nowrap;
        }
        .premium-action-btn i, .premium-action-btn svg {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          vertical-align: middle !important;
          line-height: 1 !important;
          height: 1em !important;
          width: 1em !important;
          flex-shrink: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          position: relative !important;
          top: 1px !important;
        }
        .premium-action-btn-delete {
          background: rgba(239, 68, 68, 0.08);
          color: #dc2626;
          border-color: rgba(239, 68, 68, 0.2);
        }
        .premium-action-btn-delete:hover {
          background: rgba(239, 68, 68, 0.16);
          color: #b91c1c;
          border-color: rgba(239, 68, 68, 0.3);
          transform: translateY(-1.5px);
        }
        .premium-action-btn-edit {
          background: rgba(26, 86, 219, 0.08);
          color: #2563eb;
          border-color: rgba(26, 86, 219, 0.2);
        }
        .premium-action-btn-edit:hover {
          background: rgba(26, 86, 219, 0.16);
          color: #1d4ed8;
          border-color: rgba(26, 86, 219, 0.3);
          transform: translateY(-1.5px);
        }
        .premium-action-btn-success {
          background: rgba(16, 185, 129, 0.08);
          color: #10b981;
          border-color: rgba(16, 185, 129, 0.2);
        }
        .premium-action-btn-success:hover {
          background: rgba(16, 185, 129, 0.16);
          color: #059669;
          border-color: rgba(16, 185, 129, 0.3);
          transform: translateY(-1.5px);
        }

        /* Dark mode modifications */
        .dark-theme-mode .premium-action-btn-delete {
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.25);
        }
        .dark-theme-mode .premium-action-btn-delete:hover {
          color: #ffffff;
          background: rgba(239, 68, 68, 0.2);
        }
        .dark-theme-mode .premium-action-btn-edit {
          color: #60a5fa;
          border-color: rgba(59, 130, 246, 0.25);
        }
        .dark-theme-mode .premium-action-btn-edit:hover {
          color: #ffffff;
          background: rgba(59, 130, 246, 0.2);
        }
        .dark-theme-mode .premium-action-btn-success {
          color: #34d399;
          border-color: rgba(16, 185, 129, 0.25);
        }
        .dark-theme-mode .premium-action-btn-success:hover {
          color: #ffffff;
          background: rgba(16, 185, 129, 0.2);
        }
        .premium-action-btn:disabled, .premium-action-btn-delete:disabled {
          opacity: 0.45 !important;
          background: rgba(100, 116, 139, 0.08) !important;
          color: #94a3b8 !important;
          border-color: rgba(100, 116, 139, 0.15) !important;
          cursor: not-allowed !important;
          transform: none !important;
        }
        .dark-theme-mode .premium-action-btn:disabled, .dark-theme-mode .premium-action-btn-delete:disabled {
          background: rgba(255, 255, 255, 0.04) !important;
          color: rgba(255, 255, 255, 0.25) !important;
          border-color: rgba(255, 255, 255, 0.04) !important;
        }
      `}</style>

      <div 
        className={isDark ? 'dark-theme-mode' : ''}
        style={{
          background: isDark
            ? 'radial-gradient(circle at 10% 20%, #1e1b4b 0%, #090514 100%)'
            : 'radial-gradient(circle at 10% 20%, #f8fafc 0%, #e2e8f0 100%)',
          minHeight: '100vh',
          borderRadius: '24px',
          padding: '32px',
          color: isDark ? '#f8fafc' : '#0f172a',
          fontFamily: "'Inter', sans-serif",
          border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            : '0 25px 50px -12px rgba(15, 23, 42, 0.08)',
          animation: 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* HEADER */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div>
            <Link 
              to="/documents" 
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
                borderRadius: '12px',
                color: isDark ? '#94a3b8' : '#475569',
                fontWeight: 600,
                fontSize: '13px',
                padding: '8px 16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
                marginBottom: '16px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
                e.currentTarget.style.color = isDark ? '#ffffff' : '#0f172a';
                e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.transform = 'translateX(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
                e.currentTarget.style.color = isDark ? '#94a3b8' : '#475569';
                e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <i className="bi bi-arrow-left"></i> Voltar para a Lista
            </Link>
            <h1 style={{
              color: isDark ? '#ffffff' : '#0f172a',
              fontWeight: 800,
              fontSize: '28px',
              letterSpacing: '-0.75px',
              marginBottom: '6px'
            }}>
              Detalhes do Certificado
            </h1>
            <p style={{
              color: isDark ? '#94a3b8' : '#475569',
              fontSize: '14.5px',
              margin: 0
            }}>
              Informações detalhadas e acesso aos documentos emitidos
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <If condition={checkRole('Entity') && hasPermission('Excluir')}>
              {(() => {
                const deletable = isDeletable(item?.created_at);
                return (
                  <button 
                    onClick={handleDelete}
                    disabled={!deletable}
                    className="premium-action-btn premium-action-btn-delete"
                    title={deletable ? "Excluir Certificado" : "Não pode ser deletado por ter passado 24h"}
                  >
                    <i className="bi bi-trash"></i> Excluir Certificado
                  </button>
                );
              })()}
            </If>
          </div>
        </div>

        {/* BATCH NOTICE BANNER */}
        {item?.presence_list && (
          <div 
            style={{
              background: isDark
                ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)'
                : 'linear-gradient(90deg, rgba(99, 102, 241, 0.05) 0%, rgba(59, 130, 246, 0.03) 100%)',
              border: isDark ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(99, 102, 241, 0.1)',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.03)',
              borderRadius: '16px',
              padding: '20px',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '32px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div 
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)',
                  border: isDark ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(99, 102, 241, 0.15)',
                  color: isDark ? '#818cf8' : '#4f46e5',
                  boxShadow: isDark ? '0 0 15px rgba(99, 102, 241, 0.2)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  flexShrink: 0
                }}
              >
                <i className="bi bi-collection"></i>
              </div>
              <div>
                <strong style={{ color: isDark ? '#e2e8f0' : '#1e293b', display: 'block', fontSize: '15px', fontWeight: 700 }}>
                  Este certificado faz parte de um lote gerado em grupo
                </strong>
                <span style={{ color: isDark ? '#94a3b8' : '#475569', fontSize: '13.5px', fontWeight: 500 }}>
                  Você pode visualizar e gerenciar todos os certificados gerados juntos nesta lista de presença.
                </span>
              </div>
            </div>
            <Link 
              to={`/documents?presence_list_uuid=${item.presence_list.uuid}`} 
              style={{ 
                borderRadius: '12px', 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', 
                border: 'none',
                color: '#ffffff',
                boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                fontSize: '13.5px',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(79, 70, 229, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(79, 70, 229, 0.4)';
              }}
            >
              Visualizar Lote Completo <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        )}

        <Row className="g-4">
          {/* DADOS DO ALUNO E EMPRESA */}
          <Col lg={8}>
            <div style={{
              background: isDark ? 'rgba(30, 41, 59, 0.45)' : 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(20px)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: isDark
                ? '0 10px 30px rgba(0, 0, 0, 0.2)'
                : '0 10px 30px rgba(15, 23, 42, 0.04)',
              borderRadius: '20px',
              padding: '30px',
              height: '100%'
            }}>
              <span style={{
                color: isDark ? '#ffffff' : '#0f172a',
                fontSize: '18px',
                fontWeight: 800,
                letterSpacing: '-0.25px',
                borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
                paddingBottom: '16px',
                marginBottom: '28px',
                display: 'block'
              }}>
                Dados do Aluno e Empresa
              </span>

              <Row className="g-4 mb-4">
                <Col md={6}>
                  <small style={{
                    fontSize: '11px',
                    letterSpacing: '0.75px',
                    fontWeight: 700,
                    color: isDark ? '#64748b' : '#475569',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                    display: 'block'
                  }}>Nome do Aluno</small>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: isDark ? '#f8fafc' : '#1e293b' }}>{item?.employee?.name || '-'}</div>
                </Col>
                <Col md={6}>
                  <small style={{
                    fontSize: '11px',
                    letterSpacing: '0.75px',
                    fontWeight: 700,
                    color: isDark ? '#64748b' : '#475569',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                    display: 'block'
                  }}>CPF</small>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: isDark ? '#f8fafc' : '#1e293b' }}>{item?.employee?.cpf ? addMaskCpf(item.employee.cpf) : '-'}</div>
                </Col>
                <Col md={6}>
                  <small style={{
                    fontSize: '11px',
                    letterSpacing: '0.75px',
                    fontWeight: 700,
                    color: isDark ? '#64748b' : '#475569',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                    display: 'block'
                  }}>Empresa</small>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: isDark ? '#f8fafc' : '#1e293b' }}>{item?.employee?.company?.name || '-'}</div>
                </Col>
                <Col md={6}>
                  <small style={{
                    fontSize: '11px',
                    letterSpacing: '0.75px',
                    fontWeight: 700,
                    color: isDark ? '#64748b' : '#475569',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                    display: 'block'
                  }}>Função / Profissão</small>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: isDark ? '#f8fafc' : '#1e293b' }}>{item?.employee?.position || item?.position?.name || '-'}</div>
                </Col>
              </Row>

              <hr style={{
                border: 'none',
                borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
                margin: '28px 0'
              }} />

              <Row className="g-4">
                <Col md={12}>
                  <small style={{
                    fontSize: '11px',
                    letterSpacing: '0.75px',
                    fontWeight: 700,
                    color: isDark ? '#64748b' : '#475569',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                    display: 'block'
                  }}>Curso Realizado</small>
                  <div style={{ fontSize: '17px', fontWeight: 700, color: '#4f46e5' }}>{item?.course?.name || '-'}</div>
                </Col>
                <Col md={4}>
                  <small style={{
                    fontSize: '11px',
                    letterSpacing: '0.75px',
                    fontWeight: 700,
                    color: isDark ? '#64748b' : '#475569',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                    display: 'block'
                  }}>Data de Emissão</small>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: isDark ? '#e2e8f0' : '#334155' }}>{formatDate(item?.issue_date)}</div>
                </Col>
                <If condition={item?.date_init_validate && item?.date_end_validate}>
                  <Col md={8}>
                    <small style={{
                      fontSize: '11px',
                      letterSpacing: '0.75px',
                      fontWeight: 700,
                      color: isDark ? '#64748b' : '#475569',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                      display: 'block'
                    }}>Período de Validade</small>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: isDark ? '#e2e8f0' : '#334155' }}>
                      {formatDate(item?.date_init_validate, 'd/m/Y')} <span style={{ color: isDark ? '#64748b' : '#94a3b8', margin: '0 8px' }}>—</span> {formatDate(item?.date_end_validate, 'd/m/Y')}
                    </div>
                  </Col>
                </If>
                <Col md={12}>
                  <small style={{
                    fontSize: '11px',
                    letterSpacing: '0.75px',
                    fontWeight: 700,
                    color: isDark ? '#64748b' : '#475569',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    display: 'block'
                  }}>Instrutores</small>
                  {item?.presence_list?.instructors?.length ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {item.presence_list.instructors.map((instrutor: any) => (
                        <span 
                          key={instrutor.id} 
                          style={{
                            background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                            borderRadius: '8px',
                            color: isDark ? '#e2e8f0' : '#334155',
                            padding: '8px 14px',
                            fontWeight: 600,
                            fontSize: '13px'
                          }}
                        >
                          {instrutor.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: isDark ? '#64748b' : '#64748b', fontSize: '14px' }}>Nenhum instrutor registrado</span>
                  )}
                </Col>
              </Row>
            </div>
          </Col>

          {/* DOCUMENTOS DISPONÍVEIS */}
          <Col lg={4}>
            <div style={{
              background: isDark ? 'rgba(30, 41, 59, 0.45)' : 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(20px)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: isDark
                ? '0 10px 30px rgba(0, 0, 0, 0.2)'
                : '0 10px 30px rgba(15, 23, 42, 0.04)',
              borderRadius: '20px',
              padding: '30px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '24px'
            }}>
              <div>
                <span style={{
                  color: isDark ? '#ffffff' : '#0f172a',
                  fontSize: '18px',
                  fontWeight: 800,
                  letterSpacing: '-0.25px',
                  borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
                  paddingBottom: '16px',
                  marginBottom: '24px',
                  display: 'block'
                }}>
                  Documentos Disponíveis
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Certificado Section */}
                  <div>
                    <small style={{
                      fontSize: '11px',
                      letterSpacing: '0.75px',
                      fontWeight: 700,
                      color: isDark ? '#64748b' : '#475569',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                      display: 'block'
                    }}>Certificado</small>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => getDocumentView('certificate')} 
                        disabled={isProcessingDocument} 
                        style={{
                          background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
                          borderRadius: '12px',
                          color: isDark ? '#cbd5e1' : '#334155',
                          fontWeight: 600,
                          fontSize: '14px',
                          padding: '12px 16px',
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(79, 70, 229, 0.06)';
                          e.currentTarget.style.borderColor = isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(79, 70, 229, 0.2)';
                          e.currentTarget.style.color = isDark ? '#3b82f6' : '#4f46e5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
                          e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
                          e.currentTarget.style.color = isDark ? '#cbd5e1' : '#334155';
                        }}
                      >
                        {isProcessingPrint ? renderProcessingSpinner() : <MdOutlineLocalPrintshop />} Imprimir
                      </button>
                      <button 
                        onClick={() => getDocumentDownloadFile('certificate')} 
                        disabled={isProcessingDocument || isProcessingPrint} 
                        style={{
                          background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
                          borderRadius: '12px',
                          color: isDark ? '#cbd5e1' : '#334155',
                          fontWeight: 600,
                          fontSize: '14px',
                          padding: '12px 16px',
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(79, 70, 229, 0.06)';
                          e.currentTarget.style.borderColor = isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(79, 70, 229, 0.2)';
                          e.currentTarget.style.color = isDark ? '#3b82f6' : '#4f46e5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
                          e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
                          e.currentTarget.style.color = isDark ? '#cbd5e1' : '#334155';
                        }}
                      >
                        {isProcessingDocument ? renderProcessingSpinner() : <MdOutlineCloudDownload />} Baixar
                      </button>
                    </div>
                  </div>

                  {/* Presença Section */}
                  {item.presence_list_template_mounted && (
                    <div>
                      <small style={{
                        fontSize: '11px',
                        letterSpacing: '0.75px',
                        fontWeight: 700,
                        color: isDark ? '#64748b' : '#475569',
                        textTransform: 'uppercase',
                        marginBottom: '8px',
                        display: 'block'
                      }}>Lista de Presença</small>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => getDocumentView('presence_list')} 
                          disabled={isProcessingDocument} 
                          style={{
                            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
                            borderRadius: '12px',
                            color: isDark ? '#cbd5e1' : '#334155',
                            fontWeight: 600,
                            fontSize: '14px',
                            padding: '12px 16px',
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(79, 70, 229, 0.06)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(79, 70, 229, 0.2)';
                            e.currentTarget.style.color = isDark ? '#3b82f6' : '#4f46e5';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
                            e.currentTarget.style.color = isDark ? '#cbd5e1' : '#334155';
                          }}
                        >
                          {isProcessingPrint ? renderProcessingSpinner() : <MdOutlineLocalPrintshop />} Imprimir
                        </button>
                        <button 
                          onClick={() => getDocumentDownloadFile('presence_list')} 
                          disabled={isProcessingDocument} 
                          style={{
                            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
                            borderRadius: '12px',
                            color: isDark ? '#cbd5e1' : '#334155',
                            fontWeight: 600,
                            fontSize: '14px',
                            padding: '12px 16px',
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(79, 70, 229, 0.06)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(79, 70, 229, 0.2)';
                            e.currentTarget.style.color = isDark ? '#3b82f6' : '#4f46e5';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
                            e.currentTarget.style.color = isDark ? '#cbd5e1' : '#334155';
                          }}
                        >
                          {isProcessingDocument ? renderProcessingSpinner() : <MdOutlineCloudDownload />} Baixar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Anuência Section */}
                  {item.authorization_template_version_id && (
                    <div>
                      <small style={{
                        fontSize: '11px',
                        letterSpacing: '0.75px',
                        fontWeight: 700,
                        color: isDark ? '#64748b' : '#475569',
                        textTransform: 'uppercase',
                        marginBottom: '8px',
                        display: 'block'
                      }}>Anuência / Autorização</small>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => getDocumentView('authorization')} 
                          disabled={isProcessingDocument} 
                          style={{
                            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
                            borderRadius: '12px',
                            color: isDark ? '#cbd5e1' : '#334155',
                            fontWeight: 600,
                            fontSize: '14px',
                            padding: '12px 16px',
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(79, 70, 229, 0.06)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(79, 70, 229, 0.2)';
                            e.currentTarget.style.color = isDark ? '#3b82f6' : '#4f46e5';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
                            e.currentTarget.style.color = isDark ? '#cbd5e1' : '#334155';
                          }}
                        >
                          {isProcessingPrint ? renderProcessingSpinner() : <MdOutlineLocalPrintshop />} Imprimir
                        </button>
                        <button 
                          onClick={() => getDocumentDownloadFile('authorization')} 
                          disabled={isProcessingDocument} 
                          style={{
                            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
                            borderRadius: '12px',
                            color: isDark ? '#cbd5e1' : '#334155',
                            fontWeight: 600,
                            fontSize: '14px',
                            padding: '12px 16px',
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(79, 70, 229, 0.06)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(79, 70, 229, 0.2)';
                            e.currentTarget.style.color = isDark ? '#3b82f6' : '#4f46e5';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
                            e.currentTarget.style.color = isDark ? '#cbd5e1' : '#334155';
                          }}
                        >
                          {isProcessingDocument ? renderProcessingSpinner() : <MdOutlineCloudDownload />} Baixar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Enviar por E-mail Section */}
                  <div>
                    <small style={{
                      fontSize: '11px',
                      letterSpacing: '0.75px',
                      fontWeight: 700,
                      color: isDark ? '#64748b' : '#475569',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                      display: 'block'
                    }}>
                      {item.email_sent ? 'E-mail Enviado' : 'Enviar E-mail'}
                    </small>
                    <button 
                      onClick={handleSendEmailClick} 
                      disabled={isSendingEmail || isProcessingDocument}
                      className={`premium-action-btn ${item.email_sent ? 'premium-action-btn-success' : 'premium-action-btn-edit'}`}
                      style={{ 
                        width: '100%',
                      }}
                    >
                      {isSendingEmail ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Enviando...
                        </>
                      ) : item.email_sent ? (
                        <>
                          <i className="bi bi-envelope-check-fill"></i> E-mail Enviado
                        </>
                      ) : (
                        <>
                          <i className="bi bi-envelope-paper"></i> Enviar por E-mail
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{
                background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.04)',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '16px'
              }}>
                <small style={{
                  fontSize: '11px',
                  letterSpacing: '0.75px',
                  fontWeight: 700,
                  color: isDark ? '#64748b' : '#475569',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                  display: 'block'
                }}>Registrado por</small>
                <div style={{ fontSize: '14px', fontWeight: 600, color: isDark ? '#f8fafc' : '#1e293b' }}>{item?.registered_by?.name || '-'}</div>
                <small style={{
                  fontSize: '11px',
                  letterSpacing: '0.75px',
                  fontWeight: 700,
                  color: isDark ? '#64748b' : '#475569',
                  textTransform: 'uppercase',
                  marginTop: '12px',
                  marginBottom: '4px',
                  display: 'block'
                }}>Data do registro</small>
                <div style={{ fontSize: '14px', fontWeight: 600, color: isDark ? '#f8fafc' : '#1e293b' }}>{item.created_at ? formatDate(item.created_at) : '-'}</div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </Fragment>
  );
};

export default DocumentView;