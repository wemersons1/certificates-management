import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface MainDuoCardProps {
  title1: string;
  value1: string | number;
  percentage1?: string;
  title2: string;
  value2: string | number;
  percentage2?: string;
  icon: string;
  bgColor: string; // Cor de fundo dinâmica
}

const MainDuoCard: React.FC<MainDuoCardProps> = ({ title1, value1, percentage1, title2, value2, percentage2, icon, bgColor }) => {
  return (
    <div className="col flex">
      <div className="card custom-card" style={{padding: '10px', backgroundColor: bgColor, borderRadius: '12px' }}>
        {/* Card com cor de fundo dinâmica e bordas arredondadas */}
        <Card.Body className="p-1 d-flex align-items-center">
          {/* Ícone com fundo quadrado e bordas arredondadas */}
          <div className="me-3 d-flex align-items-center justify-content-center rounded" 
            style={{ 
              minWidth: '40px', 
              height: '40px', 
              fontSize: '24px', 
              backgroundColor: 'rgba(255, 255, 255, 0.15)' // Fundo branco com opacidade baixa
            }}>
            <i className={`text-light ${icon}`}></i>
          </div>
          <div className="d-flex flex-column w-100">
            {/* Primeira coluna de dados */}
            <div className="d-flex justify-content-between">
              <div>
                <p className="fw-medium mb-1 text-light" style={{ fontSize: '12px' }}>{title1}</p>
                <h3 className="mb-0 text-light" style={{ fontSize: '24px' }}>{value1}</h3> {/* Valor 1 */}
                <span className="badge text-light rounded-pill" 
                  style={{ 
                    fontSize: '12px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.15)' // Fundo branco com opacidade baixa
                  }}>
                  {percentage1}
                  <i className="fe fe-arrow-up" style={{ marginLeft: '5px' }}></i> {/* Seta ajustada */}
                </span>
              </div>
              {/* Separador */}
              <div className="d-flex align-items-center">
                <div className="border-start mx-3" style={{ height: '40px', borderColor: 'rgba(255, 255, 255, 0.3)' }}></div>
              </div>
              {/* Segunda coluna de dados */}
              <div>
                <p className="fw-medium mb-1 text-light" style={{ fontSize: '12px' }}>{title2}</p>
                <h3 className="mb-0 text-light" style={{ fontSize: '24px' }}>{value2}</h3> {/* Valor 2 */}
                <p className="text-light mt-2" style={{ fontSize: '12px' }}>Previsto: {percentage2}</p> {/* Percentage 2 como texto de previsão */}
              </div>
            </div>
          </div>
          <div className="ms-auto d-flex align-items-end" style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
            <Link to="#" className="text-light fs-12 text-decoration-none">
              Ver mais
            </Link>
          </div>
        </Card.Body>
      </div>
    </div>
  );
};

export default MainDuoCard;
