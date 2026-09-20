import { FC, Fragment, useContext, useEffect, useRef, useState } from 'react';
import { Badge, Button, Card, CardBody, Col, Form, Modal, Row, Table } from "react-bootstrap";
import { clearMask, formatDate, isPublicEmail } from '@/src/lib/helper';
import api from '@/src/lib/api';
import Pagination from '@/src/components/common/pagination';
import Select2 from '@/src/components/common/select2';
import Swal from 'sweetalert2';
import Editor from '@/src/components/common/Editor/Editor';
import If from '@/src/components/common/if/if';
import { ToastContainer, toast } from 'react-toastify';
import AppContext from '@/src/AppContext/Context';
interface TemplatesProps {
  type?: 'email' | 'whatsapp';
};

interface Employee {
  id: number;
  name: string;
}
interface Company {
  id: number;
  name: string;
}

interface Course {
  course: {
    id: number;
    name: string;
  }
}
interface Email {
  id: number;
  title: string;
  type: string;
  created_at: string;
  active: boolean;
  employee: Employee;
  company: Company;
  content: string;
  contact: string;
  presence_list: Course;
}

const NotificationTemplates: FC<TemplatesProps> = ({ type = 'email' }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [items, setItems] = useState<Email[]>([]);
  const [name, setName] = useState<string>('');
  const [cnpj, setCnpj] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [config, setConfig] = useState<any>({
    title: '',
    content: '',
    active: false,
    send_me: false,
    default_sender: '',
    quantity_days_for_notification: 0,
    company_ids: [],
    employee_ids: [],
    is_verified: false
  });
  const [companies, setCompanies] = useState<{ value: number; label: string }[]>([]);
  const [employees, setEmployees] = useState<{ value: number; label: string }[]>([]);
  const [selectedItem, setSelectedItem] = useState<Email | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const { hasPermission, checkRole } = useContext(AppContext);
  const editorRef = useRef<any>(null);

  const masks = [
    { key: 'nome', label: 'Nome empresa, Nome empregado ou Entidade' },
    { key: 'nome_curso', label: 'Nome Curso' },
    { key: 'vencimento_curso', label: 'Data de vencimento do curso' },
    { key: 'lista_de_empregados', label: 'Lista de empregados com vencimento, só irá aparecer quando for enviado para entidade e empresa' }
  ];

  const insertVariable = (variable: string) => {
    const editor = editorRef.current;
    if (editor) {
      editor.insertContent(`{{${variable}}}`);
    }
  };
  const handleView = (item: Email) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const verifyEmail = async () => {
    if (config?.default_sender.length && isPublicEmail(config?.default_sender)) {
        toast('E-mail inválido. Utilize um e-mail corporativo como nome@empresa_exemplo.com.');
        return;
    }

    const response = await api.post('/ses/verify-email', {email: config?.default_sender});

    Swal.fire({
        title: 'Atenção',
        text: response?.data?.message ?? '',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
  }

  useEffect(() => {
    let params = {
      page: currentPage,
      name: '',
      email: '',
      cnpj: '',
      type
    };

    if (name.length) params['name'] = name;
    if (email.length) params['email'] = email;
    if (clearMask(cnpj).length) params['cnpj'] = clearMask(cnpj);

    api.get('/notification-send', { params }).then(response => {
      const { data, current_page, last_page } = response.data;
      setItems(data);
      setCurrentPage(current_page);
      setTotalPages(last_page);
    });
  }, [currentPage, name, email, cnpj, type]);

  const renderItems = () => {
    return items.map(item => (
      <tr key={item.id}>
        <td>{item.id}</td>
        <td>{item.contact}</td>
        <td>{item.title}</td>
        <td>{item.presence_list?.course?.name ?? '-'}</td>
        <td>{item.company?.name ?? ((!item.company?.name && !item.employee?.name) ? item?.entity?.name : '-')}</td>
        <td>{item.employee?.name ?? '-'}</td>
        <td>{formatDate(item.created_at)}</td>
        <td>
          <span
            className="action-btn action-btn-view"
            onClick={() => handleView(item)}
            title="Visualizar"
          >
            <i className="bi bi-eye"></i>
            Ver
          </span>
        </td>
      </tr>
    ));
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleOpenModal = async () => {
    try {
      const { data } = await api.get('/me');
      const configData = type === 'email' ? data.entity.notification_config_email : data.entity.notification_config_whatsapp;

      setConfig({
        id: configData?.id ?? null,
        title: configData?.title ?? '',
        content: configData?.content ?? '',
        active: configData?.active ?? false,
        send_me: configData?.send_me ?? false,
        company_ids: configData?.company_ids ? JSON.parse(configData?.company_ids) : [],
        employee_ids: configData?.employee_ids ? JSON.parse(configData?.employee_ids) : [],
        quantity_days_for_notification: configData?.quantity_days_for_notification ?? 0,
        default_sender: configData?.default_sender,
        is_verified: configData?.is_verified,
      });

      const companiesRes = await api.get('/companies?all=1');
      const companiesList = companiesRes.data.map((c: any) => ({
        value: c.id,
        label: c.name,
      }));

      setCompanies([{ value: 0, label: 'Selecionar todos' }, ...companiesList]);

      if (configData?.company_ids?.length) {
        const employeesRes = await api.get('/employees', {
          params: {
            all: 1,
            company_ids: JSON.parse(configData.company_ids),
          },
        });

        const employeesList = employeesRes.data.map((e: any) => ({
          value: e.id,
          label: e.name,
        }));
        setEmployees([{ value: 0, label: 'Selecionar todos' }, ...employeesList]);
      }

      setShowModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompanyChange = async (selected: any[]) => {
    if (selected.length && selected.filter((item: any) => item.value == 0).length) {
      selected = companies;
    }

    const ids = selected.map(i => i.value).filter(id => id !== 0);

    setConfig((prev: any) => ({ ...prev, company_ids: ids }));

    if (ids.length) {
      const employeesRes = await api.get('/employees', {
        params: {
          all: 1,
          company_ids: ids,
        },
      });

      const employeesList = employeesRes.data.map((e: any) => ({
        value: e.id,
        label: e.name,
      }));
      setEmployees([{ value: 0, label: 'Selecionar todos' }, ...employeesList]);
    } else {
      setEmployees([]);
      setConfig((prev: any) => ({ ...prev, employee_ids: [] }));
    }
  };

 const handleSave = async () => {
  if (config?.default_sender.length && isPublicEmail(config?.default_sender)) {
        toast('E-mail inválido. Utilize um e-mail corporativo como nome@empresa_exemplo.com.');
        return;
  }

  try {
    const response = await api.post('/notification-template-config', {
      ...config,
      type,
      company_ids: JSON.stringify(config.company_ids),
      employee_ids: JSON.stringify(config.employee_ids),
    });

    setShowModal(false);
    const haveMessageWarning = response?.data?.message?.includes("Foi encaminhado um");
    const title = haveMessageWarning ? 'Atenção' : 'Sucesso';

    const text = response?.data?.message;

    Swal.fire({
      title,
      text,
      icon: haveMessageWarning ? 'warning' : 'success',
      confirmButtonText: 'OK',
    });
  } catch (err) {
    console.error(err);
    Swal.fire({
      title: 'Erro!',
      text: 'Não foi possível salvar o template.',
      icon: 'error',
      confirmButtonText: 'Fechar',
    });
  }
};
  return (
    <Fragment>
      <Card>
        <CardBody>
          <h6 className="mb-3">📍 Filtros</h6>
          <Row>
            <Col xl={4}>
              <div className="mb-3">
                <Form.Label className="fs-14 text-dark">Nome</Form.Label>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
            </Col>
            <Col xl={4}>
              <div className="mb-3">
                <Form.Label className="fs-14 text-dark">Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
            </Col>
            <Col xl={4}>
              <div className="mb-3">
                <Form.Label className="fs-14 text-dark">CNPJ</Form.Label>
                <Form.Control
                  type="text"
                  value={cnpj}
                  onChange={e => setCnpj(e.target.value)}
                  placeholder="XX.XXX.XXX/0001-XX"
                />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="d-flex justify-content-between">
            <h6 className="mb-3">🔔 Notificações</h6>
             <If condition={checkRole('Entity') && hasPermission('Cadastrar')}>
                <Button variant="outline-primary" onClick={handleOpenModal}>
                  Configurar notificação
                </Button>
             </If>
          </div>
          <Row>
            <div className="table-responsive">
              <Table className="table-hover table-sm">
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Email</th>
                    <th>Título</th>
                    <th>Curso</th>
                    <th>Empresa</th>
                    <th>Aluno</th>
                    <th>Data de envio</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>{renderItems()}</tbody>
              </Table>
            </div>
            <div className="d-flex justify-content-end">
              <nav className="pagination-style-1 me-4 mt-3">
                <Pagination
                  totalPages={totalPages}
                  handlePageChange={handlePageChange}
                  currentPage={currentPage}
                />
              </nav>
            </div>
          </Row>
        </CardBody>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Configuração de 🔔 Notificações</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Check
                type="switch"
                id="active"
                label="Ativo?"
                checked={config.active}
                onChange={() => setConfig((prev : typeof config) => ({ ...prev, active: !prev.active }))}
              />

          <Form.Check
              type="switch"
              id="send_me"
              label="Me notificar?"
              checked={config.send_me}
              onChange={() => setConfig((prev: typeof config) => ({ ...prev, send_me: !prev.send_me }))}
            />
          <Row>
            <Col md={9}>
                <Form.Group className="mb-3">
                  <Form.Label className={'d-flex justify-content-between'}>
                    Remetente de envio
                    <If condition={config?.id && config.is_verified}>
                      <Badge bg={'success'}>E-mail verificado</Badge>
                    </If>
                    <If condition={config?.id && !config.is_verified && false}>
                      <Badge onClick={verifyEmail} style={{cursor: 'pointer'}}>E-mail não verificado, clique para verificar</Badge>
                    </If>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    disabled
                    value={config.default_sender}
                    onChange={e => setConfig((prev: typeof config) => ({ ...prev, default_sender: e.target.value }))}
                  />
                </Form.Group>
            </Col>
            <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Qtd dias antes de vencer</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    max={60}
                    value={config.quantity_days_for_notification}
                    onChange={e => setConfig((prev: typeof config) => ({ ...prev, quantity_days_for_notification: e.target.value }))}
                  />
                </Form.Group>
            </Col>
          </Row>
     
          <Form.Group className="mb-3">
            <Form.Label>Título do e-mail</Form.Label>
            <Form.Control
              type="text"
              required
              value={config.title.slice(0, 30)}
              onChange={e => setConfig((prev: typeof config) => ({ ...prev, title: e.target.value }))}
            />
          </Form.Group>
           <CardBody>
              <div className="p-2 border rounded">
                <strong>Personalize seu e-mail:</strong><br />
                <p className={'d-flex py-3 justify-content-between'}>
      
                  {masks.map(m => (
                    <Fragment key={m.key} >
                      <code style={{ cursor: 'pointer' }} title={m.label} onClick={() => insertVariable(m.key)}>
                        {'{{' + m.key + '}}'}
                      </code>
                      <br />
                    </Fragment>
                  ))}
                </p>
              </div>
            </CardBody>

         <Form.Group className="mb-3">
            <Form.Label>Conteúdo</Form.Label>
            <Editor
              value={config.content}
              onEditorChange={(value: string) =>
                setConfig((prev: typeof config) => ({ ...prev, content: value }))
              }
              onInit={(evt, editor) => (editorRef.current = editor)}
            />

         
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Empresas</Form.Label>
            <Select2
              isMulti
              options={companies}
              value={companies.filter(opt => config.company_ids.includes(opt.value))}
              onChange={(options: any) => handleCompanyChange(options)}
            />
          </Form.Group>

         <Form.Group className="mt-3">
          <Form.Label>Alunos</Form.Label>
          <Select2
            isMulti
            options={employees}
            value={employees.filter(opt =>
              config.employee_ids.includes(opt.value)
            )}
            onChange={(options: { value: number; label: string }[]) => {
              const ids = options.map(opt => opt.value);

              const selectedAll = ids.includes(0);
              const allEmployeeIds = employees.filter(e => e.value !== 0).map(e => e.value);

              if (selectedAll) {
                setConfig((prev: typeof config) => ({
                  ...prev,
                  employee_ids: allEmployeeIds,
                }));
              } else {
                setConfig((prev: typeof config) => ({
                  ...prev,
                  employee_ids: ids,
                }));
              }
            }}
          />
        </Form.Group>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="md">
        <Modal.Header closeButton>
          <Modal.Title>Detalhes da Notificação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
         {selectedItem && (
          <div className="fs-15">
            <p><strong>Empresa:</strong> {selectedItem.company?.name ?? '-'}</p>
            <p><strong>Aluno:</strong> {selectedItem.employee?.name ?? '-'}</p>
            <p><strong>E-mail:</strong> {selectedItem.email ?? '-'}</p>
            <p><strong>Data de Envio:</strong> {formatDate(selectedItem.created_at)}</p>
            <p><strong>Status:</strong> {selectedItem.active ? 'Ativo' : 'Inativo'}</p>

            <Card className="mt-4">
              <Card.Header className="fw-bold">{selectedItem.title}</Card.Header>
              <Card.Body>
                <div
                  className="text-dark"
                  style={{ fontSize: 14 }}
                  dangerouslySetInnerHTML={{ __html: selectedItem.content }}
                />
              </Card.Body>
            </Card>
          </div>
        )}

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer />
    </Fragment>
  );
};

export default NotificationTemplates;
