import { FC } from "react"
import { Badge, Button, Card, CardBody } from "react-bootstrap"
import IconLogoCircle from "../../../common/icon-logo-circle/IconLogoCircle"
import { useNavigate } from "react-router-dom";
import PlanBadge from "../../plans/PlanBadge";

interface ManagePlanCardProps {
    id: number,
    name: string,
    nextBilling: string,
    ordersLimit: string,
    subscriptionDate: string,
}


const ManagePlanCard:FC<ManagePlanCardProps> = ({id, name, nextBilling, ordersLimit, subscriptionDate}) => {
    const navigate = useNavigate();

    return(
        <Card className="custom-card" style={{borderRadius: '12px'}}>
            <CardBody className="p-3">
                <div className="d-flex align-items-center mb-3">
                    <IconLogoCircle
                        icon = "las la-tag" 
                    />
                    <div className="d-block ms-3 ">
                        <h6>Gerenciar Plano</h6>
                        <span className="text-muted">Veja informações sobre seu plano atual, upgrade e mais</span>
                    </div>

                </div>
                <div className="d-flex flex-column">
                    <span className="text-dark mb-1">Plano atual: <span className="text-muted"><PlanBadge name={name}/></span></span>
                    <span className="text-dark mb-1">Data de inscrição: <span className="text-muted">{subscriptionDate}</span></span>
                    <span className="text-dark mb-1">Próxima cobrança: <span className="text-muted">{nextBilling}</span></span>
                    <span className="text-dark mb-1">Limite de pedidos: <span className="text-muted">{ordersLimit}</span></span>
                </div>
                <div className="mt-3">
                    <Button style={{padding: "5px 20px" }} variant="outline-primary"
                        onClick={(e) => {
                            navigate('/plan-management');
                            e.currentTarget.blur(); 
                    }} >
                        <i className="las la-cog me-2"></i>Gerenciar
                    </Button>                       
                </div>
            </CardBody>
            
        </Card>
    )
}

export default ManagePlanCard