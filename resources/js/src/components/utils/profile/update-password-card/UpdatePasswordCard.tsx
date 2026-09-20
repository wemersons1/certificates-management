import { FC } from "react";
import { Button, Card, CardBody } from "react-bootstrap";
import IconLogoCircle from "../../../common/icon-logo-circle/IconLogoCircle";
import { useNavigate } from "react-router-dom";

interface UpdatePasswordCardProps {

}

const UpdatePasswordCard: FC<UpdatePasswordCardProps> = () => {
    const navigate = useNavigate();

    return(
        <Card className="custom-card" style={{borderRadius: '12px'}}>
            <CardBody className="p-3">
                <div className="d-flex align-items-center mb-3">
                    <IconLogoCircle
                        icon = "las la-lock" 
                    />
                    <div className="d-block ms-3 ">
                        <h6>Senha</h6>
                        <span className="text-muted">Atualize a sua senha</span>
                    </div>
                </div>
                <div className="mt-3">
                    <Button style={{padding: "5px 20px" }} variant="outline-primary"
                        onClick={(e) => {
                            navigate('/update-password');
                            e.currentTarget.blur(); 
                    }} >
                        <i className="las la-edit me-2"></i>Editar
                    </Button>                       
                </div>         
            </CardBody>

        </Card>
    )
}

export default UpdatePasswordCard