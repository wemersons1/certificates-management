import React, { FC, Fragment, useEffect, useRef, useState } from 'react';
import { Badge, Button, Card, CardBody, Col, Form, Nav, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import api from '@/src/lib/api';
import Editor from '@/src/components/common/Editor/Editor';

interface TemplateData {
  name: string;
  number_of_hours_studied: number | string;
  template: string;
  back_document?: string;
  orientation?: 'landscape';
  frame_type?: 'custom';
}

const A4_HEIGHT_IN_PX = 920;
const A4_WIDTH_IN_PX = 1122.66;

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

const CourseV2: FC = () => {
  const navigate = useNavigate();
  const editorRef = useRef<any>(null);

  const [item, setItem] = useState<TemplateData>({
    name: '',
    template: '',
    back_document: '',
    orientation: 'landscape',
    frame_type: 'custom',
    number_of_hours_studied: 0,
  });

  const [tabSelectedCertificate, setTabSelectedCertificate] = useState<string>('/front');
  const [disabledSubmit, setDisabledSubmit] = useState(false);
  const [selectedBorder, setSelectedBorder] = useState<number | null>(null);
  const [borders, setBorders] = useState<{ id: number; frame: string }[]>([]);

  const editorSize = {
    width: A4_WIDTH_IN_PX,
    height: A4_HEIGHT_IN_PX,
  };

  const masks = [
    { key: 'nome_aluno', label: 'Nome Aluno' },
    { key: 'cpf_aluno', label: 'CPF Aluno' },
    { key: 'funcao_aluno', label: 'Função Aluno' },
    { key: 'nome_curso', label: 'Nome Curso' },
    { key: 'carga_horaria', label: 'Carga Horária' },
    { key: 'periodo_curso', label: 'Período Curso' },
    { key: 'data_de_emissao', label: 'Data Emissão' },
    { key: 'nome_empresa', label: 'Nome Empresa' },
    { key: 'nome_instrutor', label: 'Nome instrutor' },
    { key: 'formacao_instrutor', label: 'Formação Instrutor' },
    { key: 'crea_instrutor', label: 'CREA Instrutor' },
    { key: 'data_validade', label: 'Data de validade' },
    { key: 'cidade_de_realizacao', label: 'Cidade de Realização' },
    { key: 'assinatura(s)_instrutores', label: 'Assinatura instrutores' },
    { key: 'qrcode_validacao', label: 'QR Code de validação' },
  ];

  const getTemplateFrames = async () => {
    try {
      const response = await api.get('/document-template-frames?all=1');
      const processedBorders = await Promise.all(
        response.data.map(async (frameItem: any) => {
          try {
            const imageResponse = await api.get(`/image?image=${frameItem.frame}`, {
              responseType: 'blob',
            });
            const imageUrl = URL.createObjectURL(imageResponse.data);

            let backImageUrl = '';
            if (frameItem.back_frame) {
              try {
                const backImageResponse = await api.get(`/image?image=${frameItem.back_frame}`, {
                  responseType: 'blob',
                });
                backImageUrl = URL.createObjectURL(backImageResponse.data);
              } catch (err) {
                console.error('Erro ao carregar verso da moldura:', err);
              }
            }

            return {
              ...frameItem,
              frame: imageUrl,
              back_frame: backImageUrl,
            };
          } catch {
            return {
              ...frameItem,
              frame: '',
              back_frame: '',
            };
          }
        })
      );
      setBorders(processedBorders);
      if (processedBorders.length > 0) {
        setSelectedBorder(processedBorders[0].id);
      }
    } catch {
      toast.error('Erro ao buscar molduras');
    }
  };

  useEffect(() => {
    getTemplateFrames();
    const templateDefault = `
      <h1 style="font-size: 55px; text-align: center;"><span style="color: #34495e;"><strong>CERTIFICADO</strong></span></h1>
      <p>&nbsp;</p>
      <p style="text-align: center;"><span style="color: #34495e;">Certifica que {{nome_aluno}}, participou do curso {{nome_curso}} no período {{periodo_curso}} com carga horária de {{carga_horaria}}.</span></p>
      <p>&nbsp;</p>
    `;

    setItem(prev => ({ ...prev, template: templateDefault, back_document: '' }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItem(prev => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (content: string, targetName: 'template' | 'back_document') => {
    setItem(prev => ({ ...prev, [targetName]: content }));
  };

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
          </div>
        </div>
      `,
      'qrcode_validacao': QRCODE_PLACEHOLDER_HTML,
    };

    editor.insertContent(htmlMap[variableKey] || `{{${variableKey}}}`);
  };

  const substituirPlaceholderQRCodePorMascara = (html: string) => {
    const regex = /<div[^>]*class="mceNonEditable"[^>]*data-mask-key="qrcode_validacao"[^>]*>.*?<\/div>/gs;
    return html.replace(regex, '{{qrcode_validacao}}');
  };

  const substituirAssinaturaInstrutoresPorMascara = (html: string) => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBorder) {
      toast.error('Selecione uma moldura personalizada');
      return;
    }

    if (!item.name || !item.template) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setDisabledSubmit(true);

    try {
      let templateTreated = substituirPlaceholderQRCodePorMascara(item.template);
      templateTreated = substituirAssinaturaInstrutoresPorMascara(templateTreated);

      let backDocumentTreated = substituirPlaceholderQRCodePorMascara(item.back_document ?? '');
      backDocumentTreated = substituirAssinaturaInstrutoresPorMascara(backDocumentTreated);

      const payload = {
        name: item.name,
        template: templateTreated,
        back_document: backDocumentTreated,
        orientation: item.orientation,
        frame_type: item.frame_type,
        frame_color: null,
        frame_id: selectedBorder,
        type_id: 1,
      };

      const template = await api.post('/document-templates', payload);
      await api.post('/courses', {
        name: item.name,
        number_of_hours_studied: item.number_of_hours_studied || '0',
        certificate_id: template.data?.id,
      });

      const instructorsResponse = await api.get('/instructors?all=1').catch(() => null);
      const hasInstructors = instructorsResponse && Array.isArray(instructorsResponse.data) && instructorsResponse.data.length > 0;

      if (hasInstructors) {
        Swal.fire({
          icon: 'success',
          title: 'Curso criado (V2)!',
          text: 'Nova versão de cadastro concluída com sucesso. O que deseja fazer a seguir?',
          showCancelButton: true,
          confirmButtonText: 'Ir para cursos',
          cancelButtonText: 'Cadastrar instrutor',
          confirmButtonColor: '#10b981',
          cancelButtonColor: '#3b82f6',
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.cancel) {
            navigate('/instructors/create');
          } else {
            navigate('/courses');
          }
        });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Curso criado (V2)!',
          text: 'Não encontramos instrutores cadastrados. Cadastre um instrutor para continuar.',
          showCancelButton: true,
          confirmButtonText: 'Cadastrar instrutor',
          cancelButtonText: 'Ir para cursos',
          confirmButtonColor: '#3b82f6',
          cancelButtonColor: '#6b7280',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/instructors/create');
          } else {
            navigate('/courses');
          }
        });
      }
    } catch {
      toast.error('Erro ao salvar curso na versão V2');
    } finally {
      setDisabledSubmit(false);
    }
  };

  return (
    <Fragment>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardBody>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <div>
                <h5 className="mb-1">Cadastro de Curso · V2</h5>
                <small className="text-muted">Versão de teste com organização moderna e fluxo simplificado.</small>
              </div>
              <Badge bg="info">Teste /courses/create2</Badge>
            </div>

            <Row className="g-3">
              <Col md={8}>
                <Form.Label>Nome do Curso</Form.Label>
                <Form.Control
                  name="name"
                  value={item.name}
                  onChange={handleChange}
                  type="text"
                  required
                  placeholder="Nome do curso"
                />
              </Col>
              <Col md={4}>
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
              </Col>
            </Row>

            <Card className="mt-3 border-0 bg-light">
              <CardBody>
                <Form.Label className="fw-semibold mb-2">Molduras</Form.Label>
                <div className="d-flex flex-wrap align-items-center gap-2">
                  {borders.slice(0, 8).map(border => (
                    <button
                      key={border.id}
                      type="button"
                      onClick={() => setSelectedBorder(border.id)}
                      className="btn p-0"
                      style={{ border: 'none', background: 'transparent' }}
                    >
                      <img
                        src={border.frame}
                        alt="Moldura"
                        style={{
                          border: selectedBorder === border.id ? '3px solid #0d6efd' : '2px solid #ccc',
                          borderRadius: 8,
                          width: 72,
                          height: 72,
                          objectFit: 'cover',
                        }}
                      />
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card className="mt-3 border-0 bg-light">
              <CardBody>
                <Form.Label className="fw-semibold mb-2">Máscaras rápidas</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {masks.map(mask => (
                    <Button
                      key={mask.key}
                      variant="outline-primary"
                      size="sm"
                      onClick={() => insertVariable(mask.key)}
                    >
                      {mask.label}
                    </Button>
                  ))}
                </div>
              </CardBody>
            </Card>

            <div className="mt-3">
              <Nav variant="tabs" activeKey={tabSelectedCertificate} onSelect={(selected) => selected && setTabSelectedCertificate(selected)}>
                <Nav.Item><Nav.Link eventKey="/front">Frente</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="/back">Verso (Opcional)</Nav.Link></Nav.Item>
              </Nav>

              <div className="mt-3" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <div style={{ minWidth: 320 }}>
                  <Editor
                    height={editorSize.height}
                    width={editorSize.width}
                    maxWidth={'100%'}
                    value={tabSelectedCertificate === '/front' ? (item.template || '') : (item.back_document || '')}
                    onEditorChange={content => handleEditorChange(content, tabSelectedCertificate === '/front' ? 'template' : 'back_document')}
                    onInit={(_evt, editor) => (editorRef.current = editor)}
                  />
                </div>
              </div>
            </div>

            <Row className="mt-4 g-2">
              <Col xs={12} md={6}>
                <Button className="w-100 w-md-auto" variant="light" onClick={() => navigate('/courses')}>
                  Voltar
                </Button>
              </Col>
              <Col xs={12} md={6} className="d-flex justify-content-md-end">
                <Button className="w-100 w-md-auto" variant="primary" type="submit" disabled={disabledSubmit}>
                  {disabledSubmit ? 'Salvando...' : 'Cadastrar Curso (V2)'}
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </form>
    </Fragment>
  );
};

export default CourseV2;
