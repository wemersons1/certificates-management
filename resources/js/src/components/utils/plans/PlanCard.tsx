import { FC } from "react";
import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/images/brand-logos/logo-scalefy.png";

interface PlanCardProps {
    title: string,
    price: number,
    benefits: string[];
    link?: string,
    disabled?: boolean,
    highlighted?: boolean,
    buttonText?: string
    onClick?: () => void;
    
}

const PlanCard: FC<PlanCardProps> = ({title, price, benefits, link, disabled, highlighted, onClick, buttonText = "Assinar Plano"}) => {
    const navigate = useNavigate();

    const backgroundCard = highlighted ? "rgb(238,230,254)" : "";
    const backgroundButton = highlighted ? "rgb(84,10,245)" : ""; 
    const textButton = highlighted ? "white" : ""; 

    return (

        <div className="col-xxl-3 col-xl-4 col-lg-4 col-md-4 col-sm-12">
            <Card className="custom-card overflow-hidden" style={{backgroundColor: backgroundCard}}>
                <Card.Body className="p-0">
                    <div className="p-4">
                        <h6 className="fw-semibold text-center">{title}</h6>
                        <div className="pb-4 d-flex justify-content-center">
                            <div className="">
                                <p className="mt-1 text-xxl fw-semibold mb-0">R$ {price}</p>
                                <p className="text-muted op-5 fs-11 fw-semibold mb-0">por mês</p>
                            </div>
                        </div>
                        <ul className="list-check  fs-12 pt-1 mb-4">
                            {benefits.map((benefit, index) => (
                                <li key={index} className="mb-3">
                                    <i className="fas fa-check text-primary me-2"></i>
                                    <span className="text-muted">{benefit}</span>
                                
                                </li>
                            ))}
                        </ul>
                        <div className="d-grid">
                            <button type="button" className="btn btn-primary-light btn-wave" onClick={onClick} disabled={disabled} style={{backgroundColor: backgroundButton, color: textButton}}>{buttonText}</button>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </div>

    )
}


export default PlanCard
