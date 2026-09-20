import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Form, InputGroup, Row } from "react-bootstrap";
import { RiArrowLeftLine, RiArrowRightLine } from "react-icons/ri";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import StepIndicator from "../StepIndicator/StepIndicator";
import api from "@/src/lib/api";
import CurrencySelect from "../../../form/CurrencySelect/CurrencySelect";
import align from './align.css';
import CurrencySelectBRL from "../../../form/CurrencySelect/CurrencySelectBRL";
import { useTranslation } from "react-i18next";


// Tipagem das props que serão passadas para o WizardSetup
interface WizardSetupProps {
  onStepChange: (step: number) => void; // Função que será chamada quando o passo mudar
}

// Componente para cada passo do wizard
const Step = ({ children }: any) => children;

const Wizard = ({ step: currentIndex, ...props }: any) => {
  const steps = React.Children.toArray(props.children);
  const { t } = useTranslation();

  return (
    <div>
      {/* Renderizando o passo atual */}
      {steps[currentIndex]}

      {/* Botões de Navegação */}
      <div className="d-flex justify-content-between mt-4">
        {currentIndex > 0 && (
          <button
            onClick={() => {
                const previousStep = currentIndex - 1;
                props.onChange(currentIndex - 1)
                props.onStepChange(previousStep);
            }}
            className="btn btn-outline-light"
            style={{ display: "flex", alignItems: "center" }}
          >
            <RiArrowLeftLine style={{ marginRight: "8px" }} />
            {t("buttons.go_back")}
          </button>
        )}
        {currentIndex === 0 && (
          <div>
            <button
            onClick={() => props.onCancel()} // Função de cancelar passada por props
            className="btn btn-outline-danger ms-auto me-3" // Alinhado à direita
            style={{ display: "flex", alignItems: "center" }}
            >
              {t("buttons.cancel")}
            </button>
          </div>
            

        )}

        {currentIndex < steps.length - 1 ? (
          <button
            onClick={() => props.onNext()}
            className="btn btn-primary ms-auto" // Alinhado à direita
            disabled={!props.isNextEnabled}
            style={{ display: "flex", alignItems: "center" }}
          >
            {t("buttons.forward")}
            <RiArrowRightLine style={{ marginLeft: "8px" }} />
          </button>
          
        ) : (
          <button
            onClick={props.onSubmit}
            className="btn btn-primary ms-auto"
            style={{ display: "flex", alignItems: "center" }}
          >
            {props.isSaving ? t("status.saving") : t("buttons.complete")}
            {!props.isSaving && (
              <IoMdCheckmarkCircleOutline style={{ marginLeft: "8px" }} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const WizardSetup: React.FC<WizardSetupProps> = ({ onStepChange }) => {
  const [step, setStep] = useState(0); // Estado para controlar o passo atual
  const [formValues, setFormValues] = useState({
    name: "",
    country_id: 0,
    currency_id: 0,
    tax: 0,
    administrativeFee: 0,
  });

  
  const [isNextEnabled, setIsNextEnabled] = useState(false);
  const [countries, setCountries] = useState<{ is_active: boolean; id: number; name: string }[]>([]);
  const [currencies, setCurrencies] = useState<{ id: number; currency: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { t } = useTranslation();

  const navigate = useNavigate();

  useEffect(() => {
    api.get("/countries")
      .then((response) => {
        setCountries(response.data);
      })
      .catch((error) => {
        console.error("Error searching countries:", error);
      });
  }, []);

  useEffect(() => {
    api.get("/currency")
      .then((response) => {
        setCurrencies(response.data);
        console.log(currencies);
      })
      .catch((error) => {
        console.error("Error searching currencies:", error);
      });
  }, []);

  const formattedCurrencies = currencies.filter((c) => c.id === 2);

  const validateStep = () => {
    if (step === 0) {
      return formValues.name !== "" && formValues.country_id !== 0;
    }
    if (step === 1) {
      return formValues.currency_id !== 0;
    }
    return true;
  };

  useEffect(() => {
    setIsNextEnabled(validateStep());
  }, [formValues, step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value !== "") {
      setFormValues({ ...formValues, [e.target.name]: e.target.value });
    }
  };

  const handleNextStep = () => {
    if (validateStep()) {
      const newStep = step + 1;
      setStep(newStep);
      onStepChange(newStep); 
    }
  };

  const handleCurrencyChange = (selectedCurrency: string) => {
    const selectedCurrencyObj = currencies.find(
      (currency) => currency.currency === selectedCurrency
    );
  
    setFormValues((prevValues) => ({
      ...prevValues,
      currency_id: selectedCurrencyObj ? selectedCurrencyObj.id : 0,
    }));
  };
  


  const handleCancel = () => {
    navigate("/stores");
  };


  

  const handleSubmit = () => {
    setIsSaving(true);
    api.post("/client-store", {
      name: formValues.name,
      country_id: formValues.country_id,
      currency_id: formValues.currency_id,
      tax: formValues.tax,
      administrative_fee: formValues.administrativeFee,
    })
      .then((response) => {
        console.log("Form submitted succesffuly:", response.data);
        navigate("/stores");
      })
      .catch((error) => {
        console.error("Error submiting the form:", error);
      })
      .finally(() => {
        setIsSaving(false)
      });
  };

  return (
    <>
      {/* StepIndicator será renderizado aqui */}
      <StepIndicator currentStep={step} />
      <Wizard
        step={step}
        onChange={setStep}
        onNext={handleNextStep}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isNextEnabled={isNextEnabled}
        onStepChange={onStepChange}
        isSaving={isSaving}>
        {/* Passo 1 - Nome e País */}
        <Step>
          <h4 className="fw-bold mb-2">{t("pages.setup.form_title1")}</h4>
          <p className="mb-4 text-muted op-7 fw-normal">{t("pages.setup.form_subtitle1")}</p>
          <Form>
            <Row className="gy-3 mb-3">
              <Form.Group>
                <Form.Label>{t("pages.setup.store_name")}</Form.Label>
                <InputGroup>
                  <InputGroup.Text><i className="ri-store-line"></i></InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formValues.name}
                    onChange={handleInputChange}
                    placeholder={t("pages.setup.store_name_placeholder")}
                    required
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group>
                <Form.Label>{t("pages.setup.store_country")}</Form.Label>
                <InputGroup>
                  <InputGroup.Text><i className="ri-map-pin-line"></i></InputGroup.Text>
                <Form.Select
                    name="country_id"
                    value={formValues.country_id}
                    onChange={handleSelectChange}
                    required
                  >
                    {formValues.country_id === 0 && (
                      <option value={0}>{t("pages.setup.store_country_placeholder")}</option>
                    )}
                    {countries
                      .filter((country) => country.is_active) // Filtra apenas os países ativos
                      .map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                    ))}
                    
                  </Form.Select>


                </InputGroup>
              </Form.Group>
            </Row>
          </Form>
        </Step>

        {/* Passo 2 - Seleção de Moeda */}
        <Step>
          <h4 className="fw-bold mb-2">{t("pages.setup.form_title2")}</h4>
          <p className="mb-4 text-muted op-7 fw-normal">{t("pages.setup.form_subtitle2")}</p>
          <Form>
            <Row className="gy-3 mb-3">
              <Form.Group>
                <InputGroup style={{ display: "flex", alignItems: "center" }}>
                <div style={{height:'40px'}}>
                  <InputGroup.Text>
                    <i className="ri-money-dollar-circle-line"></i>
                  </InputGroup.Text>
                  </div>
                  <div style={{ flex: 1 , marginTop:'3.5px'}}>
                    <CurrencySelectBRL
                      value={formattedCurrencies.find((c) => c.id === formValues.currency_id)?.currency || ""}
                      onChange={handleCurrencyChange}
                    />
                  </div>
                </InputGroup>
              </Form.Group>
            </Row>
          </Form>
        </Step>

        {/* Passo 3 - Imposto e Taxa Administrativa */}
        <Step>
          <h4 className="fw-bold mb-2">{t("pages.setup.form_title3")}</h4>
          <p className="mb-4 text-muted op-7 fw-normal">{t("pages.setup.form_subtitle3")}</p>
          <Form>
            <Row className="gy-3 mb-3">
              <Col xl={6}>
                <Form.Group>
                  <Form.Label>{t("pages.setup.tax")}</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><i className="ri-bar-chart-box-line"></i></InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="tax"
                      value={formValues.tax}
                      onChange={handleInputChange}
                      placeholder="Informe o imposto (%)"
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col xl={6}>
                <Form.Group>
                  <Form.Label>{t("pages.setup.administrative_fee")}</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><i className="ri-file-list-line"></i></InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="administrativeFee"
                      value={formValues.administrativeFee}
                      onChange={handleInputChange}
                      placeholder="Informe a taxa administrativa (%)"
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Step>
      </Wizard>
    </>
  );
};

export default WizardSetup;
