
import React, { FC} from "react";
import {Card, Row, Col} from "react-bootstrap";
import { Link } from "react-router-dom"; 
const Navigation: FC = () => (
    <Row className="mb-4 text-center">
      {[
        { name: "Dashboard", icon: "la-chart-line", route: "/dashboard" },
        { name: "Perfil", icon: "la-user", route: "/dashboard" },
        { name: "Meu Plano", icon: "la-file-alt", route: "/dashboard" },
        { name: "Pedidos", icon: "la-box", route: "/orders" },
        { name: "Produtos", icon: "la-tags", route: "/products" },
        { name: "Anúncios", icon: "la-bullhorn", route: "/ads" },
        { name: "Integrações", icon: "la-plug", route: "/integrations" },
        { name: "Precificação", icon: "la-money-bill", route: "/precification" },
      ].map((item, index) => (
        <Col key={index}>
          <Link to={item.route} style={{ textDecoration: "none" }}> {/* Adiciona o Link e a rota */}
            <Card className="p-3 border-0 shadow-sm rounded">
              <i className={`la ${item.icon} mb-2 text-primary`} style={{ fontSize: "34px" }}></i>
              <Card.Text className="text-dark">{item.name}</Card.Text>
            </Card>
          </Link>
        </Col>
      ))}
    </Row>
  );

  export default Navigation;
  