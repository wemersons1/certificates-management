import React, { FC, Fragment, useContext, useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, Col, Row } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '@/src/lib/api';
import { formatDate } from '@/src/lib/helper';
import AppContext from '@/src/AppContext/Context';

interface UserData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  active?: boolean;
  is_main_user?: boolean;
  welcome_message_sent?: boolean;
  created_at?: string;
  role?: { name: string };
  company?: { name: string };
  entity?: { 
    name: string;
    business_segment?: { name: string };
  };
  registration_origin?: 'website' | 'google' | 'linkedin' | 'facebook' | null;
}

const UserView: FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { checkRole } = useContext(AppContext);
  const [userData, setUserData] = useState<UserData | null>(null);

  const originLabelMap: Record<string, string> = {
    website: 'Normal',
    google: 'Google',
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
  };

  useEffect(() => {
    if (!userId) {
      navigate('/users');
      return;
    }

    api
      .get(`/users/${userId}`)
      .then((response) => {
        setUserData(response.data?.data ?? response.data);
      })
      .catch(() => {
        navigate('/users');
      });
  }, [userId]);

  if (!userData) {
    return null;
  }

  const registrationOrigin = userData.registration_origin ?? 'website';

  return (
    <Fragment>
      <div className="modern-page-header">
        <div>
          <Link to="/users" className="btn btn-sm btn-light mb-2" style={{ borderRadius: '8px', fontWeight: 500 }}>
             <i className="bi bi-arrow-left"></i> Voltar para a Lista
          </Link>
          <h1 className="page-title">Visualização do Usuário</h1>
          <p className="page-subtitle">Detalhes do cadastro do usuário no sistema</p>
        </div>
        <div className="page-actions">
          <Link to={`/users/${userData.id}`} className="btn-primary-custom px-4">
             <i className="bi bi-pencil"></i> Editar Usuário
          </Link>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-header">
          <span className="content-card-title">Dados do Usuário</span>
        </div>
        <div className="content-card-body">
          <Row className="mb-4 g-4">
            <Col md={3}>
              <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>ID do Sistema</small>
              <div className="modern-table-name fw-medium" style={{ fontSize: '0.95rem' }}>#{userData.id}</div>
            </Col>
            <Col md={9}>
              <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Nome Completo</small>
              <div className="modern-table-name fw-medium" style={{ fontSize: '0.95rem' }}>{userData.name || '-'}</div>
            </Col>
            <Col md={6}>
              <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Endereço de E-mail</small>
              <div className="modern-table-name fw-medium" style={{ fontSize: '0.95rem' }}>{userData.email || '-'}</div>
            </Col>
            <Col md={6}>
              <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Telefone / Celular</small>
              <div className="modern-table-name fw-medium" style={{ fontSize: '0.95rem' }}>{userData.phone || '-'}</div>
            </Col>
          </Row>

          <Row className="mb-4 g-4">
            <Col md={4}>
              <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Perfil de Acesso</small>
              <div className="modern-table-name fw-medium" style={{ fontSize: '0.95rem' }}>{userData.role?.name || '-'}</div>
            </Col>
            <Col md={4}>
              <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Empresa Vinculada</small>
              <div className="modern-table-name fw-medium" style={{ fontSize: '0.95rem' }}>{userData.company?.name || '-'}</div>
            </Col>
            <Col md={4}>
              <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Entidade Administrativa</small>
              <div className="modern-table-name fw-medium" style={{ fontSize: '0.95rem' }}>{userData.entity?.name || '-'}</div>
            </Col>
            {checkRole('Master') && userData.entity?.business_segment?.name && (
              <Col md={12}>
                <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Segmento da Empresa</small>
                <div className="modern-table-name fw-medium" style={{ fontSize: '0.95rem' }}>
                  <i className="bi bi-tag me-1 text-primary"></i>
                  {userData.entity.business_segment.name}
                </div>
              </Col>
            )}
          </Row>

          <Row className="mb-4 g-4">
            <Col md={4}>
              <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Origem do Cadastro</small>
              <div className="modern-table-name fw-medium" style={{ fontSize: '0.95rem' }}>{originLabelMap[registrationOrigin] ?? 'Normal'}</div>
            </Col>
            <Col md={4}>
              <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Data de Cadastro</small>
              <div className="modern-table-name fw-medium" style={{ fontSize: '0.95rem' }}>{userData.created_at ? formatDate(userData.created_at) : '-'}</div>
            </Col>
            <Col md={4}>
              <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Status no Sistema</small>
              <div className="d-flex flex-wrap gap-2 mt-1">
                <Badge bg={userData.active ? 'success' : 'secondary'}>{userData.active ? 'Ativo' : 'Inativo'}</Badge>
                <Badge bg={userData.is_main_user ? 'primary' : 'light'} text={userData.is_main_user ? undefined : 'dark'}>
                  {userData.is_main_user ? 'Usuário Principal' : 'Usuário Comum'}
                </Badge>
                <Badge bg={userData.welcome_message_sent ? 'success' : 'warning'}>
                  {userData.welcome_message_sent ? 'Boas-vindas Enviada' : 'Sem Boas-vindas'}
                </Badge>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Fragment>
  );
};

export default UserView;
