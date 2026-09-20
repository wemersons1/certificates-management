import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import DashboardTooltip from '../../../../common/tooltips/DashboardTooltip';

interface MainCardProps {
  title: string;
  value: string | number;
  percentage: number; // Alterado para tipo number para facilitar a manipulação
  icon: string;
  bgColor: string; // Cor de fundo dinâmica
  showLink?: boolean; // Prop opcional para exibir o link
  tooltip?: string;
  onClick?: () => void;
}

const MainCard: React.FC<MainCardProps> = ({ title, value, percentage, icon, tooltip, bgColor, showLink, onClick }) => {
  // Formata o valor de percentage para o padrão "número%"
  const formattedPercentage = `${Math.abs(Math.round(percentage))}%`; // Math.abs para remover o sinal no valor exibido

  return (
    <div className="col flex" onClick={onClick} style={{cursor: onClick ? 'pointer' : 'default'}}>
      <div className="card custom-card" style={{ padding: '10px', backgroundColor: 'rgb('+bgColor+')', borderRadius: '12px' }}>
        {/* Aplicando a cor de fundo dinâmica e bordas arredondadas */}
        <Card.Body className="p-1 d-flex align-items-center">
          <div className="me-3 d-flex align-items-center justify-content-center rounded" 
            style={{ 
              minWidth: '40px', 
              height: '40px', 
              fontSize: '24px', 
              backgroundColor: 'rgba(255, 255, 255, 0.15)' // Fundo branco com opacidade baixa
            }}>
            {/* Ícone com fundo quadrado e bordas arredondadas */}
            <i className={`text-light ${icon}`}></i>
          </div>
          <div className="d-flex w-100 justify-content-between">
            <div>
              <p className="fw-medium mb-1 text-light" style={{ fontSize: '12px' }}>{title}</p>
              <h3 className="mb-0 text-light" style={{ fontSize: '20px' }}>{value}</h3> {/* Fonte maior */}
              <div className="d-flex align-items-center mt-2">
                <span className="badge text-light rounded-pill" 
                  style={{ 
                    fontSize: '11px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.15)' // Fundo branco com opacidade baixa
                  }}>
                  {formattedPercentage}
                  <i 
                    className={`fe ${percentage >= 0 ? 'fe-arrow-up' : 'fe-arrow-down'}`} // Seta dinâmica
                    style={{ marginLeft: '5px' }}
                  ></i>
                </span>
              </div>
              
            </div>
            {tooltip && (
              <div className="d-flex align-items-center justify-content-center">
                <DashboardTooltip message={tooltip} text="text-light"/>
              </div>
            )}
            
          </div>
          {showLink && (
            <div className="ms-auto d-flex align-items-end" style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
              <Link to="#" className="text-light fs-12 text-decoration-none">
                Ver mais
              </Link>
            </div>
          )}
        </Card.Body>
      </div>
    </div>
  );
};

export default MainCard;
