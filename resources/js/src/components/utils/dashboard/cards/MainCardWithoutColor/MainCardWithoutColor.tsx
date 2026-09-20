import React from 'react';
import { Card } from 'react-bootstrap';

interface MainCardWithoutColorProps {
  title: string;
  value: string | number;
  percentage?: number; // Tipo number para manipulação direta
  icon: string;
  iconColor: string;
}

const MainCardWithoutColor: React.FC<MainCardWithoutColorProps> = ({ title, value, percentage, icon, iconColor }) => {

  const iconBgStyles = {
    minWidth: '35px',
    height: '35px',
    backgroundColor: `rgba(${iconColor}, 0.15)`,
  };

  const iconStyles = {
    color: `rgb(${iconColor})`,
  };

  // Determina as cores do badge com base na porcentagem
  let badgeStyles = { color: '', backgroundColor: '' };

  if (percentage !== undefined && percentage > 0) {
    badgeStyles = { color: 'rgba(38, 191, 148, 1)', backgroundColor: 'rgba(38, 191, 148, 0.15)' };
  } else if (percentage !== undefined && percentage < 0) {
      badgeStyles = { color: 'rgba(230, 83, 60, 1)', backgroundColor: 'rgba(230, 83, 60, 0.15)' };
  } else {
      badgeStyles = { color: 'rgba(51, 51, 51, 1)', backgroundColor: 'rgba(119, 119, 119, 0.15)' };
  }


  return (
    <div className="col flex">
      <div className="card custom-card" style={{ padding: '10px', borderRadius: '12px' }}>
        <Card.Body className="p-1 d-flex align-items-center">
          <div className="me-3 d-flex align-items-center justify-content-center rounded" style={iconBgStyles}>
            <i className={`${icon} fs-24`} style={iconStyles}></i>
          </div>
          <div>
            <p className="fw-medium mb-1 fs-12 text-muted" style={{ fontSize: '12px' }}>{title}</p>
            <h3 className="mb-0" style={{ fontSize: '20px' }}>{value}</h3>
            {percentage !== undefined && (
              <div className="d-flex align-items-center mt-2">
                <span className="badge rounded-pill"
                  style={{
                    fontSize: '11px',
                    color: badgeStyles.color,
                    backgroundColor: badgeStyles.backgroundColor
                  }}>
                  {`${Math.abs(Math.round(percentage))}%`}
                  <i className={`fe ${percentage > 0 ? 'fe-arrow-up' : 'fe-arrow-down'}`} style={{ marginLeft: '5px' }}></i>
                </span>
              </div>
            )}
          </div>
        </Card.Body>
      </div>
    </div>
  );
};

export default MainCardWithoutColor;
