import React, { FC, Fragment, useState } from "react";
import { Card, Col, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import togglelogo from "../../../assets/images/brand-logos/toggle-logo.png";
import { FiMail, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import api from "../../../lib/api";

interface CardInsertEmail {
  title: string;
  description: string;
}

const CardInsertEmail: FC<CardInsertEmail> = ({ title, description }) => {
  const [email, setEmail] = useState<string>('');
  const [disabledButtonConfirmEmail, setDisabledButtonConfirmEmail] = useState<boolean>(false);
  const navigate = useNavigate();
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setDisabledButtonConfirmEmail(true);
    const data = {email}
    api.post('/forgot-password', data).then(response => {
      navigate('/recover-password-success');
    }).then(response => {

    }).finally(() => {
      setDisabledButtonConfirmEmail(false);
    });
  };

  return (
    <Fragment>
      <div className="page error-bg" id="particles-js">
        <div className="error-page">
          <div className="container-lg">
            <div className="row justify-content-center align-items-center h-100">
              <Col xxl={4} xl={5} lg={5} md={6} sm={8} className="col-12">
                <Card>
                  <Card.Body className="p-5 rectangle3">
                    <Link to="/dashboards/sales">
                      <img
                        src={togglelogo}
                        alt="logo"
                        className="desktop-logo mb-1"
                        style={{ width: "30px", height: "auto", objectFit: "contain" }}
                      />
                    </Link>
                    <p className="h5 fw-semibold mb-2 text-center">{title}</p>
                    <p className="mb-4 text-muted op-7 fw-normal text-center">{description}</p>
                    
                    <Form onSubmit={handleSubmit}>
                      <Form.Group controlId="formEmail">
                        <Form.Label style={{ fontWeight: "600" }}>
                          E-mail <span style={{ color: "red" }}>*</span>
                        </Form.Label>
                        <div className="input-group mb-3">
                          <span
                            className="input-group-text"
                            style={{
                              backgroundColor: "#FFF",
                              borderRight: "none",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <FiMail />
                          </span>
                          <Form.Control
                            type="email"
                            placeholder="Insira o e-mail"
                            required
                            disabled={disabledButtonConfirmEmail}
                            style={{
                              borderLeft: "none",
                              boxShadow: "none",
                            }}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                          />
                        </div>
                      </Form.Group>
                      <button
                        disabled={disabledButtonConfirmEmail}
                        type="submit"
                        className="btn btn-lg btn-primary w-100 d-flex align-items-center justify-content-center"
                        style={{ backgroundColor: "#6c3bd1" }} // cor de fundo roxa
                      >
                        {disabledButtonConfirmEmail ? 'Estamos processando...' : 'Enviar'} <FiArrowRight style={{ marginLeft: "10px" }} />
                      </button>

                    <br></br>
                      <div className="text-start mb-3">
                        <Link to="/login" className="text-decoration-none d-flex align-items-center" style={{color: "blue"}}>
                          <FiArrowLeft className="me-1" />
                          Voltar ao Login
                        </Link>
                      </div>
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

export default CardInsertEmail;
