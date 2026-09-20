import React, { FC, Fragment, useEffect, useState } from 'react';
import { Button, Card, CardBody, Col, Row } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '@/src/lib/api';
import { formatDate } from '@/src/lib/helper';

interface CourseData {
  id: number;
  name: string;
  number_of_hours_studied?: string | number;
  created_at?: string;
  certificate_template?: {
    template?: string | null;
    back_document?: string | null;
  };
}

const CourseView: FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseData | null>(null);

  useEffect(() => {
    if (!courseId) {
      navigate('/courses');
      return;
    }

    api
      .get(`/courses/${courseId}`)
      .then((response) => {
        setCourse(response.data?.data ?? response.data);
      })
      .catch(() => {
        navigate('/courses');
      });
  }, [courseId]);

  if (!course) {
    return null;
  }

  const programContent = course.certificate_template?.back_document || course.certificate_template?.template || '';

  return (
    <Fragment>
      <div className="modern-page-header">
        <div>
          <Link to="/courses" className="btn btn-sm btn-light mb-2" style={{ borderRadius: '8px', fontWeight: 500 }}>
             <i className="bi bi-arrow-left"></i> Voltar para a Lista
          </Link>
          <h1 className="page-title">Visualização do Curso</h1>
          <p className="page-subtitle">Detalhes e conteúdo programático do curso</p>
        </div>
        <div className="page-actions">
          <Link to={`/courses/${course.id}`} className="btn-primary-custom px-4">
             <i className="bi bi-pencil"></i> Editar Curso
          </Link>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-header">
          <span className="content-card-title">Informações Básicas</span>
        </div>
        <div className="content-card-body">
          <Row className="mb-2 g-4">
            <Col md={5}>
              <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Nome do Curso</small>
              <div className="modern-table-name fw-medium" style={{ fontSize: '1.1rem' }}>{course.name || '-'}</div>
            </Col>
            <Col md={3}>
              <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Carga Horária</small>
              <div className="modern-table-name fw-medium" style={{ fontSize: '1.1rem' }}>{course.number_of_hours_studied ?? '-'} Horas</div>
            </Col>
            <Col md={4}>
              <small className="modern-table-date d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Data de Cadastro</small>
              <div className="modern-table-name fw-medium" style={{ fontSize: '1.1rem' }}>{course.created_at ? formatDate(course.created_at) : '-'}</div>
            </Col>
          </Row>
        </div>
      </div>

      <div className="content-card mt-3">
        <div className="content-card-header">
          <span className="content-card-title">Conteúdo Programático</span>
        </div>
        <div className="content-card-body">
          {programContent ? (
          <div className="modern-html-content p-1" style={{ minHeight: '120px', fontSize: '1.05rem', lineHeight: '1.6' }}>
            <div dangerouslySetInnerHTML={{ __html: programContent }} />
          </div>
          ) : (
            <div className="text-muted p-3 text-center" style={{ border: '1px dashed #e5e7eb', borderRadius: '8px' }}>
              Nenhum conteúdo programático foi cadastrado para este curso.
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default CourseView;
