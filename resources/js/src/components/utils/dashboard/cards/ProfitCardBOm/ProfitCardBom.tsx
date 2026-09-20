import React from 'react';
import { Card } from 'react-bootstrap';

interface ProfitCardBomProps {
  title: string;
  value: string;
  icon: string;
  type: 'real' | 'predicted';
}

const ProfitCardBom: React.FC<ProfitCardBomProps> = ({ title, value, icon, type }) => {
  // Configuração de estilos com base no tipo
  const isPredicted = type === 'predicted';
  const iconColor = isPredicted ? '#ffffff' : '#26BF94'; // Cor do ícone (branco para predicted, verde para real)
  const iconBackgroundColor = isPredicted ? '#540af5' : 'rgba(38, 191, 148, 0.15)'; // Fundo do ícone com 15% de opacidade para real
  const textColorClass = isPredicted ? 'text-primary' : 'text-dark'; // Classe de cor para o texto

  return (
    <div className="col flex">
      <div
        className="card custom-card"
        style={{
          padding: '10px',
          borderRadius: '12px',
          ...(isPredicted && { backgroundColor: '#e5dafe' }), // Aplica o backgroundColor somente se isPredicted for true
        }}
      >
        <Card.Body className="p-1 d-flex align-items-center">
          <div
            className="me-3 d-flex align-items-center justify-content-center rounded"
            style={{
              minWidth: '40px',
              height: '40px',
              fontSize: '24px',
              backgroundColor: iconBackgroundColor, // Cor de fundo do ícone
              color: iconColor, // Cor do ícone condicional
            }}
          >
            <i className={icon}></i> {/* Ícone com cor condicional */}
          </div>
          <div>
            <p className={`fw-medium mb-1 ${textColorClass}`} style={{ fontSize: '12px' }}>{title}</p> {/* Título com classe condicional */}
            <h3 className={`mb-0 ${textColorClass}`} style={{ fontSize: '24px' }}>{value}</h3> {/* Valor com classe condicional */}
          </div>
        </Card.Body>
      </div>
    </div>
  );
};

export default ProfitCardBom;
