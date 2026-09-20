import React, { FC, Fragment, useContext, useEffect, useRef, useState } from 'react';
import { Button, Card, CardBody, Col, Form, Modal, Nav, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2';
import api from '@/src/lib/api';
import Editor from '@/src/components/common/Editor/Editor';
import AppContext from '@/src/AppContext/Context';
import { optimizeImage } from '@/src/lib/helper';
interface TemplateData {
  name: string;
  number_of_hours_studied: 0;
  template: string;
  type_id: number | null;
  frame_color?: string;
  frame_type?: 'color' | 'custom';
  orientation?: 'landscape';
  frame_id?: null | number;
  back_document?: null | string;
  certificate_id: number;
}

const A4_HEIGHT_IN_PX = 880;
const A4_WIDTH_IN_PX = 1122.66;
const A4_PORTRAIT_WIDTH_IN_PX = 794;
const A4_PORTRAIT_HEIGHT_IN_PX = 1123;
const A4_LANDSCAPE_WIDTH_IN_PX = 1123;
const A4_LANDSCAPE_HEIGHT_IN_PX = 794;

const DocumentTemplateForm: FC = () => {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId?: string }>();
  const isEdit = Boolean(templateId);
  const { theme } = useContext(AppContext);

  const [item, setItem] = useState<TemplateData>({
    name: '',
    template: '',
    type_id: null,
    orientation: 'landscape',
    frame_type: 'custom',
    frame_id: null,
    back_document: '',
    number_of_hours_studied: 0,
    certificate_id: 0
  });

  const [disabledSubmit, setDisabledSubmit] = useState(false);
  const [tabSelected, setTabSelected] = useState<string>('/data');
  const [tabSelectedCertificate, setTabSelectedCertificate] = useState<string>('/front');

  // New states for custom borders
  const [selectedPalette, setSelectedPalette] = useState('#29638d');
  const [borderImage, setBorderImage] = useState<string>('');
  const [selectedBorder, setSelectedBorder] = useState<number | null>();
  const [borders, setBorders] = useState<{ id: number; frame: string; back_frame?: string; is_top_only?: boolean }[]>([]);
  const [loadingAddBorder, setLoadingAddBorder] = useState(false);
  const [showModalList, setShowModalList] = useState(false);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [newBorderPreview, setNewBorderPreview] = useState<string | null>(null);
  const [newBackBorderPreview, setNewBackBorderPreview] = useState<string | null>(null);
  const newBorderInputRef = useRef<HTMLInputElement>(null);
  const newBackBorderInputRef = useRef<HTMLInputElement>(null);

  const editorRef = useRef<any>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const editorSize = {
    width: A4_WIDTH_IN_PX,
    height: A4_HEIGHT_IN_PX,
  };

  useEffect(() => {
    if (tabSelected == '/layout') {
      const editor = editorRef.current;
      let timeout = 4000;
      if (editor && item?.orientation) {
        timeout = 150;
      }

      setTimeout(() => {
        applyEditorFrame();
      }, timeout);
    }
  }, [borderImage, selectedBorder, tabSelected, tabSelectedCertificate]);

  useEffect(() => {
    if (!showModalAdd) {
      return;
    }

    const timer = window.setTimeout(() => {
      newBorderInputRef.current?.click();
    }, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [showModalAdd]);

  const applyEditorFrame = () => {
    const editor = editorRef.current;
    if (!editor || !item.orientation) return;

    let backgroundCSS = '';
    let pageCSS = '';

    const selected = borders.find(b => b.id === selectedBorder);
    if (selected) {
      const isTopOnly = Boolean(selected.is_top_only);
      const frameUrl = tabSelectedCertificate === '/front' ? selected.frame : (selected.back_frame || selected.frame);

      backgroundCSS = `
        background-image: url(${frameUrl});
        background-repeat: no-repeat;
        background-position: ${isTopOnly ? 'top center' : 'center center'};
        background-size: ${isTopOnly ? '100% auto' : '100% 100%'};
        position: relative;
      `;
    } else {
      backgroundCSS = `
        background-color: transparent;
      `;
    }

    pageCSS = item.orientation === 'portrait'
      ? `
      width: ${A4_PORTRAIT_WIDTH_IN_PX}px;
      height: ${A4_PORTRAIT_HEIGHT_IN_PX}px;
    `
      : `
      width: ${A4_LANDSCAPE_WIDTH_IN_PX}px;
      height: ${A4_LANDSCAPE_HEIGHT_IN_PX}px;
    `;

    applyStyle(editor, backgroundCSS, pageCSS);
  };

  const applyStyle = (editor: any, backgroundCSS: string, pageCSS: string) => {
    const css = `
     
      body {
        ${backgroundCSS}
        padding: 0;
        margin: 0 auto;
        width: 95%;
        height: 650px;
        font-size: 12px;
        box-sizing: border-box;
        overflow-x: hidden;
        background-color: #fff;
        position: relative;
      }
      @media print {
        @page {
          size: A4 ${item.orientation};
          margin: 0;
        }
        html, body {
          padding: 0 !important;
          margin: 0 !important;
          ${pageCSS}
          overflow: hidden;
          background-color: #fff !important;
        }
        * {
          box-shadow: none !important;
        }
      }
    `;

    const head = editor.getDoc()?.head;
    if (!head) return;
    const existingStyle = head.querySelector('style[data-custom-style]');
    if (existingStyle) {
      existingStyle.remove();
    }
    const styleEl = editor.dom.create('style', { 'data-custom-style': true }, css);
    head.appendChild(styleEl);
  };

  const getTemplateFrames = async () => {
    try {
      const response = await api.get('/document-template-frames?all=1');
      const processedBorders = await Promise.all(
        response.data.map(async (item: any) => {
          try {
            const imageResponse = await api.get(`/image?image=${item.frame}`, {
              responseType: 'blob',
            });
            const imageUrl = URL.createObjectURL(imageResponse.data);

            let backImageUrl = '';
            if (item.back_frame) {
              try {
                const backImageResponse = await api.get(`/image?image=${item.back_frame}`, {
                  responseType: 'blob',
                });
                backImageUrl = URL.createObjectURL(backImageResponse.data);
              } catch (err) {
                console.error('Erro ao carregar verso da moldura:', err);
              }
            }

            return {
              ...item,
              frame: imageUrl,
              back_frame: backImageUrl,
            };
          } catch (error) {
            console.error('Erro ao carregar imagem da moldura:', error);
            return {
              ...item,
              frame: '',
              back_frame: '',
            };
          }
        })
      );
      setBorders(processedBorders);
    } catch (error) {
      console.error('Erro ao buscar molduras:', error);
    }
  };

  const handleSelectBorder = (border: number | null) => {
    setSelectedBorder(border);
  };

  const handleOpenAddBorderModal = () => {
    setShowModalList(false);
    setShowModalAdd(true);
  };

  const handleNewBorderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const fileBase64 = await optimizeImage(file, 1200, 1);
      setNewBorderPreview(fileBase64);
    } else {
      setNewBorderPreview(null);
    }
  };

  const handleNewBackBorderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const fileBase64 = await optimizeImage(file, 1200, 1);
      setNewBackBorderPreview(fileBase64);
    } else {
      setNewBackBorderPreview(null);
    }
  };

  const handleAddNewBorder = () => {
    if (newBorderPreview) {
      setLoadingAddBorder(true);
      const img = new Image();
      img.src = newBorderPreview;
      img.onload = () => {
        const isTopOnly = img.height < 200;
        const data = {
          frame: newBorderPreview,
          back_frame: newBackBorderPreview,
          is_top_only: isTopOnly,
        };

        api.post('/document-template-frames', data).then(() => {
          getTemplateFrames();
          setShowModalAdd(false);
          setNewBorderPreview(null);
          setNewBackBorderPreview(null);
          toast.success('Moldura adicionada com sucesso!');
        }).catch(() => {
          toast.error('Erro ao adicionar moldura');
        }).finally(() => {
          setLoadingAddBorder(false);
        });
      };
    }
  };

  const handleDeleteBorder = (id: number) => {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta moldura será deletada permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, deletar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        api.delete(`/document-template-frames/${id}`).then(() => {
          getTemplateFrames();
        });
      }
    });
  };

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItem(prev => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (content: string, target_name: string) => {
    setItem(prev => ({ ...prev, [target_name]: content }));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPalette(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let templateTreated = substituirPlaceholderQRCodePorMascara(item.template);
    templateTreated = substituirAssinaturaInstrutoresPorMascara(templateTreated);

    let backDocumentTreated = substituirPlaceholderQRCodePorMascara(item.back_document ?? '');
    backDocumentTreated = substituirAssinaturaInstrutoresPorMascara(backDocumentTreated);


    if (!selectedBorder) {
      toast.error('Selecione uma moldura personalizada');
      return;
    }

    if (!item.name || !item.template) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setDisabledSubmit(true);

    const payload = {
      name: item.name,
      template: templateTreated,
      back_document: backDocumentTreated,
      orientation: item.orientation,
      frame_type: item.frame_type,
      frame_color: item.frame_type === 'color' ? selectedPalette : null,
      frame_id: item.frame_type === 'custom' ? selectedBorder : null,
      type_id: 1
    };

    try {
      if (isEdit) {
        await api.put(`/document-templates/${item.certificate_id}`, payload);
        await api.put(`/courses/${templateId}`, {
          name: item.name,
          number_of_hours_studied: item.number_of_hours_studied || '0',
        });
      } else {
        const template = await api.post('/document-templates', payload);
        await api.post('/courses', {
          name: item.name,
          number_of_hours_studied: item.number_of_hours_studied || '0',
          certificate_id: template.data?.id,
        });
      }

      Swal.fire({
        icon: 'success',
        title: isEdit ? 'Template atualizado' : 'Template criado',
        text: isEdit ? 'Curso atualizado com sucesso!' : 'Curso criado com sucesso!',
        confirmButtonText: 'OK'
      }).then(() => navigate('/document-templates'));
    } catch {
      toast.error('Erro ao salvar template');
    } finally {
      setDisabledSubmit(false);
    }
  };

  // --- Masks ---
  const masks = [
    { key: 'nome_aluno', label: 'Nome Aluno' },
    { key: 'nome_curso', label: 'Nome Curso' },
    { key: 'carga_horaria', label: 'Carga Horária' },
    { key: 'periodo_curso', label: 'Período Curso' },
    { key: 'data_de_emissao', label: 'Data Emissão' },
    { key: 'local_e_data', label: 'Local e Data' },
    { key: 'nome_do_instrutor', label: 'Nome Instrutor' },
    { key: 'assinatura_instrutor', label: 'Assinatura Instrutor' },
    { key: 'assinatura_aluno', label: 'Assinatura Aluno' },
    { key: 'nome_empresa', label: 'Nome Empresa' },

    { key: 'cidade_de_realizacao', label: 'Cidade de Realização' },
    { key: 'profissao', label: 'Profissão' },
  ];

  const QRCODE_PLACEHOLDER_HTML = `
    <div class="mceNonEditable" style="
        width: 100px;
        height: 100px;
        border: 1px solid #ccc;
        font-size: 10px;
        color: #555;
        background-color: #f9f9f9;
        border-radius: 5px;
        box-shadow: 0 0 5px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
    " data-mask-key="qrcode_validacao" contenteditable="false">
        <span>[QR Code]<br/>Validação</span>
    </div>
  `;

  const insertVariable = (variableKey: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const htmlMap: Record<string, string> = {
      'assinatura(s)_instrutores': `
        <div style="width: 100%; display: flex; justify-content: center; gap: 100px; text-align: center;">
          <div>
            <div style="font-family: cursive; font-size: 18px;">{{assinatura(s)_instrutores}}</div>
            <hr style="border: none; border-top: 2px solid #000; width: 300px; margin: 6px auto;" />
            <div style="font-size: 14px; font-weight: bold;">Ass. {{nome_instrutor}}</div>
            <div style="
                display: flex;
                justify-content-center;
                flex-direction: column;
                align-items: center;
            ">
               <div style="
                width: 150px;
                height: 100px;
                color: #0000ff;
                font-size: 12px;
                line-height: 1.1;
                text-align: center;
                padding: 1px;
                box-sizing: border-box;
                font-family: Arial, sans-serif;
              ">
                <div>
                  <strong>{{CARIMBO}}</strong><br />
                  Nome do Instrutor<br />
                  Instrutor SST<br />
                  CNPJ: 12.345.678/0001-90
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      'assinatura_contratante': `
        <div style="margin-top: 40px; width: 100%; display: flex; justify-content: center; gap: 100px; text-align: center;">
          <div>
            <hr style="border: none; border-top: 2px solid #000; width: 300px; margin: 6px auto;" />
            <div style="font-size: 14px; font-weight: bold;">Assinatura do aluno</div>
          </div>
          <div>
            <hr style="border: none; border-top: 2px solid #000; width: 300px; margin: 6px auto;" />
            <div style="font-size: 14px; font-weight: bold;">Assinatura do contratante</div>
          </div>
        </div>
      `,
      'local_e_data': `
        <div style="margin-top: 30px; width: 100%; text-align: center; font-size: 13px;">
          <div>
            <span style="font-size: 16px;">📍</span>
            ____________________, ____ de ______________ de ________<br />
            <span style="font-size: 12px; color: #666;">(Identificação do local e data)</span>
          </div>
        </div>
      `,
      'qrcode_validacao': QRCODE_PLACEHOLDER_HTML,
    };

    editor.insertContent(htmlMap[variableKey] || `{{${variableKey}}}`);
  };

  function substituirPlaceholderQRCodePorMascara(html: string | null): string | null {
    const regex = /<div[^>]*class="mceNonEditable"[^>]*data-mask-key="qrcode_validacao"[^>]*>.*?<\/div>/gs;
    return html.replace(regex, '{{qrcode_validacao}}');
  }

  function substituirMascaraQRCodePorPlaceholder(html: string): string {
    return html.replace(/\{\{qrcode_validacao\}\}/g, QRCODE_PLACEHOLDER_HTML);
  }

  function substituirAssinaturaInstrutoresPorMascara(html: string | null): string | null {
    if (!html) return html;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const allDivs = Array.from(doc.querySelectorAll('div'));
    for (const div of allDivs) {
      if (div.innerHTML.includes('{{assinatura(s)_instrutores}}') && div.innerHTML.includes('{{nome_instrutor}}')) {
        const placeholder = document.createElement('div');
        placeholder.innerHTML = `<div style="text-align: center;">{{assinatura(s)_instrutores}}</div>`;
        div.replaceWith(placeholder);
      }
    }
    return doc.body.innerHTML;
  }

  function substituirMascaraPorAssinaturaInstrutores(html: string | null): string | null {
    if (!html) return html;
    if (!html) return '';
    const assinaturaHtml = `
      <div style="margin-top: 40px; width: 100%; display: flex; justify-content: center; gap: 100px; text-align: center;">
        <div>
          <div style="font-family: cursive; font-size: 18px;">{{assinatura(s)_instrutores}}</div>
          <hr style="border: none; border-top: 2px solid #000; width: 300px; margin: 6px auto;" />
          <div style="font-size: 14px; font-weight: bold;">Ass. {{nome_instrutor}}</div>
          <div style="
              display: flex;
              justify-content-center;
              flex-direction: column;
              align-items: center;
          ">
            <div style="
              width: 150px;
              height: 70px;
              color: #0000ff;
              font-size: 12px;
              line-height: 1.1;
              text-align: center;
              padding: 1px;
              box-sizing: border-box;
              font-family: Arial, sans-serif;
            ">
              <div>
                <strong>{{CARIMBO}}</strong><br />
                Nome do Instrutor<br />
                Instrutor SST<br />
                CNPJ: 12.345.678/0001-90
              </div>
            </div>
          </div>
        </div>
      </div>
    `.trim();
    return html.replace('{{assinatura(s)_instrutores}}', assinaturaHtml);
  }

  // --- Effects ---
  useEffect(() => {
    getTemplateFrames();

    if (isEdit && templateId) {
      api.get(`/courses/${templateId}`).then(res => {
        const data = res.data;
        let templateContent = substituirMascaraPorAssinaturaInstrutores(data.certificate_template?.template);
        templateContent = substituirMascaraQRCodePorPlaceholder(templateContent);

        let backDocumentContent = substituirMascaraPorAssinaturaInstrutores(data.back_document ?? '');
        backDocumentContent = substituirMascaraQRCodePorPlaceholder(backDocumentContent);

        setItem({
          name: data.name,
          number_of_hours_studied: data.number_of_hours_studied,
          template: templateContent,
          certificate_id: data.certificate_id,
          ...data.certificate_template
        });

        if (data.certificate_template.frame_type === 'custom') {
          setTimeout(() => {
            setSelectedBorder(data.certificate_template.frame_id);
          }, 2000);

        }
      });
    } else {
      setSelectedPalette(theme?.primary_color || '#29638d');
      setItem(prev => ({ ...prev, orientation: 'landscape' }));
    }
  }, [isEdit, templateId, theme?.primary_color]);

  useEffect(() => {
    if (editorRef.current) {
      applyEditorFrame();
    }
  }, [borderImage, selectedBorder, theme?.logo, item.frame_type, tabSelectedCertificate, item.orientation]);

  return (
    <Fragment>
      <form onSubmit={handleSubmit}>
        <Row>
          <Col md={12}>
            <Card>
              <CardBody>
                <Row>
                  <Col md={9}>
                    <div className="mb-3">
                      <Form.Label>Nome do Curso</Form.Label>
                      <Form.Control
                        name="name"
                        value={item.name}
                        onChange={handleChange}
                        type="text"
                        required
                        placeholder="Nome do curso"
                      />
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="mb-3">
                      <Form.Label>Quantidade de Horas</Form.Label>
                      <Form.Control
                        name="number_of_hours_studied"
                        value={item.number_of_hours_studied}
                        onChange={handleChange}
                        type="number"
                        min="1"
                        required
                        placeholder="Ex.: 40"
                      />
                    </div>
                  </Col>
                </Row>
                <Nav variant="tabs" activeKey={tabSelectedCertificate} onSelect={(tabSelectedCertificate) => tabSelectedCertificate && setTabSelectedCertificate(tabSelectedCertificate)}>
                  <Nav.Item><Nav.Link eventKey="/front">Frente</Nav.Link></Nav.Item>
                  <Nav.Item><Nav.Link eventKey="/back">Verso (Opcional)</Nav.Link></Nav.Item>
                </Nav>
                <Row style={{ width: A4_WIDTH_IN_PX + 24 }}>
                  <Col md={4}>
                    <p className={'mb-2 mt-2'}>
                      <strong>Estilo de Moldura</strong><br />
                    </p>

                    <div className="d-flex flex-wrap align-items-center gap-2 ">
                      {borders.slice(0, 5).map(border => (
                        <div key={border.id}>
                          <div
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleSelectBorder(border.id)}
                          >
                            <img
                              src={border.frame}
                              alt=""
                              style={{
                                border: selectedBorder === border.id ? '4px solid #0d6efd' : '2px solid #ccc',
                                borderRadius: 8,
                                width: 75,
                                height: 75,
                                objectFit: 'cover'
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      <Button variant="outline-secondary" onClick={() => setShowModalList(true)} style={{ width: 75, height: 75, fontSize: '0.8rem' }}>
                        Listar Todas
                      </Button>
                    </div>
                  </Col>
                  <Col md={8} className="mb-3">
                    <div className="py-2 px-0 m-0">
                      <p>
                        <strong>Personalize seus documentos:</strong><br />
                        <div className="d-flex flex-wrap gap-2 mt-2">
                          {masks.map(m => (
                            <Button
                              key={m.key}
                              variant="outline-primary"
                              size="sm"
                              onClick={() => insertVariable(m.key)}
                              style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}

                            >
                              <span>{m.label}</span>
                            </Button>
                          ))}
                        </div>
                      </p>
                    </div>
                  </Col>
                </Row>
                <Row style={{ width: A4_WIDTH_IN_PX + 24 }}>
                  <Col>
                    <p className={'mb-2'}>
                      <strong>Corpo do certificado e conteúdo programático</strong><br />
                    </p>
                    <div ref={editorContainerRef} style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
                      <div className={'w-100'}>
                        <Editor
                          height={editorSize.height}
                          width={editorSize.width}
                          maxWidth={'100%'}
                          value={tabSelectedCertificate === '/front' ? item.template : item.back_document}
                          onEditorChange={e => handleEditorChange(e, tabSelectedCertificate === '/front' ? 'template' : 'back_document')}
                          onInit={(_evt, editor) => (editorRef.current = editor)}
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row className="mt-4" style={{ width: A4_WIDTH_IN_PX + 24, maxWidth: '100%' }}>
                  <Col xs={6}>
                    <Button variant="light" onClick={() => {
                      navigate('/document-templates');
                    }}>
                      Voltar
                    </Button>
                  </Col>
                  <Col xs={6} className="d-flex justify-content-end">
                    <Button variant="primary" type="submit" disabled={disabledSubmit}>
                      {disabledSubmit ? 'Salvando...' : (isEdit ? 'Atualizar Curso' : 'Novo Curso')}
                    </Button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </form>

      {/* Modals for Custom Borders */}
      <Modal show={showModalList} onHide={() => setShowModalList(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Todas as Molduras</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex gap-3 flex-wrap">
            {borders.map(border => (
              <div onClick={() => handleSelectBorder(border.id)} key={border.id} className="position-relative btn btn-outline-primary">
                <img src={border.frame} alt="" style={{ width: 120, borderRadius: 8, border: '1px solid #ccc' }} />
                <Button
                  size="sm"
                  variant="danger"
                  className="position-absolute top-0 end-0"
                  onClick={() => handleDeleteBorder(border.id)}
                >
                  <i className="bi bi-trash" />
                </Button>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-success" onClick={handleOpenAddBorderModal}>
            Adicionar moldura
          </Button>
          <Button variant="secondary" onClick={() => setShowModalList(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModalAdd} onHide={() => setShowModalAdd(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Nova Moldura</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Imagem de Fundo (Frente)</Form.Label>
            <Form.Control ref={newBorderInputRef} type="file" accept="image/*" onChange={handleNewBorderChange} />
          </Form.Group>
          {newBorderPreview && (
            <div className="mt-2 mb-3">
              <small>Preview Frente:</small>
              <img src={newBorderPreview} alt="Preview" style={{ width: '100%', borderRadius: 8, maxHeight: 150, objectFit: 'contain' }} />
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Imagem de Fundo (Verso - Opcional)</Form.Label>
            <Form.Control ref={newBackBorderInputRef} type="file" accept="image/*" onChange={handleNewBackBorderChange} />
          </Form.Group>
          {newBackBorderPreview && (
            <div className="mt-2">
              <small>Preview Verso:</small>
              <img src={newBackBorderPreview} alt="Preview Verso" style={{ width: '100%', borderRadius: 8, maxHeight: 150, objectFit: 'contain' }} />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalAdd(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleAddNewBorder}
            disabled={!newBorderPreview || loadingAddBorder}
          >
            {loadingAddBorder ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </Fragment>
  );
};

export default DocumentTemplateForm;