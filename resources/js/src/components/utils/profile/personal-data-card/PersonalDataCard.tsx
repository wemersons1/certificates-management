import { FC } from "react"
import { Button, Card, CardBody } from "react-bootstrap"
import IconLogoCircle from "../../../common/icon-logo-circle/IconLogoCircle"
import { useNavigate } from "react-router-dom";

interface PersonalDataCardProps {
    name: string,
    email: string,
    phone: string,
}


const PersonalDataCard:FC<PersonalDataCardProps> = ({name, email, phone}) => {
    const navigate = useNavigate();

    return(
        <Card className="custom-card" style={{borderRadius: '12px'}}>
            <CardBody className="p-3">
                <div className="d-flex align-items-center mb-3">
                    <IconLogoCircle
                        icon = "las la-user" 
                    />
                    <div className="d-block ms-3 ">
                        <h6>Dados Pessoais</h6>
                        <span className="text-muted">Edite suas informações pessoais</span>
                    </div>

                </div>
                <div className="d-flex flex-column">
                    <span className="text-dark mb-1">Nome: <span className="text-muted">{name}</span></span>
                    <span className="text-dark mb-1">E-mail: <span className="text-muted">{email}</span></span>
                    <span className="text-dark mb-1">Telefone: <span className="text-muted">{phone}</span></span>
                </div>
                <div className="mt-3">
                    <Button style={{padding: "5px 20px" }} variant="outline-primary"
                        onClick={(e) => {
                            navigate('/personal-data');
                            e.currentTarget.blur(); 
                    }} >
                        <i className="las la-edit me-2"></i>Editar
                    </Button>                       
                </div>
            </CardBody>
            
        </Card>
    )
}

export default PersonalDataCard