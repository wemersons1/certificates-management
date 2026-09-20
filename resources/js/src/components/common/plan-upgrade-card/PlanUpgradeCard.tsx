import { FC } from "react";
import { Badge, Button, Card, CardBody, Col } from "react-bootstrap";
import dollarsImage from "../../../assets/images/plans/dollars.png";
import { useNavigate } from "react-router-dom";

interface PlanUpgradeCardProps{
    planName: string;
    planLink: string;
}

const PlanUpgradeCard : FC<PlanUpgradeCardProps> = ({planName, planLink}) => {
    const navigate = useNavigate();
    return(
        <Card className="custom-card" style={{
                borderRadius: '12px',
                backgroundImage: `linear-gradient(185deg, rgba(73, 182, 245, 0.7), rgba(84, 10, 245, 0.7), rgba(0, 0, 0, 0.9)), url(${dollarsImage})`, // Substitua pela URL da imagem
                backgroundSize: "cover", // Faz com que a imagem cubra todo o card
                backgroundPosition: "center", // Centraliza a imagem
                backgroundRepeat: "no-repeat", // Evita repetição da imagem
            }}>
            <CardBody className="p-4 d-flex justify-content-between">
                <div className="d-flex flex-column">
                    <h4 className="mb-2" style={{color: "white"}}>EXPANDA AINDA MAIS OS SEUS NEGÓCIOS!</h4>
                    <span className="fs-16" style={{color: "white"}}>Faça upgrade agora para o plano <span style = {{
                        background: "linear-gradient(90deg, rgba(84, 10, 245, 1) 0%, rgba(73, 182, 245, 1) 100%)",
                        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.15)",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        padding: "2px 10px",
                        cursor: "pointer",
                        fontSize: "16px"
                    }}>{planName}</span></span>
                </div>
                <div className="d-flex align-items-center justify-content-center">
                    <button style={{
                        background: "linear-gradient(90deg, rgba(84, 10, 245, 1) 0%, rgba(73, 182, 245, 1) 100%)",
                        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.15)",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        padding: "10px 40px",
                        cursor: "pointer",
                        fontSize: "16px"
                    }}
                    onClick={()=> navigate(planLink)}>
                        <i className="las la-upload me-2"></i>Realizar upgrade
                    </button>
                </div>
            </CardBody>

        </Card>
    )
}


export default PlanUpgradeCard