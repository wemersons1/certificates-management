import React, { FC } from "react";
import { Card, Col, Row } from "react-bootstrap";
import DonutChart from "../../charts/DonutChart/DonutChart";

interface OrderStatusGraphCardProps {
  labels: string[];
  values: number[];
  title: string;
  width?: string | number;
  donutSize?: string;
  tooltipFormatter?: (value: number, total: number) => string;
}

const statusColors: { [key: string]: string } = {
  "Pendente de Confirmação": "rgb(245,184,73)",
  "Pendente de Envio": "rgb(245,150,50)",
  "Em Trânsito": "rgb(73,182,245)",
  "Entregue": "rgb(38,191,148)",
  "Cancelado": "rgb(35, 35, 35)",
  "Devolução": "rgb(230,83,60)",
  "Novidades": "rgb(151, 103, 255)",
  "Indenizado": "rgb(100,160,220)",
  "Não traqueado": "rgb(130,130,130)",
};

const OrderStatusGraphCard: FC<OrderStatusGraphCardProps> = ({
  labels,
  values,
  title,
  width = "100%",
  donutSize = "65%",
  tooltipFormatter = (value, total) => {
    const percentage = ((value / total) * 100).toFixed(1);
    return `${value} (${percentage}%)`;
  },
}) => {
  const sortedLegend = labels
    .map((label, index) => ({
      label,
      value: values[index],
      color: statusColors[label] || "#cccccc",
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = values.reduce((acc, currentValue) => acc + currentValue, 0);

  // Verifica se não há dados
  const hasData = total > 0;

  return (
    <Col>
      <Card className="custom-card" style={{ borderRadius: "12px", height: "392px" }}>
        <Card.Header>
          <Card.Title>{title}</Card.Title>
        </Card.Header>
        <Card.Body className="d-flex justify-content-center align-items-center mb-4" style={{ height: "100%" }}>
          {hasData ? (
            <>
              {/* Gráfico de Rosca */}
              <div style={{ width: "50%" }}>
                <DonutChart
                  labels={sortedLegend.map(item => item.label)}
                  values={sortedLegend.map(item => item.value)}
                  colors={sortedLegend.map(item => item.color)}
                  width={width}
                  donutSize={donutSize}
                  tooltipFormatter={tooltipFormatter}
                />
              </div>

              {/* Legenda ordenada */}
              <div style={{ width: "50%" }}>
                {sortedLegend.map(({ label, value, color }, index) => (
                  <Row key={index} className="mb-2 align-items-center">
                    <Col xs={1}>
                      <span
                        style={{
                          display: "inline-block",
                          width: "10px",
                          height: "10px",
                          backgroundColor: color,
                          borderRadius: "50%",
                        }}
                      ></span>
                    </Col>
                    <Col>
                      <span>{label}:</span>
                    </Col>
                    <Col className="fw-semibold" style={{ textAlign: "right" }}>
                      {value}
                    </Col>
                    <Col className="fw-semibold" style={{ textAlign: "right" }}>
                      {`${((value / total) * 100).toFixed()}%`}
                    </Col>
                  </Row>
                ))}
              </div>
            </>
          ) : (
            <div className="text-muted" style={{ textAlign: "center", fontSize: "16px" }}>
              Nenhum dado encontrado
            </div>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
};

export default OrderStatusGraphCard;
