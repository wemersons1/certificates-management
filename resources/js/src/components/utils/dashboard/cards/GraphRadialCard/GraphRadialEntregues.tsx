// src/components/cards/GraphRadialCard/GraphRadialCard.tsx

import React, { FC, ReactNode } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import RadialChart from '../../charts/RadialChart/RadialChart';

interface Legend {
  label: string;
  value: ReactNode; 
}

interface GraphRadialEntreguesProps {
  title: string;
  subtitle: string;
  percentage: number;
  units: number;
  color: string;
  legends: Legend[];  // Lista de legendas
}

const GraphRadialEntregues: FC<GraphRadialEntreguesProps> = ({
  title,
  subtitle,
  percentage,
  units,
  color,
  legends,
}) => (
  <Card className="custom-card" style={{ borderRadius: '12px', height:'370px' }}>
    <Card.Header className="bg-white border-0">
      <Card.Title className="text-dark" style={{ fontSize: '1rem', fontWeight: 'bold' }}>
        {title}
      </Card.Title>
    </Card.Header>
    <Card.Body className="text-center">
      <RadialChart subtitle={subtitle} percentage={percentage} units={units} color={color} />
    </Card.Body>
    <Card.Footer className="bg-white border-0 pt-2">
      <Row className="border-top pt-3">
        {legends.map((legend, index) => (
          <Col
            key={index}
            className={`text-center ${index < legends.length - 1 ? 'border-end' : ''}`}
            style={{ fontSize: '0.9rem' }}
          >
            <p className='mb-1 fs-11'>{legend.label}</p>
            <p className="fw-semibold mb-0 fs-12">{legend.value}</p>
          </Col>
        ))}
      </Row>
    </Card.Footer>
  </Card>
);

export default GraphRadialEntregues;
