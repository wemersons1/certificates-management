import React, { FC, Fragment} from "react";
import { Card, Col, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import desktoplogo from "../../../assets/images/brand-logos/desktop-logo.png";
import {FiCheckCircle } from "react-icons/fi"; 

interface CardInfoProps {
  title: string;
  description: string;
}

const CardInfo: FC<CardInfoProps> = ({ title, description }) => {

  return (
    <Fragment>
      <div className="page error-bg" id="particles-js">
        <div className="error-page">
          <div className="container-lg">
            <div className="row justify-content-center align-items-center h-100">
              <Col xxl={4} xl={5} lg={5} md={6} sm={8} className="col-12">
                <Card className="custom-card rectangle2">
                  <Card.Body className="p-5 rectangle3">
                    <Link to={`/dashboards/sales`}>
                    
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
  <img 
    src={desktoplogo} 
    alt="logo" 
    className="desktop-logo mb-3"
    style={{ width: "100px", height: "auto", objectFit: "contain" }}
  />
  </div>
                      
                    </Link>
                    <p className="h5 fw-semibold mb-2 text-center">{title}</p>
                    <p className="mb-4 text-muted op-7 fw-normal text-center">{description}</p>
                    <Form>
                     
                      <Link
                        to={'/login'}
                        className="btn btn-lg btn-primary w-100 d-flex align-items-center justify-content-center"
                      >
                        Acessar Scalefy <FiCheckCircle style={{ marginLeft: '10px' }} />
                      </Link>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default CardInfo;
