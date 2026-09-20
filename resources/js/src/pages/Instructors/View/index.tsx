import React, { FC, Fragment, useEffect, useState } from 'react';
import { Button, Card, CardBody, Col, Row } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '@/src/lib/api';
import { formatDate } from '@/src/lib/helper';

interface InstructorData {
  id: number;
  name: string;
  formation?: string;
  crea?: string;
  created_at?: string;
}

const InstructorView: FC = () => {
  const { instructorId } = useParams();
  const navigate = useNavigate();
  const [instructor, setInstructor] = useState<InstructorData | null>(null);

  useEffect(() => {
    if (!instructorId) {
      navigate('/instructors');
      return;
    }

    api
      .get(`/instructors/${instructorId}`)
      .then((response) => {
        setInstructor(response.data?.data ?? response.data);
      })
      .catch(() => {
        navigate('/instructors');
      });
  }, [instructorId]);

  if (!instructor) {
    return null;
  }

  return (
    <Fragment>
      <div className="modern-page-header">
        <div>
          <Link to="/instructors" className="btn btn-sm btn-light mb-2" style={{ borderRadius: '8px', fontWeight: 500 }}>
             <i className="bi bi-arrow-left"></i> Voltar para a Lista
          </Link>
          <h1 className="page-title">Visualização do Instrutor</h1>
          <p className="page-subtitle">Detalhes de cadastro e formação do instrutor</p>
        </div>
        <div className="page-actions">
          <Link to={`/instructors/${instructor.id}`} className="btn-primary-custom px-4">
             <i className="bi bi-pencil"></i> Editar Instrutor
          </Link>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-header">
          <span className="content-card-title">Dados do Instrutor</span>
        </div>
        <div className="content-card-body">
          <Row className="mb-4 g-4">
            <Col md={7}>
              <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Nome Completo</small>
              <div className="modern-table-name fw-medium" style={{ fontSize: '1.1rem' }}>{instructor.name || '-'}</div>
            </Col>
            <Col md={5}>
              <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Data de Cadastro</small>
              <div className="modern-table-name fw-medium" style={{ fontSize: '1.1rem' }}>{instructor.created_at ? formatDate(instructor.created_at) : '-'}</div>
            </Col>
          </Row>

          <Row className="mb-4 g-4">
            <Col md={7}>
              <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Formação / Especialidade</small>
              <div className="modern-table-name fw-medium" style={{ fontSize: '1.1rem' }}>{instructor.formation || '-'}</div>
            </Col>
            <Col md={5}>
              <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Registro Profissional (CREA)</small>
              <div className="modern-table-name fw-medium" style={{ fontSize: '1.1rem' }}>{instructor.crea || '-'}</div>
            </Col>
          </Row>
        </div>
      </div>
    </Fragment>
  );
};

export default InstructorView;
