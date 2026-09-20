import React from "react";
import { Col, Row, Card } from "react-bootstrap";

interface OrdersInfoProps {
  orderId: string; 
  orderInfo: {
    dataOrders: string; 
    carrier: string; 
    shippingGuide: string; 
    dropiLink: string; 
    shopifyLink: string; 
    rocketLink: string; 
  };
}

const OrdersInfos: React.FC<OrdersInfoProps> = ({ orderId, orderInfo }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Informações do Pedido</Card.Title>
        <Row>
          <Col>
            <strong>Data:</strong> {formatDate(orderInfo.dataOrders)}
          </Col>
          <Col>
            <strong>Transportadora:</strong> {orderInfo.carrier}
          </Col>
          <Col>
            <strong>Shipping Guide:</strong> {orderInfo.shippingGuide}
          </Col>
        </Row>
        <Row className="mt-2">
          <Col>
            <strong>dropi:</strong>
            <a
              href={orderInfo.dropiLink}
              style={{ color: "blue", marginLeft: "5px" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Acessar pedido
              <i
                className="fas fa-external-link-alt"
                style={{
                  fontSize: "12px",
                  color: "blue",
                  marginLeft: "8px",
                }}
              ></i>
            </a>
          </Col>
          <Col>
            <strong>Shopify:</strong>
            <a
              href={orderInfo.shopifyLink}
              style={{ color: "blue", marginLeft: "5px" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Acessar pedido
              <i
                className="fas fa-external-link-alt"
                style={{
                  fontSize: "12px",
                  color: "blue",
                  marginLeft: "8px",
                }}
              ></i>
            </a>
          </Col>
          <Col>
            <strong>Rocket:</strong>
            <a
              href={orderInfo.rocketLink}
              style={{ color: "blue", marginLeft: "5px" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Acessar pedido
              <i
                className="fas fa-external-link-alt"
                style={{
                  fontSize: "12px",
                  color: "blue",
                  marginLeft: "8px",
                }}
              ></i>
            </a>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default OrdersInfos;
