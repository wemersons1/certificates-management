import React from "react";
import { Col, Row, Card, Button } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";

interface ClientInfoProps {
  orderId: string; 
  clientInfo: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    address: string;
    numberOrder: string;
  };
}


const ClientInfos: React.FC<ClientInfoProps> = ({ orderId, clientInfo }) => {
  if (!clientInfo) {
    return <p>Informações do cliente não disponíveis.</p>;
  }

  return (
    <>
      <h3>Detalhar Pedido #{orderId}</h3> {}
      

      
      <Button 
  variant="outline-primary" 
  className="me-2 mt-3" 
  onClick={() => window.location.href = "/orders"} // Usando window.location.href para redirecionar
>
  Voltar
</Button>

      <div className="mb-4"></div>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Informações do Cliente</Card.Title>
          <Row>
            <Col>
              <strong>Nome:</strong> {clientInfo.name} {clientInfo.surname}
            </Col>
            <Col>
              <strong>E-mail:</strong> {clientInfo.email}
            </Col>
            <Col>
              <strong>Telefone:</strong>{" "}
              <a
                style={{ color: "blue", marginRight: "8px" }}
                href={`https://wa.me/${clientInfo.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {clientInfo.phone}
              </a>
              <i
                className="fab fa-whatsapp"
                style={{ fontSize: "20px", color: "#25D366" }}
              ></i>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col>
              <strong>Endereço:</strong> {clientInfo.address}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
};

export default ClientInfos;
