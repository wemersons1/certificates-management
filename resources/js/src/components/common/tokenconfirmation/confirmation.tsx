import React, { FC, Fragment, useCallback, useContext, useRef, useState, useEffect } from "react";
import { Card, Col, Form, Row } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import togglelogo from "../../../assets/images/brand-logos/toggle-logo.png";
import api from "../../../lib/api";
import AppContext from "../../../AppContext/Context";

interface Confirmation {
  title?: string;
  message?: string;
  redirectRoute?: string;
}

const Confirmation: FC<Confirmation> = ({ 
  title = "Token de", 
  message = "Digite o seu token enviado por e-mail.", 
  redirectRoute = "/stores",  // Adicionando valor padrão para debug
}) => {
  const inputRefs = {
    one: useRef<HTMLInputElement>(null),
    two: useRef<HTMLInputElement>(null),
    three: useRef<HTMLInputElement>(null),
    four: useRef<HTMLInputElement>(null),
  };

  const navigate = useNavigate();
  const { user, setUserToken } = useContext(AppContext);
  const location = useLocation();
  const [token, setToken] = useState<string>("");
  const [plan, setPlan] = useState<string | null>(null);

  // Captura o parâmetro 'plan' da URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const planParam = queryParams.get('plan');
    setPlan(planParam);
  }, [location.search]);


  console.log('Plan da URL:', plan); // Log para verificar se o parâmetro 'plan' está correto

  const handleInputChange = useCallback(
    (currentId: keyof typeof inputRefs, nextId: keyof typeof inputRefs | undefined) => {
      const currentInput = inputRefs[currentId].current;
      if (currentInput && currentInput.value.length === 1 && nextId) {
        const nextInput = inputRefs[nextId]?.current;
        if (nextInput) {
          nextInput.focus();
        }
      }

      setToken(
        Object.values(inputRefs)
          .map(ref => ref.current?.value || "")
          .join("")
      );
    },
    [inputRefs]
  );

  const handleSubmit = () => {
    const code = `${inputRefs.one.current?.value || ""}${inputRefs.two.current?.value || ""}${inputRefs.three.current?.value || ""}${inputRefs.four.current?.value || ""}`;
    
    const data = {
      user_id: user.id,
      code,
      type_id: 1 // SIGNUP
    };

    api.post('/verify-code', data)
      .then(async response => {
        const { data: token } = response;

        if (token) {
          await setUserToken(token);

          console.log('Plano recebido', plan);
          
          if (plan === 'free') {
            try {
              await api.post("/create-free-contract");
              navigate(`/stores`);
            } catch (error) {
              console.error("Erro ao criar contrato:", error);
              toast.error("Ocorreu um erro ao criar o contrato gratuito.");
            }
          }
          else if (plan) {
            navigate(`/plans?plan=${plan}`)
          }
          else {
            // Caso o plano não esteja presente ou seja inválido
            toast.error("Plano inválido.");
            navigate('/login'); // Redireciona para a página inicial, ou uma página de erro
          }
        } else {
          toast.error('Código de confirmação inválido');
        }
      }).catch(err => {
        toast.error(err.response?.data?.message || 'Erro desconhecido');
      });
  };

  const signUpTokenHandle = () => {
    // Implementar lógica para reenviar o token ou similar
  };

  return (
    <Fragment>
      <div className="page error-bg" id="particles-js">
        <div className="error-page">
          <div className="container-lg">
            <div className="row justify-content-center align-items-center authentication authentication-basic h-100">
              <Col xxl={4} xl={5} lg={5} md={6} sm={8} className="col-12">
                <Card className="custom-card rectangle2">
                  <Card.Body className="p-5 rectangle3">
                    <Link to={`/dashboards/sales`}>
                      <img src={togglelogo} alt="logo" className="desktop-logo" />
                    </Link>
                    <p className="h4 fw-semibold mb-2 text-center">{title}</p>
                    <p className="mb-4 text-muted op-7 fw-normal text-center">{message}</p>
                    <div className="row gy-3">
                      <Col xl={12} className="mb-2">
                        <Row>
                          {["one", "two", "three", "four"].map((id, idx) => (
                            <div key={id} className="col-3">
                              <Form.Control
                                type="text"
                                id={`input_${idx + 1}`}
                                className="form-control-lg text-center"
                                maxLength={1}
                                onChange={() => handleInputChange(id as keyof typeof inputRefs, idx < 3 ? ["one", "two", "three", "four"][idx + 1] as keyof typeof inputRefs : undefined)}
                                ref={inputRefs[id as keyof typeof inputRefs]}
                              />
                            </div>
                          ))}
                        </Row>
                      </Col>
                      <Col xl={12} className="d-grid mt-4">
                        <button onClick={handleSubmit} className="btn btn-lg btn-primary">Verificar</button>
                      </Col>
                    </div>
                    <div className="text-center">
                      <p className="fs-12 text-danger mt-3 mb-0">
                        <Link to={`#`} onClick={signUpTokenHandle} className="text-primary ms-2">Ainda não recebeu o token?</Link>
                      </p>
                    </div>
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

export default Confirmation;
