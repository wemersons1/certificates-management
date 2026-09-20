import React, { FC, Fragment, useState, useContext } from "react";
import { Card, Col, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import togglelogo from "../../../assets/images/brand-logos/toggle-logo.png";
import api from "../../../lib/api";
import AppContext from "../../../AppContext/Context";
import { FiEye, FiEyeOff, FiLock, FiCheckCircle } from "react-icons/fi"; 

interface ResetPasswordProps {
  title: string;
  description: string;
}

const ResetPassword: FC<ResetPasswordProps> = ({ title, description }) => {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [disabledResetPasswordButton, setDisabledResetPasswordButton] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    setDisabledResetPasswordButton(true);
    const url = new URL(window.location.href);
    const hash = url.searchParams.get('code');

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    const data = {
      hash,
      password,
      password_confirmation: confirmPassword
    };

    api.post('/reset-password', data)
      .then(response => {
        toast.success("Senha alterada com sucesso!");

        setTimeout(() => {
          navigate('/password-sucess');
        }, 3000);
      })
      .catch(err => {
        setDisabledResetPasswordButton(false);
        toast.error("Erro ao alterar a senha.");
      })
  };

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
                      <img 
                        src={togglelogo} 
                        alt="logo" 
                        className="desktop-logo mb-1"
                        style={{ width: "30px", height: "auto", objectFit: "contain" }}
                      />
                    </Link>
                    <p className="h4 fw-semibold mb-2 text-center">{title}</p>
                    <p className="mb-4 text-muted op-7 fw-normal text-center">{description}</p>
                    <Form>
                      <Form.Group controlId="formPassword" className="mb-3 position-relative">
                        <Form.Label>Crie sua senha *</Form.Label>
                        <div className="d-flex align-items-center">
                          <FiLock className="position-absolute" style={{ left: '10px', fontSize: '15px', zIndex: 1 }} />
                          <Form.Control
                            type={showPassword ? "text" : "password"} 
                            placeholder="Crie sua senha"
                            value={password}
                            disabled={disabledResetPasswordButton}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ paddingLeft: '35px' }} 
                          />
                          <div onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer', position: 'absolute', right: '10px', zIndex: 1 }}>
                            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                          </div>
                        </div>
                      </Form.Group>

                      <Form.Group controlId="formConfirmPassword" className="mb-4 position-relative">
                        <Form.Label>Confirme sua senha *</Form.Label>
                        <div className="d-flex align-items-center">
                          <FiLock className="position-absolute" style={{ left: '10px', fontSize: '15px', zIndex: 1 }} />
                          <Form.Control
                            type={showPassword ? "text" : "password"} 
                            placeholder="Confirme sua senha"
                            value={confirmPassword}
                            disabled={disabledResetPasswordButton}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{ paddingLeft: '35px' }} 
                          />
                          <div onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer', position: 'absolute', right: '10px', zIndex: 1 }}>
                            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                          </div>
                        </div>
                      </Form.Group>

                      <button 
                        type="button"
                        disabled={disabledResetPasswordButton}
                        onClick={handleSubmit} 
                        className="btn btn-lg btn-primary w-100 d-flex align-items-center justify-content-center"
                      >
                        {disabledResetPasswordButton ? 'Estamos processando...' : 'Concluir'} <FiCheckCircle style={{ marginLeft: '10px' }} />
                      </button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </Fragment>
  );
};

export default ResetPassword;
