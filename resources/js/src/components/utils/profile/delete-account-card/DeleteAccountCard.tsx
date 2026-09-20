import { FC } from "react";
import { Button, Card, CardBody } from "react-bootstrap";
import IconLogoCircle from "../../../common/icon-logo-circle/IconLogoCircle";
import { Link, useNavigate } from "react-router-dom";
import api from "@/src/lib/api";
import Swal from "sweetalert2";

interface DeleteAccountCardProps {

}

const DeleteAccountCard: FC<DeleteAccountCardProps> = () => {
    const navigate = useNavigate();

    const deleteAccount = () => {
        api.delete('/me').then(response => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            Swal.fire({
                icon: "success",
                title: 'Sucesso',
                text: "Conta excluída com sucesso",
                showDenyButton: false,
                showCancelButton: false,
                confirmButtonText: "Ok",
            }).then((result) => {
                navigate('/login');
            });
        });
    }

    const showModalDeleteAccount = () => {
        Swal.fire({
            icon: "warning",
            title: 'Atenção',
            text: "Tem certeza que deseja excluir sua conta ?",
            showCancelButton: false,
            showDenyButton: true,
            confirmButtonText: "Quero excluir",
            denyButtonText: "Não quero excluir",
        }).then((result) => {
            if (result.isConfirmed) {
                deleteAccount();
            } 
        });
    }

    return(
        <Card className="custom-card" style={{borderRadius: '12px'}}>
            <CardBody className="p-3">
                <div className="d-flex align-items-center mb-3">
                    <IconLogoCircle
                        icon = "las la-user-times" 
                        color = "245, 66, 71"
                    />
                    <div className="d-block ms-3 ">
                        <h6>Excluir Conta</h6>
                        <span className="text-muted">Deixe de ser um parceiro Scalefy e apague todos os seus dados</span>
                    </div>
                </div>
                <div className="mt-3">
                    <Button onClick={showModalDeleteAccount} style={{padding: "5px 20px" }} variant="outline-primary">
                        <i className="las la-trash me-2"></i>Excluir
                    </Button>                           
                </div>         
            </CardBody>

        </Card>
    )
}

export default DeleteAccountCard